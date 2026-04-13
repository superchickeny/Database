#pragma once
#include <vector>
#include "table_base.h"

struct db_main
{

	static inline db_main* instance = nullptr;
	std::vector<table_base> tables;

	static const db_main* get_instance();
};