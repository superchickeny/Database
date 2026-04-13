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

const db_main* db_main::get_instance()
{
    if (db_main::instance == nullptr)
    {
        db_main::instance = new db_main();
    }
    return db_main::instance;
}
