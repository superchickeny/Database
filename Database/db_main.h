#pragma once
#include <vector>
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
	std::vector<table_base> tables;
};