#include "row.h"

std::string row::get_column_value(std::string column)
{
	auto it = data.find(column);
	if (it == data.end())
	{
		return {};
	}

	return it->second;
}

bool row::add_column_value(std::string column, std::string value)
{
	auto it = data.find(column);
	if (it == data.end())
	{
		return false;
	}

	std::string& current_value = it->second;
	current_value = value;

	return true;
}