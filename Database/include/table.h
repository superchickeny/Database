#pragma once
#include "table_base.h"

template<typename T>
struct table : public table_base
{
	T primary_key{};


};

