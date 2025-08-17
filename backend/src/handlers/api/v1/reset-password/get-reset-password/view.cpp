#include "view.hpp"

#include <fmt/format.h>

#include <userver/components/component_context.hpp>
#include <userver/server/handlers/http_handler_base.hpp>
#include <userver/server/http/http_status.hpp>
#include <userver/storages/postgres/cluster.hpp>
#include <userver/storages/postgres/component.hpp>
#include <userver/utils/assert.hpp>

namespace lyceum_quest {

namespace {

// Получаем айди пользователя по его логину, чтобы потом сбросить пароль.
class GetResetPassword final
    : public userver::server::handlers::HttpHandlerBase {
 public:
  static constexpr std::string_view kName = "handler-v1-get-reset-password";

  GetResetPassword(
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
    auto& response = request.GetHttpResponse();

    const auto& login = request.GetPathArg("login");

    auto result = pg_cluster_->Execute(
        userver::storages::postgres::ClusterHostType::kMaster,
        "SELECT id from lyceum_quest.user WHERE login = $1 ", login);

    if (result.IsEmpty()) {
      response.SetStatus(userver::server::http::HttpStatus::kNotFound);
      userver::formats::json::ValueBuilder result;
      result["detail"] = "No user with such login";
      return userver::formats::json::ToString(result.ExtractValue());
    }

    userver::formats::json::ValueBuilder response_body;
    response_body["id"] =
        result[0]["id"].As<std::optional<std::string>>().value();

    return userver::formats::json::ToString(response_body.ExtractValue());
  }

 private:
  userver::storages::postgres::ClusterPtr pg_cluster_;
};

}  // namespace

void AppendGetResetPassword(
    userver::components::ComponentList& component_list) {
  component_list.Append<GetResetPassword>();
}

}  // namespace lyceum_quest