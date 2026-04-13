#include <iostream>
#include "db_main.h"
#include "httplib.h"
#include "table.h"

int main()
{
    table<std::string> table{ {"dog"}};
    auto res = table.insert("da", "dog", "balls");
    std::cout << res.first << " " << res.second;

  
}