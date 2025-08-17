#ifndef TMANAGER_H_
#define TMANAGER_H_

#include <string>

#include <userver/formats/json/value_builder.hpp>

namespace lyceum_quest {

struct TUser {
  std::string id;
  std::string login;
  std::string password;
  std::string first_name;
  std::string second_name;
  std::string role_id;
  std::string role_title;
  std::string status_id;
  std::string status_title;
};

userver::formats::json::Value Serialize(
    const TUser& user,
    userver::formats::serialize::To<userver::formats::json::Value>);

}  // namespace lyceum_quest

#endif
