#include <iostream>
#include "db_main.h"


int main()
{
	db_main* db = db_main::get_instance();
	db->load_data_from_file();
	db->start_data_persistance_thread();

	db->start_server_thread(); //shone ur shit is in here

	for (;;); //prevents exit
}