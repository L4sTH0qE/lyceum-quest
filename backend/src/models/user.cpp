#include "user.hpp"

namespace lyceum_quest {

userver::formats::json::Value Serialize(
    const TUser& user,
    userver::formats::serialize::To<userver::formats::json::Value>) {
  userver::formats::json::ValueBuilder item;
  item["id"] = user.id;
  item["login"] = user.login;
  item["first_name"] = user.first_name;
  item["second_name"] = user.second_name;
  item["role_id"] = user.role_id;
  item["role_title"] = user.role_title;
  item["status_id"] = user.status_id;
  item["status_title"] = user.status_title;

  return item.ExtractValue();
}

}  // namespace lyceum_quest