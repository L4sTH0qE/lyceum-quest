#include "view.hpp"

#include <fmt/format.h>

#include <tuple>
#include <userver/components/component_context.hpp>
#include <userver/server/handlers/http_handler_base.hpp>
#include <userver/server/http/http_status.hpp>
#include <userver/storages/postgres/cluster.hpp>
#include <userver/storages/postgres/component.hpp>
#include <userver/utils/assert.hpp>

namespace lyceum_quest {

namespace {

class GetCities final : public userver::server::handlers::HttpHandlerBase {
 public:
  static constexpr std::string_view kName = "handler-v1-get-cities";

  GetCities(const userver::components::ComponentConfig& config,
            const userver::components::ComponentContext& component_context)
      : HttpHandlerBase(config, component_context),
        pg_cluster_(
            component_context
                .FindComponent<userver::components::Postgres>("postgres-db-1")
                .GetCluster()) {}

  std::string HandleRequestThrow(
      const userver::server::http::HttpRequest& request,
      userver::server::request::RequestContext&) const override {
    auto result = pg_cluster_->Execute(
        userver::storages::postgres::ClusterHostType::kMaster,
        "SELECT * FROM lyceum_quest.city ");

    userver::formats::json::ValueBuilder response;
    response.Resize(0);

    for (auto row : result) {
      userver::formats::json::ValueBuilder city_info;
      auto tuple = row.As<std::tuple<std::string, std::string, bool>>(
          userver::storages::postgres::kRowTag);
      city_info["city_id"] = std::get<0>(tuple);
      city_info["name"] = std::get<1>(tuple);
      city_info["has_lyceum"] = std::get<2>(tuple);
      response.PushBack(std::move(city_info));
    }

    return userver::formats::json::ToString(response.ExtractValue());
  }

 private:
  userver::storages::postgres::ClusterPtr pg_cluster_;
};

}  // namespace

void AppendGetCities(userver::components::ComponentList& component_list) {
  component_list.Append<GetCities>();
}

}  // namespace lyceum_quest