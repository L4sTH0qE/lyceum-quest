#include "view.hpp"

#include <fmt/format.h>

#include <regex>

#include <userver/components/component_context.hpp>
#include <userver/crypto/hash.hpp>
#include <userver/server/handlers/http_handler_base.hpp>
#include <userver/server/http/http_status.hpp>
#include <userver/storages/postgres/cluster.hpp>
#include <userver/storages/postgres/component.hpp>
#include <userver/utils/assert.hpp>

#include "models/user.hpp"

namespace lyceum_quest {

namespace {

// По айди сбрасываем пароль и устанавливаем новый
class PatchResetPassword final
    : public userver::server::handlers::HttpHandlerBase {
 public:
  static constexpr std::string_view kName = "handler-v1-patch-reset-password";

  PatchResetPassword(
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

    auto request_body =
        userver::formats::json::FromString(request.RequestBody());

    if (!request_body.HasMember("id") ||
        !request_body.HasMember("new_password") ||
        !request_body.HasMember("new_password_again")) {
      response.SetStatus(userver::server::http::HttpStatus::kBadRequest);
      userver::formats::json::ValueBuilder result;
      result["detail"] = "Not enough parameters";
      return userver::formats::json::ToString(result.ExtractValue());
    }

    auto id = request_body["id"].As<std::string>();

    auto result = pg_cluster_->Execute(
        userver::storages::postgres::ClusterHostType::kMaster,
        "SELECT id from lyceum_quest.user WHERE id = $1 ", id);

    if (result.IsEmpty()) {
      response.SetStatus(userver::server::http::HttpStatus::kNotFound);
      userver::formats::json::ValueBuilder result;
      result["detail"] = "No user with such id";
      return userver::formats::json::ToString(result.ExtractValue());
    }

    auto new_password = request_body["new_password"].As<std::string>();
    auto new_password_again =
        request_body["new_password_again"].As<std::string>();

    if (new_password != new_password_again || new_password.size() < 8) {
      response.SetStatus(userver::server::http::HttpStatus::kBadRequest);
      userver::formats::json::ValueBuilder result;
      result["detail"] =
          "Passwords must be equal and their length must me greater than 8";
      return userver::formats::json::ToString(result.ExtractValue());
    }

    std::regex password_regex(
        R"((?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~!?@#$%^&*_\-+(){}\[\]<>/\\|"'.:,])[\S\s]{8,64})");
    if (!std::regex_match(new_password, password_regex)) {
      response.SetStatus(userver::server::http::HttpStatus::kBadRequest);
      userver::formats::json::ValueBuilder answer;
      answer["detail"] = "Incorrect password format";
      return userver::formats::json::ToString(answer.ExtractValue());
    }

    auto user =
        pg_cluster_
            ->Execute(
                userver::storages::postgres::ClusterHostType::kMaster,
                "SELECT u.id as id, u.login as login, u.password as password, "
                "u.first_name as first_name, u.second_name as second_name, "
                "ur.id as "
                "role_id, ur.title as "
                "role_title, us.id as status_id, us.title as status_title "
                "FROM lyceum_quest.user as u "
                "JOIN lyceum_quest.user_role AS ur ON u.role_id = ur.id "
                "JOIN lyceum_quest.user_status AS us ON u.status_id = us.id "
                "WHERE u.id = $1 ",
                id)
            .AsSingleRow<TUser>(userver::storages::postgres::kRowTag);

    if (user.status_title == "disabled") {
      pg_cluster_->Execute(
          userver::storages::postgres::ClusterHostType::kMaster,
          "UPDATE lyceum_quest.user SET password = $1 WHERE id = $2 ",
          userver::crypto::hash::Sha256(new_password), id);
    } else {
      pg_cluster_->Execute(
          userver::storages::postgres::ClusterHostType::kMaster,
          "UPDATE lyceum_quest.user SET password = $1, status_id = '2' WHERE "
          "id = $2 ",
          userver::crypto::hash::Sha256(new_password), id);
    }

    return {};
  }

 private:
  userver::storages::postgres::ClusterPtr pg_cluster_;
};

}  // namespace

void AppendPatchResetPassword(
    userver::components::ComponentList& component_list) {
  component_list.Append<PatchResetPassword>();
}

}  // namespace lyceum_quest