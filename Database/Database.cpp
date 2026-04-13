#include <iostream>
#include "db_main.h"
#include "httplib.h"
#include "table.h"
#include <sstream>
#include "json.hpp" 

using json = nlohmann::json;

int main()
{
	db_main* db = db_main::get_instance();
	db->start_data_persistance_thread();

	db->add_table("testing", { "first_name", "last_name"});
	table* table = db->get_table("testing");
	table->insert("1", "first_name", "bob");
	table->insert("2", "first_name", "dog");
	table->insert("3", "first_name", "shane");
  
	table->insert("1", "last_name", "goatman");
	table->insert("2", "last_name", "walrus");
	table->insert("3", "last_name", "fatass");

	httplib::Server svr;

	svr.Post("/query", [](const httplib::Request& req, httplib::Response& res) {
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
		std::istringstream iss(q);
		std::string command, from, table, star;
		iss >> command >> star >> from >> table;
		std::cout << "Identified query type: " << static_cast<int>(identifyQuery(command)) << std::endl;	
		res.set_content("Query received and processed", "text/plain");
	});
	std::cout << "Server is running on http://localhost:8080" << std::endl;
	svr.listen("localhost", 8080);
}