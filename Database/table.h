#pragma once
#include "table_base.h"
#include <unordered_map>
#include <string>

template<typename T>
struct table : public table_base
{
	T primary_key{};
	
	std::unordered_map<std::string, std::unordered_map<T, std::string>> data;

	table(std::vector<std::string> column_names)
	{
		for (auto& column : column_names)
		{
			data.insert(std::pair<std::string, std::unordered_map<T, std::string>>{column, {}});
		}
	}

	std::pair<T, std::string> insert(T primary_key, std::string column, std::string value);
};

template<typename T>
inline std::pair<T, std::string> table<T>::insert(T primary_key, std::string column, std::string value)
{

	auto it = data.find(column);
	if (it == data.end())
	{
		return {};
	}

	std::unordered_map<T, std::string>& column_data = it->second;
	std::pair<T, std::string> insertion_pair{ primary_key, value };
	column_data.insert(insertion_pair);

	return insertion_pair;
}
