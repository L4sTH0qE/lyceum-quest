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

class ChangeUserInfo final : public userver::server::handlers::HttpHandlerBase {
 public:
  static constexpr std::string_view kName = "handler-v1-change-user-info";

  ChangeUserInfo(const userver::components::ComponentConfig& config,
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

    auto request_body =
        userver::formats::json::FromString(request.RequestBody());

    if (!request_body.HasMember("new_first_name") &&
        !request_body.HasMember("new_second_name")) {
      response.SetStatus(userver::server::http::HttpStatus::kBadRequest);
      userver::formats::json::ValueBuilder result;
      result["detail"] =
          "Request body must contain new_first_name or new_second_name";
      return userver::formats::json::ToString(result.ExtractValue());
    }

    std::string first_name;
    std::string second_name;

    if (request_body.HasMember("new_first_name")) {
      first_name = request_body["new_first_name"].As<std::string>();

      if (first_name.empty()) {
        response.SetStatus(userver::server::http::HttpStatus::kBadRequest);
        userver::formats::json::ValueBuilder result;
        result["detail"] = "First name length must be not 0";
        return userver::formats::json::ToString(result.ExtractValue());
      }
    }

    if (request_body.HasMember("new_second_name")) {
      second_name = request_body["new_second_name"].As<std::string>();

      if (second_name.empty()) {
        response.SetStatus(userver::server::http::HttpStatus::kBadRequest);
        userver::formats::json::ValueBuilder result;
        result["detail"] = "Second name length must be not 0";
        return userver::formats::json::ToString(result.ExtractValue());
      }
    }

    if (!first_name.empty()) {
      pg_cluster_->Execute(
          userver::storages::postgres::ClusterHostType::kMaster,
          "UPDATE lyceum_quest.user SET first_name = $1 WHERE id = $2 ",
          first_name, session.value().user_id);
    }
    if (!second_name.empty()) {
      pg_cluster_->Execute(
          userver::storages::postgres::ClusterHostType::kMaster,
          "UPDATE lyceum_quest.user SET second_name = $1 WHERE id = $2 ",
          second_name, session.value().user_id);
    }

    return {};
  }

 private:
  userver::storages::postgres::ClusterPtr pg_cluster_;
};

}  // namespace

void AppendChangeUserInfo(userver::components::ComponentList& component_list) {
  component_list.Append<ChangeUserInfo>();
}

}  // namespace lyceum_quest