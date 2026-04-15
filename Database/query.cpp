#include "query.h"
#include <sstream>
#include <cctype>
#include <algorithm>

namespace {
	// Helper function to convert a string to uppercase
	std::string to_upper(std::string s) {
		std::transform(s.begin(), s.end(), s.begin(),
			[](unsigned char c) { return static_cast<char>(std::toupper(c)); });
		return s;
	}

	// Helper function to trim whitespace from both ends of a string
	std::string trim(const std::string& s) {
		size_t start = s.find_first_not_of(" \t\n\r");
		size_t end = s.find_last_not_of(" \t\n\r");
		return (start == std::string::npos) ? "" : s.substr(start, end - start + 1);
	}

	// Helper function to split a string by commas, respecting quoted substrings
	std::vector<std::string> split_list(const std::string& s) {
		std::vector<std::string> out;
		std::string curr;
		bool in_quotes = false;
		int i = 0;

		while (i < s.size()) {
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
			++i;
		}
		if (!curr.empty()) {
			out.push_back(trim(curr));
		}
		return out;
	}

	// Helper function to read a parenthesized list of items, respecting quoted substrings
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

	// Helper function to read a token, optionally converting it to uppercase
	bool read_token (std::istringstream& iss, std::string& out, bool uppercase = false) {
		if (!(iss >> out)) { return false; }
		if (uppercase) { out = to_upper(out); }
		return true;
	}

	// Helper function to read a value, which can be either a simple token or a quoted string
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

	// Helper function to parse a WHERE clause of the form "WHERE column = value"
	bool parse_where(std::istringstream& iss, std::pair<std::string, std::string>& where) {
		std::string eq;
		if (!read_token(iss, where.first)) return false;     // col
		if (!read_token(iss, eq) || eq != "=") return false; // =
		if (!read_value(iss, where.second)) return false;    // value
		return true;
	}
}

// Main function to identify the query type based on the first keyword
queryParse::QueryType queryParse::identifyQuery(const std::string& command) {
	if (command == "CREATE") return QueryType::CREATE;
	if (command == "SELECT") return QueryType::SELECT;
	if (command == "INSERT") return QueryType::INSERT;
	if (command == "UPDATE") return QueryType::UPDATE;
	if (command == "DELETE") return QueryType::DELETE;
	return QueryType::UNKNOWN;
}

// Main function to parse a SQL-like query string into a structured queryParse object
queryParse queryParse::parse_query(const std::string& query) {
	queryParse out;
	std::istringstream iss(query);

	// Read the first token to identify the query type
	std::string command;
	if (!read_token(iss, command, true)) return out; // Invalid query

	switch (identifyQuery(command)) {
	case QueryType::CREATE: {
		std::string table_kw;
		if (!read_token(iss, table_kw, true) || table_kw != "TABLE") return out;
		if (!read_token(iss, out.table)) return out;
		std::string columns_str;
		if (!read_parenthesis(iss, columns_str)) return out;
		out.columns = split_list(columns_str);
		out.type = QueryType::CREATE;
		break;
	}
	case QueryType::SELECT: {
		std::string star, kw;
		if (!read_token(iss, star) || star != "*") return out;
		if (!read_token(iss, kw, true) || kw != "FROM") return out;
		if (!read_token(iss, out.table)) return out;
		// optional WHERE
		std::string maybe_where;
		if (read_token(iss, maybe_where, true) && maybe_where == "WHERE") {
			std::pair<std::string, std::string> w;
			if (!parse_where(iss, w)) return out;
			out.where = w;
		}
		out.type = QueryType::SELECT;
		break;
	}
	case QueryType::INSERT: {
		std::string kw;
		if (!read_token(iss, kw, true) || kw != "INTO") return out;
		if (!read_token(iss, out.table)) return out;
		std::string cols_str, vals_str;
		if (!read_parenthesis(iss, cols_str)) return out;
		if (!read_token(iss, kw, true) || kw != "VALUES") return out;
		if (!read_parenthesis(iss, vals_str)) return out;
		out.columns = split_list(cols_str);
		out.values = split_list(vals_str);
		out.type = QueryType::INSERT;
		break;
	}
	case QueryType::UPDATE: {
		std::string kw;
		if (!read_token(iss, out.table)) return out; // read table name
		if (!read_token(iss, kw, true) || kw != "SET") return out;
		std::string col, eq, val;
		if (!read_token(iss, col)) return out;
		if (!read_token(iss, eq) || eq != "=") return out;
		if (!read_value(iss, val)) return out;
		out.columns = { col };
		out.values = { val };
		// optional WHERE
		std::string maybe_where;
		if (read_token(iss, maybe_where, true) && maybe_where == "WHERE") {
			std::pair<std::string, std::string> w;
			if (!parse_where(iss, w)) return out;
			out.where = w;
		}
		out.type = QueryType::UPDATE;
		break;
	}
	case QueryType::DELETE: {
		std::string kw;
		if (!read_token(iss, kw, true) || kw != "FROM") return out;
		if (!read_token(iss, out.table)) return out;
		// optional WHERE
		std::string maybe_where;
		if (read_token(iss, maybe_where, true) && maybe_where == "WHERE") {
			std::pair<std::string, std::string> w;
			if (!parse_where(iss, w)) return out;
			out.where = w;
		}
		out.type = QueryType::DELETE;
		break;
	}
	default:
		break;
	}
	return out;
}