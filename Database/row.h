#pragma once

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

inline std::string row::get_column_value(std::string column)
{
	auto it = data.find(column);
	if (it == data.end())
	{
		return {};
	}

	return it->second;
}

inline bool row::add_column_value(std::string column, std::string value)
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
