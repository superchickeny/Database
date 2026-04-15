#pragma once
#include <vector>
#include "table.h"
#include <string>
#include <unordered_map>
#include <thread>
#include <iostream>
#include <chrono>
#include <shared_mutex> 
#include "json.hpp"
#include <fstream>
#include "httplib.h"
#include <sstream>

using json = nlohmann::json;

class db_util {
public:
	template<typename Func>
	static void timed_event(Func timed_function);
};

template<typename Func>
void db_util::timed_event(Func timed_function) {
	auto start = std::chrono::high_resolution_clock::now();
	timed_function();
	auto finish = std::chrono::high_resolution_clock::now();
	auto ms = std::chrono::duration_cast<std::chrono::milliseconds>(finish - start).count();
	std::cout << ms << "ms\n";
}

struct db_main
{
	
	static inline db_main* instance = nullptr; //Singleton Instance
	std::unordered_map<std::string, table> tables; //Holds all database tables key is the tables name
	std::vector<std::string> table_names; //for ease of access on the map
	std::shared_mutex mtx; //unique_lock for threads shared_lock for reads

	table& add_table(const std::string& table_name, const std::vector<std::string>& columns); //adds table to map
	table* get_table(const std::string& table_name); //returns table by name
	void delete_table(const std::string& table_name);

	bool save_data_to_file();
	void load_data_from_file();
	void create_data_file_if_missing();
	
	void start_server_thread(); //server runs here
	void start_data_persistance_thread(); //starts thread that is responsible for saving data to disk on a timer

	static db_main* get_instance(); //instance
};