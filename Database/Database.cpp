#include <iostream>
#include "db_main.h"
#include "httplib.h"
#include "json.hpp" 

using json = nlohmann::json;

int main()
{
    db_main db{};
    std::cout << db.tables.size();
}