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

class UpdateCharacter final
    : public userver::server::handlers::HttpHandlerBase {
 public:
  static constexpr std::string_view kName = "handler-v1-update-character";

  UpdateCharacter(
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

    std::string name = character.name;
    std::string profile_picture = character.profile_picture;
    std::string full_size_picture = character.full_size_picture;

    auto request_body =
        userver::formats::json::FromString(request.RequestBody());

    if (request_body.HasMember("name")) {
      auto temp_name = request_body["name"].As<std::optional<std::string>>();
      if (temp_name.has_value() && !temp_name.value().empty()) {
        name = temp_name.value();
      }
    }
    if (request_body.HasMember("avatar")) {
      auto temp_profile_picture =
          request_body["avatar"].As<std::optional<std::string>>();
      if (temp_profile_picture.has_value() &&
          !temp_profile_picture.value().empty()) {
        profile_picture = temp_profile_picture.value();
      }
    }
    if (request_body.HasMember("full_size_image")) {
      auto temp_full_size_picture =
          request_body["full_size_image"].As<std::optional<std::string>>();
      if (temp_full_size_picture.has_value() &&
          !temp_full_size_picture.value().empty()) {
        full_size_picture = temp_full_size_picture.value();
      }
    }

    result = pg_cluster_->Execute(
        userver::storages::postgres::ClusterHostType::kMaster,
        "UPDATE lyceum_quest.character "
        "SET name = $2, profile_picture = $3, full_size_picture = $4 "
        "WHERE id = $1 ",
        id, name, profile_picture, full_size_picture);

    character.name = name;
    character.profile_picture = profile_picture;
    character.full_size_picture = full_size_picture;

    return userver::formats::json::ToString(
        userver::formats::json::ValueBuilder{character}.ExtractValue());
  }

 private:
  userver::storages::postgres::ClusterPtr pg_cluster_;
};

}  // namespace

void AppendUpdateCharacter(userver::components::ComponentList& component_list) {
  component_list.Append<UpdateCharacter>();
}

}  // namespace lyceum_quest