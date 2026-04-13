#include <iostream>
#include "db_main.h"
#include "httplib.h"

int main()
{
    db_main db{};
    std::cout << db.tables.size();
}