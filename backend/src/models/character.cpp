#include "character.hpp"

namespace lyceum_quest {

userver::formats::json::Value Serialize(
    const TCharacter& character,
    userver::formats::serialize::To<userver::formats::json::Value>) {
  userver::formats::json::ValueBuilder item;
  item["id"] = character.id;
  item["name"] = character.name;
  item["avatar"] = character.profile_picture;
  item["full_size_image"] = character.full_size_picture;

  return item.ExtractValue();
}

}  // namespace lyceum_quest