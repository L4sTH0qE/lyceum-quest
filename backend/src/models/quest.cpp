#include "quest.hpp"

namespace lyceum_quest {

userver::formats::json::Value Serialize(
    const TQuest& quest,
    userver::formats::serialize::To<userver::formats::json::Value>) {
  userver::formats::json::ValueBuilder item;
  item["id"] = quest.id;
  item["user_id"] = quest.user_id;
  item["name"] = quest.name;
  item["is_available"] = quest.is_available;
  item["public_beautiful_name"] =
      quest.public_beautiful_name.value_or(quest.name);

  return item.ExtractValue();
}

}  // namespace lyceum_quest