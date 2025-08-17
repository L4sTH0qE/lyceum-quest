#include "user_status.hpp"

namespace lyceum_quest {

userver::formats::json::Value TUserStatus::Serialize() const {
  userver::formats::json::ValueBuilder user_status;
  user_status["id"] = id;
  user_status["title"] = title;
  return user_status.ExtractValue();
}

}  // namespace lyceum_quest