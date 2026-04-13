#include "db_main.h"
#include <sstream>	

QueryType identifyQuery(const std::string& command)
{
	if (command == "SELECT") return QueryType::SELECT;
	if (command == "INSERT") return QueryType::INSERT;
	if (command == "UPDATE") return QueryType::UPDATE;
	if (command == "DELETE") return QueryType::DELETE;
	return QueryType::UNKNOWN;
}

table& db_main::add_table(const std::string& table_name, const std::vector<std::string>& columns)
{
	std::lock_guard<std::mutex> lock(mtx);
	this->table_names.push_back(table_name);
	auto [it, _] = this->tables.emplace(table_name, table{table_name, columns });
	return it->second;
}

table* db_main::get_table(const std::string& table_name)
{
	std::lock_guard<std::mutex> lock(mtx);
	auto it = tables.find(table_name);
	if (it == tables.end())
		return nullptr;

	return &it->second;
}

void db_main::start_data_persistance_thread()
{
	std::thread t([this]() {
		
		do {

			std::this_thread::sleep_for(std::chrono::seconds(5));

			std::lock_guard<std::mutex> lock(this->mtx);
			std::cout << "Current tables at saved time: \n\n";
			for (auto& table_name : this->table_names) 
			{
				auto it = this->tables.find(table_name);
				table& table = it->second;
				std::cout << "Table name: " << table.name << "\nRow count: " << table.data.size() << "\n";
				
				std::vector<row*> rows;
				for (auto& [primary_key, current_row] : table.data)
				{
					rows.push_back(&current_row);
				}

				for (row* row : rows)
				{
					std::cout << "	Primary key: " << row->primary_key << " | ";
					for (auto& col : table.columns)
					{
						std::cout << "	" << col << ": " << row->get_column_value(col) << " |";
					}
					std::cout << "\n";
				}
				std::cout << "\n";
			}

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
    return db_main::instance;
}
