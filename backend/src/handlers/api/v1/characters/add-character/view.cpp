#include "view.hpp"

#include <fmt/format.h>

#include <tuple>
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

class AddCharacter final : public userver::server::handlers::HttpHandlerBase {
 public:
  static constexpr std::string_view kName = "handler-v1-add-character";

  AddCharacter(const userver::components::ComponentConfig& config,
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

    auto request_body =
        userver::formats::json::FromString(request.RequestBody());

    if (!request_body.HasMember("name") || !request_body.HasMember("avatar") ||
        !request_body.HasMember("full_size_image")) {
      auto& response = request.GetHttpResponse();
      response.SetStatus(userver::server::http::HttpStatus::kBadRequest);
      userver::formats::json::ValueBuilder result;
      result["detail"] = "Not enough arguments for creating a character";
      return userver::formats::json::ToString(result.ExtractValue());
    }

    auto name = request_body["name"].As<std::optional<std::string>>();
    auto profile_picture =
        request_body["avatar"].As<std::optional<std::string>>();
    auto full_size_picture =
        request_body["full_size_image"].As<std::optional<std::string>>();

    if (!name.has_value() || name.value().empty()) {
      auto& response = request.GetHttpResponse();
      response.SetStatus(userver::server::http::HttpStatus::kBadRequest);
      userver::formats::json::ValueBuilder result;
      result["detail"] = "Invalid name";
      return userver::formats::json::ToString(result.ExtractValue());
    }
    if (!profile_picture.has_value() || profile_picture.value().empty()) {
      auto& response = request.GetHttpResponse();
      response.SetStatus(userver::server::http::HttpStatus::kBadRequest);
      userver::formats::json::ValueBuilder result;
      result["detail"] = "Invalid avatar";
      return userver::formats::json::ToString(result.ExtractValue());
    }
    if (!full_size_picture.has_value() || full_size_picture.value().empty()) {
      auto& response = request.GetHttpResponse();
      response.SetStatus(userver::server::http::HttpStatus::kBadRequest);
      userver::formats::json::ValueBuilder result;
      result["detail"] = "Invalid full_size_image";
      return userver::formats::json::ToString(result.ExtractValue());
    }

    auto result = pg_cluster_->Execute(
        userver::storages::postgres::ClusterHostType::kMaster,
        "INSERT INTO lyceum_quest.character(name, profile_picture, "
        "full_size_picture) VALUES($1, $2, $3) "
        "RETURNING * ",
        name.value(), profile_picture.value(), full_size_picture.value());

    auto character =
        result.AsSingleRow<TCharacter>(userver::storages::postgres::kRowTag);

    return userver::formats::json::ToString(
        userver::formats::json::ValueBuilder{character}.ExtractValue());
  }

 private:
  userver::storages::postgres::ClusterPtr pg_cluster_;
};

}  // namespace

void AppendAddCharacter(userver::components::ComponentList& component_list) {
  component_list.Append<AddCharacter>();
}

}  // namespace lyceum_quest