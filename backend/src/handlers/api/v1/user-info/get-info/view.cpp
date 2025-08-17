#include "view.hpp"

#include <fmt/format.h>

#include <userver/components/component_context.hpp>
#include <userver/server/handlers/http_handler_base.hpp>
#include <userver/server/http/http_status.hpp>
#include <userver/storages/postgres/cluster.hpp>
#include <userver/storages/postgres/component.hpp>
#include <userver/utils/assert.hpp>

#include "handlers/lib/auth.hpp"
#include "models/user.hpp"

namespace lyceum_quest {

namespace {

class GetUserInfo final : public userver::server::handlers::HttpHandlerBase {
 public:
  static constexpr std::string_view kName = "handler-v1-get-user-info";

  GetUserInfo(const userver::components::ComponentConfig& config,
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
        session.value().user_id);

    if (result.IsEmpty()) {
      response.SetStatus(userver::server::http::HttpStatus::kNotFound);
      userver::formats::json::ValueBuilder answer;
      answer["detail"] = "User is not found";
      return userver::formats::json::ToString(answer.ExtractValue());
    }

    auto user = result.AsSingleRow<TUser>(userver::storages::postgres::kRowTag);
    userver::formats::json::ValueBuilder json_response;
    json_response["first_name"] = user.first_name;
    json_response["second_name"] = user.second_name;
    json_response["role"] = user.role_title;
    // Вряд ли это нужно, но пусть будет)
    json_response["status"] = user.status_title;

    return userver::formats::json::ToString(json_response.ExtractValue());
  }

 private:
  userver::storages::postgres::ClusterPtr pg_cluster_;
};

}  // namespace

void AppendGetUserInfo(userver::components::ComponentList& component_list) {
  component_list.Append<GetUserInfo>();
}

}  // namespace lyceum_quest