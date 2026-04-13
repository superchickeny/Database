#include <iostream>
#include "db_main.h"

int main()
{
    db_main db{};
    std::cout << db.tables.size();
}

