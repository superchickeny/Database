#pragma once
#include <vector>
#include "table_base.h"
#include "table.h"
#include <string>

enum class QueryType
{
	SELECT,
	INSERT,
	UPDATE,
	DELETE,
	UNKNOWN
};

QueryType identifyQuery(const std::string& command);

struct db_main
{

	static inline db_main* instance = nullptr;
	std::vector<table_base> tables;

	static const db_main* get_instance();
};