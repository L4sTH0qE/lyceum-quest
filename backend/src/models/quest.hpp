#pragma once

#include <string>

#include <userver/formats/json/value_builder.hpp>

namespace lyceum_quest {

struct TQuest {
  std::string id;
  std::string user_id;
  std::string name;
  bool is_available;
  std::optional<std::string> public_beautiful_name;
};

userver::formats::json::Value Serialize(
    const TQuest& quest,
    userver::formats::serialize::To<userver::formats::json::Value>);

}  // namespace lyceum_quest