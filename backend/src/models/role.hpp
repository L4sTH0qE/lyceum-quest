#pragma once

#include <string>

#include <userver/formats/json/value_builder.hpp>

namespace lyceum_quest {

struct TRole {
  std::string id;
  std::string title;
  userver::formats::json::Value Serialize() const;
};

}  // namespace lyceum_quest