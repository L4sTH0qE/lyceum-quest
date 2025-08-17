#include "view.hpp"

#include <fmt/format.h>

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

class LoginUser final : public userver::server::handlers::HttpHandlerBase {
 public:
  static constexpr std::string_view kName = "handler-login-user";

  LoginUser(const userver::components::ComponentConfig& config,
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

    auto login = request.GetFormDataArg("login").value;
    auto password =
        userver::crypto::hash::Sha256(request.GetFormDataArg("password").value);

    if (login.empty() || (request.GetFormDataArg("password").value).empty()) {
      response.SetStatus(userver::server::http::HttpStatus::kUnauthorized);
      userver::formats::json::ValueBuilder result;
      result["detail"] = "Empty credentials";
      return userver::formats::json::ToString(result.ExtractValue());
    }

    auto userResult = pg_cluster_->Execute(
        userver::storages::postgres::ClusterHostType::kMaster,
        "SELECT id, password FROM lyceum_quest.user "
        "WHERE login = $1 ",
        login);

    if (userResult.IsEmpty()) {
      response.SetStatus(userver::server::http::HttpStatus::kNotFound);
      userver::formats::json::ValueBuilder result;
      result["detail"] = "User not found";
      return userver::formats::json::ToString(result.ExtractValue());
    }

    auto user_id = userResult[0]["id"].As<std::optional<std::string>>().value();
    auto user_password =
        userResult[0]["password"].As<std::optional<std::string>>().value();

    auto status = pg_cluster_->Execute(
        userver::storages::postgres::ClusterHostType::kMaster,
        "SELECT us.id as id, us.title as title "
        "FROM lyceum_quest.user AS u "
        "JOIN lyceum_quest.user_status AS us ON u.status_id = us.id "
        "WHERE u.id = $1 ",
        user_id);

    auto status_id = status[0]["id"].As<std::optional<std::string>>().value();
    auto status_title =
        status[0]["title"].As<std::optional<std::string>>().value();
    if (status_title == "disabled") {
      response.SetStatus(userver::server::http::HttpStatus::kNotFound);
      userver::formats::json::ValueBuilder result;
      result["detail"] = "No active account with this login";
      return userver::formats::json::ToString(result.ExtractValue());
    }

    if (password != user_password) {
      response.SetStatus(userver::server::http::HttpStatus::kNotFound);
      userver::formats::json::ValueBuilder result;
      result["detail"] = "Wrong password";
      return userver::formats::json::ToString(result.ExtractValue());
    }

    auto result = pg_cluster_->Execute(
        userver::storages::postgres::ClusterHostType::kMaster,
        "INSERT INTO lyceum_quest.auth_session(user_id) VALUES($1) "
        "ON CONFLICT (user_id) DO UPDATE SET "
        "begin_timestamp = DEFAULT, end_timestamp = DEFAULT "
        "RETURNING auth_session.id",
        user_id);

    userver::formats::json::ValueBuilder answer;
    answer["token"] = result.AsSingleRow<std::string>();
    answer["user_id"] = user_id;
    answer["status_id"] = status_id;
    answer["status_title"] = status_title;
    return userver::formats::json::ToString(answer.ExtractValue());
  }

 private:
  userver::storages::postgres::ClusterPtr pg_cluster_;
};

}  // namespace

void AppendLoginUser(userver::components::ComponentList& component_list) {
  component_list.Append<LoginUser>();
}

}  // namespace lyceum_quest
