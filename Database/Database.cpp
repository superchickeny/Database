#include <iostream>
#include "db_main.h"

int main()
{
	db_main* db = db_main::get_instance();
	db->start_data_persistance_thread();
	db->start_server_thread(); //shone ur shit is in here

	db->add_table("users", {"userID"});
	table* users = db->get_table("users");
	for (auto& [key, row] : users->select_all())
	{
		std::cout << key << "\n";
	}

	db_util::timed_event([users]() {

			users->insert("1", "userID", "1");
			
		});
	
	for (;;); //prevents exit
}