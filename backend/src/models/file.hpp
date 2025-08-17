#pragma once

#include <string>

#include <userver/formats/json/value_builder.hpp>

namespace lyceum_quest {

struct TFile {
  std::string id;
  std::string name;
  std::string type;
  std::string extension;
  int size_in_kbytes;
  std::string url;
};

userver::formats::json::Value Serialize(
    const TFile& file,
    userver::formats::serialize::To<userver::formats::json::Value>);

}  // namespace lyceum_quest
