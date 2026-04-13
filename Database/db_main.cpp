#include "db_main.h"

const db_main* db_main::get_instance()
{
    if (db_main::instance == nullptr)
    {
        db_main::instance = new db_main();
    }
    return db_main::instance;
}
