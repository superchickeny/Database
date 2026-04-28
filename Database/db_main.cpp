#include "db_main.h"
#include <sstream>	
#include <algorithm>
#include "query.h"

//adds a new table to the in-memory database with the specified name and columns, ensuring thread safety with a unique lock on the shared mutex
table& db_main::add_table(const std::string& table_name, const std::vector<std::string>& columns)
{
    std::unique_lock<std::shared_mutex> lock(mtx);
    this->table_names.push_back(table_name);
    auto [it, _] = this->tables.emplace(table_name, table{ table_name, columns });
    return it->second;
}

//retrieves a pointer to a table by name from the in-memory database, using a shared lock on the mutex to allow concurrent reads while ensuring thread safety
table* db_main::get_table(const std::string& table_name)
{
    std::shared_lock<std::shared_mutex> lock(mtx);
    auto it = tables.find(table_name);
    if (it == tables.end())
        return nullptr;

    return &it->second;
}

//deletes a table from the in-memory database by name, ensuring thread safety with a unique lock on the shared mutex
void db_main::delete_table(const std::string& table_name)
{
    std::unique_lock<std::shared_mutex> lock(mtx);
    this->tables.erase(table_name);
    this->table_names.erase(
        std::remove(this->table_names.begin(), this->table_names.end(), table_name),
        this->table_names.end());
}

//serializes the in-memory database state to a JSON file, including all tables, their columns, and data, to ensure persistence across server restarts
bool db_main::save_data_to_file()
{
    json tables = json::array();

    std::shared_lock<std::shared_mutex> lock(this->mtx);
    for (auto& [table_name, table] : this->tables)
    {

        json columns = json::array();
        for (auto& column : table.columns)
        {
            columns.push_back(column);
        }

        json data = json::array();
        for (auto& [primary_key, row] : table.data)
        {
            json row_json = json::object();
            for (auto& [column, value] : row.data)
            {
                row_json[column] = value;
            }
            data.push_back(row_json);
        }

        tables.push_back({
            {"table", table_name},
            {"columns", columns },
            {"data", data},
            {"primary_column", table.primary_key_column_name}
            });

    }

    std::ofstream file("data.json");
    if (!file.is_open())
        return false;

    file << tables;
    return true;
}

//loads the database state from a JSON file, reconstructing tables and their data into memory for use by the server
void db_main::load_data_from_file()
{
    std::ifstream file("data.json");
    if (!file.is_open() || file.peek() == std::ifstream::traits_type::eof())
        return;

    json tables_json = json::parse(file);

    for (auto& table_json : tables_json)
    {
        std::string table_name = table_json["table"];
        std::string primary_column = table_json["primary_column"];

        std::vector<std::string> columns;
        columns.push_back(primary_column);

        for (auto& column : table_json["columns"])
        {
            if (column != primary_column)
                columns.push_back(column);
        }

        this->add_table(table_name, columns);

        for (auto& row_json : table_json["data"])
        {
            std::string primary_key = row_json[primary_column];
            for (auto& [column, value] : row_json.items())
            {
                this->get_table(table_name)->insert(primary_key, column, value);
            }
        }
    }

}

//checks if the data file exists, and if not, creates an empty file to ensure the database can persist data
void db_main::create_data_file_if_missing()
{
    std::ifstream check("data.json");
    if (!check.is_open())
    {
        std::ofstream file("data.json");
    }
}

