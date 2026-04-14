#include "table.h"

row& table::insert(const std::string& primary_key, const std::string& column, const std::string& value)
{

	auto it = data.find(primary_key);
	if (it == data.end())
	{
		auto [inserted_it, _] = data.emplace(primary_key, row{ primary_key, columns });
		it = inserted_it;
	}

	row& current_row = it->second;
	current_row.add_column_value(column, value);

	return current_row;
}


std::unordered_map<std::string, row>& table::select_all()
{
	return this->data;
}

/*
row& table::select(const std::string& column, const std::string& value)
{

}

std::unordered_map<std::string, row>& table::select_all(const std::string& column)
{
	
}

std::unordered_map<std::string, row>& table::select_all(const std::string& column, const std::string& value)
{
	
}
*/