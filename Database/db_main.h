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
#include "table.h"
#include <sstream>
#include "json.hpp" 

using json = nlohmann::json;

//some random library was conflicting
#undef DELETE

enum class QueryType
{
	SELECT,
	INSERT,
	UPDATE,
	DELETE,
	UNKNOWN
};

QueryType identifyQuery(const std::string& command);

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
	
	void start_server_thread(); //server runs here
	void start_data_persistance_thread(); //starts thread that is responsible for saving data to disk on a timer

	static db_main* get_instance(); //instance
};