//starts the HTTP server in a separate thread, handling incoming queries and responding with JSON results
void db_main::start_server_thread()
{
    std::thread t([this]() {

        httplib::Server svr;
        //set CORS headers to allow cross-origin requests from any domain, enabling the server to be accessed by clients hosted on different origins
        svr.set_default_headers({
            {"Access-Control-Allow-Origin", "*"},
            {"Access-Control-Allow-Methods", "POST, OPTIONS"},
            {"Access-Control-Allow-Headers", "Content-Type"}
            });

        svr.Options("/query", [](const httplib::Request&, httplib::Response& res) {
            res.status = 204;
            });
        //define the POST /query endpoint to handle incoming SQL-like queries
        svr.Post("/query", [this](const httplib::Request& req, httplib::Response& res) {
            json body;
            try {
                body = json::parse(req.body);
            }

            catch (...) {
                res.status = 400;
                res.set_content("Invalid JSON format", "text/plain");
                return;
            }
            if (!body.contains("query") || !body["query"].is_string()) {
                res.status = 400;
                res.set_content("Missing or invalid 'query' field", "text/plain");
                return;
            }

            std::string q = body["query"];
            auto result = queryParse::parse_query(q);
            json response;

            switch (result.type) {
            case queryParse::QueryType::CREATE: {
                this->add_table(result.table, result.columns);
                response = { {"status", "ok"}, {"created", result.table} };
                break;
            }
                                              //for DROP, we remove the entire table from the database
            case queryParse::QueryType::DROP: {
                if (!this->get_table(result.table)) {
                    res.status = 404;
                    res.set_content("Table not found", "text/plain");
                    return;
                }
                this->delete_table(result.table);
                response = { {"status", "ok"}, {"dropped", result.table} };
                break;
            }
                                            //for INSERT, we assume the first column is the primary key and the first value is the primary key value
            case queryParse::QueryType::INSERT: {
                table* t = this->get_table(result.table);
                if (!t) { res.status = 404; res.set_content("Table not found", "text/plain"); return; }
                const std::string& pk = result.values[0];
                for (size_t i = 0; i < result.columns.size(); i++) {
                    t->insert(pk, result.columns[i], result.values[i]);
                }
                response = { {"status", "ok"}, {"inserted", pk} };
                break;
            }
                                              //for SELECT, we return all rows that match the optional WHERE clause
            case queryParse::QueryType::SELECT: {
                table* t = this->get_table(result.table);
                if (!t) { res.status = 404; res.set_content("Table not found", "text/plain"); return; }
                json rows = json::array();
                for (auto& [pk, row] : t->select_all()) {
                    if (result.where) {
                        auto it = row.data.find(result.where->first);
                        if (it == row.data.end() || it->second != result.where->second) continue;
                    }
                    json r;
                    for (auto& [col, val] : row.data) r[col] = val;
                    rows.push_back(r);
                }
                response = { {"status", "ok"}, {"rows", rows} };
                break;
            }
                                              //for UPDATE, we update all rows that match the optional WHERE clause with the new column values
            case queryParse::QueryType::UPDATE: {
                table* t = this->get_table(result.table);
                if (!t) { res.status = 404; res.set_content("Table not found", "text/plain"); return; }
                int updated = 0;
                for (auto& [pk, row] : t->select_all()) {
                    if (result.where) {
                        auto it = row.data.find(result.where->first);
                        if (it == row.data.end() || it->second != result.where->second) continue;
                    }
                    row.add_column_value(result.columns[0], result.values[0]);
                    updated++;
                }
                response = { {"status", "ok"}, {"updated", updated} };
                break;
            }
                                              //for DELETE, we delete all rows that match the optional WHERE clause
            case queryParse::QueryType::DELETE: {
                table* t = this->get_table(result.table);
                if (!t) { res.status = 404; res.set_content("Table not found", "text/plain"); return; }
                int deleted = 0;
                for (auto it = t->data.begin(); it != t->data.end(); ) {
                    bool match = true;
                    if (result.where) {
                        auto col_it = it->second.data.find(result.where->first);
                        match = (col_it != it->second.data.end() && col_it->second == result.where->second);
                    }
                    if (match) { it = t->data.erase(it); deleted++; }
                    else ++it;
                }
                response = { {"status", "ok"}, {"deleted", deleted} };
                break;
            }


                                              //for unknown query types, we return a 400 Bad Request error
            default: {
                res.status = 400;
                res.set_content("Unknown query type", "text/plain");
                return;
            }
            }

            res.set_content(response.dump(2), "application/json");
            });

        std::cout << "Server is running on http://localhost:4000" << std::endl;
        svr.listen("localhost", 4000);
        });
    t.detach();
}

//starts a background thread that periodically saves the in-memory database state to a file every 15 seconds
void db_main::start_data_persistance_thread()
{
    std::thread t([this]() {
        do {
            std::this_thread::sleep_for(std::chrono::seconds(15));
            if (this->save_data_to_file())
                std::cout << "Save Complete" << "\n";
            else
                std::cout << "Save Failed" << "\n";
        } while (true);
        });

    t.detach();
}

//singleton pattern implementation to ensure only one instance of db_main exists, and it loads data from file on first access
db_main* db_main::get_instance()
{
    if (db_main::instance == nullptr)
    {
        db_main::instance = new db_main();
    }

    db_main::instance->create_data_file_if_missing();
    db_main::instance->load_data_from_file();

    return db_main::instance;
}