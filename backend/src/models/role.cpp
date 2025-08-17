#include "role.hpp"

namespace lyceum_quest {

userver::formats::json::Value TRole::Serialize() const {
  userver::formats::json::ValueBuilder role;
  role["id"] = id;
  role["title"] = title;
  return role.ExtractValue();
}

}  // namespace lyceum_quest