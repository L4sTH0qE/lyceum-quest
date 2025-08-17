#include "auth.hpp"

namespace lyceum_quest {

std::optional<TSession> GetSessionInfo(
    userver::storages::postgres::ClusterPtr pg_cluster,
    const userver::server::http::HttpRequest& request) {
  if (!request.HasHeader(USER_TICKET_HEADER_NAME)) {
    return std::nullopt;
  }

  auto id = request.GetHeader(USER_TICKET_HEADER_NAME).substr(7);
  auto result =
      pg_cluster->Execute(userver::storages::postgres::ClusterHostType::kMaster,
                          "SELECT * FROM lyceum_quest.auth_session "
                          "WHERE id = $1 ",
                          id);

  if (result.IsEmpty()) {
    return std::nullopt;
  }

  // Checking if token is expired.
  auto expiration_time =
      result[0]["end_timestamp"]
          .As<std::optional<std::chrono::system_clock::time_point>>();
  if (expiration_time.value() < userver::utils::datetime::Now()) {
    return std::nullopt;
  }

  auto user_id = result[0]["user_id"].As<std::optional<std::string>>();
  auto status = pg_cluster->Execute(
      userver::storages::postgres::ClusterHostType::kMaster,
      "SELECT us.title as title "
      "FROM lyceum_quest.user AS u "
      "JOIN lyceum_quest.user_status AS us ON u.status_id = us.id "
      "WHERE u.id = $1 ",
      user_id.value());
  if (status[0]["title"].As<std::optional<std::string>>().value() !=
      "enabled") {
    return std::nullopt;
  }

  return result.AsSingleRow<TSession>(userver::storages::postgres::kRowTag);
}

}  // namespace lyceum_quest