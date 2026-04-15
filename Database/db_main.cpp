#include "db_main.h"
#include <sstream>	
#include "query.h"

table& db_main::add_table(const std::string& table_name, const std::vector<std::string>& columns)
{
	std::unique_lock<std::shared_mutex> lock(mtx);
	this->table_names.push_back(table_name);
	auto [it, _] = this->tables.emplace(table_name, table{table_name, columns });
	return it->second;
}

table* db_main::get_table(const std::string& table_name)
{
	std::shared_lock<std::shared_mutex> lock(mtx); 
	auto it = tables.find(table_name);
	if (it == tables.end())
		return nullptr;

	return &it->second;
}

void db_main::delete_table(const std::string& table_name)
{
	std::unique_lock<std::shared_mutex> lock(mtx);
	this->tables.erase(table_name);
}

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
			if(column != primary_column)
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

void db_main::create_data_file_if_missing()
{
	std::ifstream check("data.json");
	if (!check.is_open())
	{
		std::ofstream file("data.json");
	}
}

void db_main::start_server_thread()
{
	std::thread t([this]() {

		httplib::Server svr;

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
			// validate query
			if (!body.contains("query") || !body["query"].is_string()) {
				res.status = 400;
				res.set_content("Missing or invalid 'query' field", "text/plain");
				return;
			}
			std::string q = body["query"];
			auto result = queryParse::parse_query(q);

			std::cout << "Query: " << q << std::endl;
			std::cout << "Type: " << static_cast<int>(result.type) << std::endl;
			std::cout << "Table: " << result.table << std::endl;
			for (auto& col : result.columns) std::cout << "Col: " << col << std::endl;
			for (auto& val : result.values) std::cout << "Val: " << val << std::endl;
			if (result.where) std::cout << "Where: " << result.where->first << " = " << result.where->second << std::endl;
			std::cout << "---" << std::endl;
			res.set_content("Query received and processed", "text/plain");
			});
		std::cout << "Server is running on http://localhost:4000" << std::endl;
		svr.listen("localhost", 4000);

	});

	t.detach();
}

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