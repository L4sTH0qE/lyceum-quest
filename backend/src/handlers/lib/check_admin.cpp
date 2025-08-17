#include "check_admin.hpp"
#include <userver/server/http/http_request.hpp>

namespace lyceum_quest {

bool CheckAdmin(userver::storages::postgres::ClusterPtr pg_cluster,
                std::string user_id) {
  auto tmp_role = pg_cluster->Execute(
      userver::storages::postgres::ClusterHostType::kMaster,
      "SELECT ur.title as title "
      "FROM lyceum_quest.user AS u "
      "JOIN lyceum_quest.user_role AS ur ON u.role_id = ur.id "
      "WHERE u.id = $1 ",
      user_id);

  if (tmp_role[0]["title"].As<std::optional<std::string>>().value() !=
      "admin") {
    return false;
  }
  return true;
}

}  // namespace lyceum_quest