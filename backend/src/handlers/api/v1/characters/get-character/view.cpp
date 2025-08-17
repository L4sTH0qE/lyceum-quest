#include "view.hpp"

#include <fmt/format.h>

#include <userver/components/component_context.hpp>
#include <userver/server/handlers/http_handler_base.hpp>
#include <userver/server/http/http_status.hpp>
#include <userver/storages/postgres/cluster.hpp>
#include <userver/storages/postgres/component.hpp>
#include <userver/utils/assert.hpp>

#include "handlers/lib/auth.hpp"
#include "models/character.hpp"
#include "models/session.hpp"

namespace lyceum_quest {

namespace {

class GetCharacter final : public userver::server::handlers::HttpHandlerBase {
 public:
  static constexpr std::string_view kName = "handler-v1-get-character";

  GetCharacter(const userver::components::ComponentConfig& config,
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

    const auto& id = request.GetPathArg("id");
    auto result = pg_cluster_->Execute(
        userver::storages::postgres::ClusterHostType::kMaster,
        "SELECT * FROM lyceum_quest.character "
        "WHERE id = $1 ",
        id);

    if (result.IsEmpty()) {
      auto& response = request.GetHttpResponse();
      response.SetStatus(userver::server::http::HttpStatus::kNotFound);
      userver::formats::json::ValueBuilder answer;
      answer["detail"] = "Character is not found";
      return userver::formats::json::ToString(answer.ExtractValue());
    }

    auto character =
        result.AsSingleRow<TCharacter>(userver::storages::postgres::kRowTag);

    return userver::formats::json::ToString(
        userver::formats::json::ValueBuilder{character}.ExtractValue());
  }

 private:
  userver::storages::postgres::ClusterPtr pg_cluster_;
};

}  // namespace

void AppendGetCharacter(userver::components::ComponentList& component_list) {
  component_list.Append<GetCharacter>();
}

}  // namespace lyceum_quest