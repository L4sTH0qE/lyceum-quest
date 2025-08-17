#pragma once

#include <string>

#include <userver/formats/json/value_builder.hpp>

namespace lyceum_quest {

struct TCharacter {
  std::string id;
  std::string name;
  std::string profile_picture;
  std::string full_size_picture;
};

userver::formats::json::Value Serialize(
    const TCharacter& character,
    userver::formats::serialize::To<userver::formats::json::Value>);

}  // namespace lyceum_quest