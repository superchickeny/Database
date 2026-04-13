#pragma once
#include <unordered_map>
#include <string>
#include "row.h"

struct table
{
	std::string name;
	std::unordered_map<std::string, row> data;
	std::vector<std::string> columns;

	table(const std::string& name, const std::vector<std::string>& column_names)
	{
		this->name = name;
		for (auto& column : column_names)
		{
			columns.push_back(column);
		}
	}

	row& insert(const std::string& primary_key, const std::string& column, const std::string& value);
};



