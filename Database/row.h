#pragma once
#include  <string>
#include <vector>
#include <unordered_map>

struct row
{
	std::string primary_key{};

	std::unordered_map<std::string, std::string> data;
	std::string get_column_value(std::string column);
	bool add_column_value(std::string column, std::string value);

	row(std::string primary_key, std::vector<std::string> columns)
	{
		this->primary_key = primary_key;

		for (auto& column : columns)
		{
			data.insert(std::pair<std::string, std::string>{column, {}});
		}
	}
};

