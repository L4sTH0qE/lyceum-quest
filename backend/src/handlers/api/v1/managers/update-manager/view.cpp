#include "view.hpp"

#include <fmt/format.h>

#include <string>
#include <userver/components/component_context.hpp>
#include <userver/server/handlers/http_handler_base.hpp>
#include <userver/server/http/http_status.hpp>
#include <userver/storages/postgres/cluster.hpp>
#include <userver/storages/postgres/component.hpp>
#include <userver/utils/assert.hpp>

#include "handlers/lib/auth.hpp"
#include "handlers/lib/check_admin.hpp"
#include "models/session.hpp"
#include "models/user.hpp"

namespace lyceum_quest {

namespace {

class UpdateManager final : public userver::server::handlers::HttpHandlerBase {
 public:
  static constexpr std::string_view kName = "handler-v1-update-manager";

  UpdateManager(const userver::components::ComponentConfig& config,
                const userver::components::ComponentContext& component_context)
      : HttpHandlerBase(config, component_context),
        pg_cluster_(
            component_context
                .FindComponent<userver::components::Postgres>("postgres-db-1")
                .GetCluster()) {}

  std::string HandleRequestThrow(
      const userver::server::http::HttpRequest& request,
      userver::server::request::RequestContext&) const override {
    auto session = lyceum_quest::GetSessionInfo(pg_cluster_, request);
    auto& response = request.GetHttpResponse();

    if (!session) {
      response.SetStatus(userver::server::http::HttpStatus::kUnauthorized);
      userver::formats::json::ValueBuilder result;
      result["detail"] = "Invalid or expired Authorization token";
      return userver::formats::json::ToString(result.ExtractValue());
    }

    auto is_admin =
        lyceum_quest::CheckAdmin(pg_cluster_, session.value().user_id);
    if (!is_admin) {
      response.SetStatus(userver::server::http::HttpStatus::kUnauthorized);
      userver::formats::json::ValueBuilder result;
      result["detail"] = "Not an admin";
      return userver::formats::json::ToString(result.ExtractValue());
    }

    const auto& id = request.GetPathArg("id");

    auto result = pg_cluster_->Execute(
        userver::storages::postgres::ClusterHostType::kMaster,
        "SELECT u.id as id, u.login as login, u.password as password, "
        "u.first_name as first_name, u.second_name as second_name, ur.id as "
        "role_id, ur.title as "
        "role_title, us.id as status_id, us.title as status_title "
        "FROM lyceum_quest.user as u "
        "JOIN lyceum_quest.user_role AS ur ON u.role_id = ur.id "
        "JOIN lyceum_quest.user_status AS us ON u.status_id = us.id "
        "WHERE u.id = $1 ",
        id);

    if (result.IsEmpty()) {
      response.SetStatus(userver::server::http::HttpStatus::kNotFound);
      userver::formats::json::ValueBuilder answer;
      answer["detail"] = "Manager is not found";
      return userver::formats::json::ToString(answer.ExtractValue());
    }

    bool check_id = lyceum_quest::CheckUpdateManager(pg_cluster_, request, id);
    if (!check_id) {
      response.SetStatus(userver::server::http::HttpStatus::kNotFound);
      userver::formats::json::ValueBuilder answer;
      answer["detail"] = "You cannot update yourself";
      return userver::formats::json::ToString(answer.ExtractValue());
    }

    auto user = result.AsSingleRow<TUser>(userver::storages::postgres::kRowTag);

    std::string status_id = user.status_id;
    std::string role_id = user.role_id;

    auto request_body =
        userver::formats::json::FromString(request.RequestBody());

    if (request_body.HasMember("status_id")) {
      auto old_status = pg_cluster_->Execute(
          userver::storages::postgres::ClusterHostType::kMaster,
          "SELECT * FROM lyceum_quest.user_status "
          "WHERE id = $1 ",
          status_id);
      auto old_status_title =
          old_status[0]["title"].As<std::optional<std::string>>().value();
      auto new_status_id =
          request_body["status_id"].As<std::optional<std::string>>().value();
      auto new_status = pg_cluster_->Execute(
          userver::storages::postgres::ClusterHostType::kMaster,
          "SELECT * FROM lyceum_quest.user_status "
          "WHERE id = $1 ",
          new_status_id);
      if (new_status.IsEmpty()) {
        response.SetStatus(userver::server::http::HttpStatus::kBadRequest);
        userver::formats::json::ValueBuilder answer;
        answer["detail"] = "Invalid status";
        return userver::formats::json::ToString(answer.ExtractValue());
      }

      auto new_status_title =
          new_status[0]["title"].As<std::optional<std::string>>().value();
      if (old_status_title == "waiting" && new_status_title != "waiting") {
        response.SetStatus(userver::server::http::HttpStatus::kBadRequest);
        userver::formats::json::ValueBuilder answer;
        answer["detail"] = "Invalid status";
        return userver::formats::json::ToString(answer.ExtractValue());
      }
      if (old_status_title != "waiting" && new_status_title == "waiting") {
        response.SetStatus(userver::server::http::HttpStatus::kBadRequest);
        userver::formats::json::ValueBuilder answer;
        answer["detail"] = "Invalid status";
        return userver::formats::json::ToString(answer.ExtractValue());
      }
      status_id = new_status_id;

      if (new_status_title == "disabled") {
        pg_cluster_->Execute(
            userver::storages::postgres::ClusterHostType::kMaster,
            "DELETE FROM lyceum_quest.auth_session "
            "USING lyceum_quest.user AS u "
            "WHERE u.id = $1 "
            "AND auth_session.user_id = u.id",
            id);
      }
    }
    if (request_body.HasMember("role_id")) {
      auto new_role_id =
          request_body["role_id"].As<std::optional<std::string>>().value();
      auto new_role = pg_cluster_->Execute(
          userver::storages::postgres::ClusterHostType::kMaster,
          "SELECT * FROM lyceum_quest.user_role "
          "WHERE id = $1 ",
          new_role_id);
      if (new_role.IsEmpty()) {
        response.SetStatus(userver::server::http::HttpStatus::kBadRequest);
        userver::formats::json::ValueBuilder answer;
        answer["detail"] = "Invalid role";
        return userver::formats::json::ToString(answer.ExtractValue());
      }
      role_id = new_role_id;
    }

    result = pg_cluster_->Execute(
        userver::storages::postgres::ClusterHostType::kMaster,
        "UPDATE lyceum_quest.user "
        "SET status_id = $2, role_id = $3 "
        "WHERE id = $1 ",
        id, status_id, role_id);

    user.status_id = status_id;
    user.role_id = role_id;

    return userver::formats::json::ToString(
        userver::formats::json::ValueBuilder{user}.ExtractValue());
  }

 private:
  userver::storages::postgres::ClusterPtr pg_cluster_;
};

}  // namespace

void AppendUpdateManager(userver::components::ComponentList& component_list) {
  component_list.Append<UpdateManager>();
}

bool CheckUpdateManager(userver::storages::postgres::ClusterPtr pg_cluster_,
                        const userver::server::http::HttpRequest& request,
                        std::string user_id) {
  auto session_id = request.GetHeader("Authorization").substr(7);
  auto check_id = pg_cluster_->Execute(
      userver::storages::postgres::ClusterHostType::kMaster,
      "SELECT u.id as user_id "
      "FROM lyceum_quest.auth_session AS au "
      "JOIN lyceum_quest.user AS u ON u.id = au.user_id "
      "WHERE au.id = $1 ",
      session_id);

  auto u_id = check_id[0]["user_id"].As<std::optional<std::string>>().value();

  if (user_id != u_id) {
    return true;
  }
  return false;
}

}  // namespace lyceum_quest