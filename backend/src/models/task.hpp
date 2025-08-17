#pragma once

#include <string>

#include <userver/formats/json/value_builder.hpp>

namespace lyceum_quest {

struct TTask {
  std::string id;
  std::string quest_id;
  std::string order_id;
  bool is_first;
  std::string quest_task_type_id;
  std::string data;
  std::optional<std::string> character_id;
  std::string author;
};

userver::formats::json::Value Serialize(
    const TTask& task,
    userver::formats::serialize::To<userver::formats::json::Value>);

}  // namespace lyceum_quest