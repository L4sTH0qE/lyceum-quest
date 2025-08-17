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

class OptionCharacter final
    : public userver::server::handlers::HttpHandlerBase {
 public:
  static constexpr std::string_view kName = "handler-v1-options";

  OptionCharacter(
      const userver::components::ComponentConfig& config,
      const userver::components::ComponentContext& component_context)
      : HttpHandlerBase(config, component_context),
        pg_cluster_(
            component_context
                .FindComponent<userver::components::Postgres>("postgres-db-1")
                .GetCluster()) {}

  std::string HandleRequestThrow(
      const userver::server::http::HttpRequest& request,
      userver::server::request::RequestContext&) const override {
    request.GetHttpResponse().SetHeader(
        std::string{"Access-Control-Allow-Methods"},
        std::string{"GET, POST, OPTIONS, PUT, PATCH, DELETE"});

    return {};
  }

 private:
  userver::storages::postgres::ClusterPtr pg_cluster_;
};

}  // namespace

void AppendOptionsCharacter(
    userver::components::ComponentList& component_list) {
  component_list.Append<OptionCharacter>();
}

}  // namespace lyceum_quest