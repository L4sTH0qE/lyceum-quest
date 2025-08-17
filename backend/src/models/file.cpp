#include "file.hpp"

namespace lyceum_quest {

userver::formats::json::Value Serialize(
    const TFile& file,
    userver::formats::serialize::To<userver::formats::json::Value>) {
  userver::formats::json::ValueBuilder item;
  item["id"] = file.id;
  item["name"] = file.name;
  item["type"] = file.type;
  item["extension"] = file.extension;
  item["size_in_kbytes"] = file.size_in_kbytes;
  item["url"] = file.url;

  return item.ExtractValue();
}

}  // namespace lyceum_quest