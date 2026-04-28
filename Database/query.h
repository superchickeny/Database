#pragma once // query.h
#include <string>
#include <vector>
#include <optional>

#undef DELETE

struct queryParse {

	enum class QueryType
	{
		SELECT,
		INSERT,
		UPDATE,
		DELETE,
		CREATE,
		DROP,
		UNKNOWN
	};

	QueryType type = QueryType::UNKNOWN;

	std::string table;
	std::vector<std::string> columns;
	std::vector<std::string> values;
	std::optional<std::pair<std::string, std::string>> where;
	static QueryType identifyQuery(const std::string& command);
	static queryParse parse_query(const std::string& query);
};