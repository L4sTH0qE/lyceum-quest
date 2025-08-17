#pragma once

#include <string>

#include <userver/formats/json/value_builder.hpp>

namespace lyceum_quest {

struct TTaskXFiles {
  std::string file_id;
  std::string quest_task_id;
};

}  // namespace lyceum_quest