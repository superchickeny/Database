#include "query.h"
#include <sstream>
#include <cctype>
#include <algorithm>

namespace {
	//convert a string to uppercase
	std::string to_upper(std::string s) {
		std::transform(s.begin(), s.end(), s.begin(),
			[](unsigned char c) { return static_cast<char>(std::toupper(c)); });
		return s;
	}

	//trim whitespace from both ends of a string
	std::string trim(const std::string& s) {
		size_t start = s.find_first_not_of(" \t\n\r");
		size_t end = s.find_last_not_of(" \t\n\r");
		return (start == std::string::npos) ? "" : s.substr(start, end - start + 1);
	}

	//split a string by commas, respecting quoted substrings
	std::vector<std::string> split_list(const std::string& s) {
		std::vector<std::string> out;
		std::string curr;
		bool in_quotes = false;

		for (size_t i = 0; i < s.size(); ++i) {
			char c = s[i];
			if (c == '\'') {
				in_quotes = !in_quotes;
			}
			else if (c == ',' && !in_quotes) {
				out.push_back(trim(curr));
				curr.clear();
			}
			else {
				curr += c;
			}
		}
		if (!curr.empty()) {
			out.push_back(trim(curr));
		}
		return out;
	}

	//read a parenthesized list of items, respecting quoted substrings
	bool read_parenthesis(std::istringstream& iss, std::string& out) {
		char c;
		iss >> std::ws;
		if (!(iss.get(c)) || c != '(') {
			return false;
		}
		out.clear();
		bool in_quotes = false;
		while (iss.get(c)) {
			if (c == '\'') { in_quotes = !in_quotes; }
			else if (c == ')' && !in_quotes) { return true; }
			out += c;
		}
		return false;
	}

	//read a token, optionally converting it to uppercase
	bool read_token(std::istringstream& iss, std::string& out, bool uppercase = false) {
		if (!(iss >> out)) { return false; }
		if (uppercase) { out = to_upper(out); }
		return true;
	}

	//read a value, which can be either a simple token or a quoted string
	bool read_value(std::istringstream& iss, std::string& out) {
		iss >> std::ws;
		char c = iss.peek();
		if (c == '\'') {
			iss.get(c); // consume opening quote
			out.clear();
			while (iss.get(c) && c != '\'') out += c;
			return true;
		}
		return static_cast<bool>(iss >> out);
	}

	//expect a specific keyword (case-insensitive). Returns true on match.
	bool expect_keyword(std::istringstream& iss, const std::string& expected) {
		std::string kw;
		return read_token(iss, kw, true) && kw == expected;
	}

	//parse a WHERE clause body: "column = value" (the WHERE keyword is consumed by the caller)
	bool parse_where(std::istringstream& iss, std::pair<std::string, std::string>& where) {
		std::string eq;
		if (!read_token(iss, where.first)) return false;     // col
		if (!read_token(iss, eq) || eq != "=") return false; // =
		if (!read_value(iss, where.second)) return false;    // value
		return true;
	}

	//parse an optional trailing WHERE clause. Returns true if either:
	bool parse_optional_where(std::istringstream& iss,
		std::optional<std::pair<std::string, std::string>>& where_out) {
		std::string maybe_where;
		if (!read_token(iss, maybe_where, true)) return true; //no more tokens
		if (maybe_where != "WHERE") return true;              //trailing junk; treat as absent
		std::pair<std::string, std::string> w;
		if (!parse_where(iss, w)) return false;
		where_out = w;
		return true;
	}

	//each parser populates `out` and sets `out.type` only on success.
	//on failure, `out.type` is left as UNKNOWN.
	void parse_create(std::istringstream& iss, queryParse& out) {
		if (!expect_keyword(iss, "TABLE")) return;
		if (!read_token(iss, out.table)) return;

		std::string columns_str;
		if (!read_parenthesis(iss, columns_str)) return;

		out.columns = split_list(columns_str);
		out.type = queryParse::QueryType::CREATE;
	}

	void parse_select(std::istringstream& iss, queryParse& out) {
		std::string star;
		if (!read_token(iss, star) || star != "*") return;
		if (!expect_keyword(iss, "FROM")) return;
		if (!read_token(iss, out.table)) return;

		if (!parse_optional_where(iss, out.where)) return;

		out.type = queryParse::QueryType::SELECT;
	}

	void parse_insert(std::istringstream& iss, queryParse& out) {
		if (!expect_keyword(iss, "INTO")) return;
		if (!read_token(iss, out.table)) return;

		std::string cols_str, vals_str;
		if (!read_parenthesis(iss, cols_str)) return;
		if (!expect_keyword(iss, "VALUES")) return;
		if (!read_parenthesis(iss, vals_str)) return;

		out.columns = split_list(cols_str);
		out.values = split_list(vals_str);
		out.type = queryParse::QueryType::INSERT;
	}

	void parse_update(std::istringstream& iss, queryParse& out) {
		if (!read_token(iss, out.table)) return;
		if (!expect_keyword(iss, "SET")) return;

		std::string col, eq, val;
		if (!read_token(iss, col)) return;
		if (!read_token(iss, eq) || eq != "=") return;
		if (!read_value(iss, val)) return;

		out.columns = { col };
		out.values = { val };

		if (!parse_optional_where(iss, out.where)) return;

		out.type = queryParse::QueryType::UPDATE;
	}

	void parse_delete(std::istringstream& iss, queryParse& out) {
		if (!expect_keyword(iss, "FROM")) return;
		if (!read_token(iss, out.table)) return;

		if (!parse_optional_where(iss, out.where)) return;

		out.type = queryParse::QueryType::DELETE;
	}

	void parse_drop(std::istringstream& iss, queryParse& out) {
		if (!expect_keyword(iss, "TABLE")) return;
		if (!read_token(iss, out.table)) return;
		out.type = queryParse::QueryType::DROP;
	}
}

//identify the query type based on the leading keyword
queryParse::QueryType queryParse::identifyQuery(const std::string& command) {
	if (command == "CREATE") return QueryType::CREATE;
	if (command == "SELECT") return QueryType::SELECT;
	if (command == "INSERT") return QueryType::INSERT;
	if (command == "UPDATE") return QueryType::UPDATE;
	if (command == "DELETE") return QueryType::DELETE;
	if (command == "DROP") return QueryType::DROP;
	return QueryType::UNKNOWN;
}

//parse a SQL-like query string into a structured queryParse object.
//acts as a dispatcher to the per-query-type parsers above.
queryParse queryParse::parse_query(const std::string& query) {
	queryParse out;
	std::istringstream iss(query);

	std::string command;
	if (!read_token(iss, command, true)) return out;

	switch (identifyQuery(command)) {
	case QueryType::CREATE: parse_create(iss, out); break;
	case QueryType::SELECT: parse_select(iss, out); break;
	case QueryType::INSERT: parse_insert(iss, out); break;
	case QueryType::UPDATE: parse_update(iss, out); break;
	case QueryType::DELETE: parse_delete(iss, out); break;
	case QueryType::DROP: parse_drop(iss, out);   break;
	default: break;
	}
	return out;
}