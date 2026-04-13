#pragma once
#include <vector>
#include "table.h"
#include <string>
#include <unordered_map>
#include <thread>
#include <iostream>
#include <chrono>
#include <mutex>

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
	std::mutex mtx; //lock when reading or modifying data accross threads

	table& add_table(const std::string& table_name, const std::vector<std::string>& columns); //adds table to map
	table* get_table(const std::string& table_name); //returns table by name

	void start_data_persistance_thread(); //starts thread that is responsible for saving data to disk on a timer
	static db_main* get_instance(); //instance
};