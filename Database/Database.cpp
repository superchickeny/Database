#include <iostream>
#include "db_main.h"

int main()
{
	db_main* db = db_main::get_instance();
	db->start_data_persistance_thread();
	db->start_server_thread();
	db->add_table("users", {"userID", "taco", "burrito"});
	table* users = db->get_table("users");

	db_util::timed_event([users]() {
			for (int i = 0; i < 2000; i++)
			{
				users->insert(std::to_string(i), "userID", std::to_string(i));
				users->insert(std::to_string(i), "taco", std::to_string(i + 10320020));
				users->insert(std::to_string(i), "burrito", std::to_string(i + 10000));
			}		
	});
	
	for (;;); //prevents exit
}