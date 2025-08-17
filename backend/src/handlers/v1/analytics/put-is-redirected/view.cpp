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

class PutRedirected final : public userver::server::handlers::HttpHandlerBase {
 public:
  static constexpr std::string_view kName = "handler-v1-put-is-redirected";

  PutRedirected(const userver::components::ComponentConfig& config,
                const userver::components::ComponentContext& component_context)
      : HttpHandlerBase(config, component_context),
        pg_cluster_(
            component_context
                .FindComponent<userver::components::Postgres>("postgres-db-1")
                .GetCluster()) {}

  std::string HandleRequestThrow(
      const userver::server::http::HttpRequest& request,
      userver::server::request::RequestContext&) const override {
    const auto body_json =
        userver::formats::json::FromString(request.RequestBody());

    if (!body_json.HasMember("session_id")) {
      request.GetHttpResponse().SetStatus(
          userver::server::http::HttpStatus::kBadRequest);
      userver::formats::json::ValueBuilder answer;
      answer["detail"] = "No session id in request body";
      return userver::formats::json::ToString(answer.ExtractValue());
    }

    const auto& session_id = body_json["session_id"].As<std::string>();

    auto result = pg_cluster_->Execute(
        userver::storages::postgres::ClusterHostType::kMaster,
        "UPDATE lyceum_quest.session SET is_redirected = TRUE WHERE session_id "
        "= $1 "
        "RETURNING session_id",
        session_id);

    if (result.IsEmpty()) {
      request.GetHttpResponse().SetStatus(
          userver::server::http::HttpStatus::kNotFound);
      userver::formats::json::ValueBuilder answer;
      answer["detail"] = "No such session";
      return userver::formats::json::ToString(answer.ExtractValue());
    }

    return {};
  }

 private:
  userver::storages::postgres::ClusterPtr pg_cluster_;
};

}  // namespace

void AppendPutIsRedirected(userver::components::ComponentList& component_list) {
  component_list.Append<PutRedirected>();
}

}  // namespace lyceum_quest