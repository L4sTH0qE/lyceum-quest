#include "view.hpp"

#include <fmt/format.h>

#include <userver/components/component_context.hpp>
#include <userver/server/handlers/http_handler_base.hpp>
#include <userver/server/http/http_status.hpp>
#include <userver/storages/postgres/cluster.hpp>
#include <userver/storages/postgres/component.hpp>
#include <userver/utils/assert.hpp>

#include "handlers/lib/auth.hpp"
#include "models/quest.hpp"
#include "models/session.hpp"

namespace lyceum_quest {

namespace {

class GetAdminQuests final : public userver::server::handlers::HttpHandlerBase {
 public:
  static constexpr std::string_view kName = "handler-v1-get-admin-quests";

  GetAdminQuests(const userver::components::ComponentConfig& config,
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
    if (!session) {
      auto& response = request.GetHttpResponse();
      response.SetStatus(userver::server::http::HttpStatus::kUnauthorized);
      userver::formats::json::ValueBuilder result;
      result["detail"] = "Invalid or expired Authorization token";
      return userver::formats::json::ToString(result.ExtractValue());
    }

    auto result = pg_cluster_->Execute(
        userver::storages::postgres::ClusterHostType::kMaster,
        "SELECT * FROM lyceum_quest.quest ORDER BY create_timestamp DESC");

    userver::formats::json::ValueBuilder response;
    response.Resize(0);
    for (auto row :
         result.AsSetOf<TQuest>(userver::storages::postgres::kRowTag)) {
      response.PushBack(row);
    }
    return userver::formats::json::ToString(response.ExtractValue());
  }

 private:
  userver::storages::postgres::ClusterPtr pg_cluster_;
};

}  // namespace

void AppendGetAdminQuests(userver::components::ComponentList& component_list) {
  component_list.Append<GetAdminQuests>();
}

}  // namespace lyceum_quest