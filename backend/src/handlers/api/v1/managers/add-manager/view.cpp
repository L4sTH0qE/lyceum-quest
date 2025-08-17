#include "view.hpp"

#include <fmt/format.h>

#include <optional>
#include <regex>
#include <tuple>
#include <userver/components/component_context.hpp>
#include <userver/crypto/hash.hpp>
#include <userver/server/handlers/http_handler_base.hpp>
#include <userver/server/http/http_status.hpp>
#include <userver/storages/postgres/cluster.hpp>
#include <userver/storages/postgres/component.hpp>
#include <userver/utils/assert.hpp>

#include "handlers/lib/auth.hpp"
#include "handlers/lib/check_admin.hpp"
#include "models/session.hpp"
#include "models/user.hpp"

namespace lyceum_quest {

namespace {

class AddManager final : public userver::server::handlers::HttpHandlerBase {
 public:
  static constexpr std::string_view kName = "handler-v1-add-manager";

  AddManager(const userver::components::ComponentConfig& config,
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
    auto& response = request.GetHttpResponse();

    if (!session) {
      response.SetStatus(userver::server::http::HttpStatus::kUnauthorized);
      userver::formats::json::ValueBuilder result;
      result["detail"] = "Invalid or expired Authorization token";
      return userver::formats::json::ToString(result.ExtractValue());
    }

    auto is_admin =
        lyceum_quest::CheckAdmin(pg_cluster_, session.value().user_id);
    if (!is_admin) {
      response.SetStatus(userver::server::http::HttpStatus::kUnauthorized);
      userver::formats::json::ValueBuilder result;
      result["detail"] = "Not an admin";
      return userver::formats::json::ToString(result.ExtractValue());
    }

    auto request_body =
        userver::formats::json::FromString(request.RequestBody());

    if (!request_body.HasMember("login") ||
        !request_body.HasMember("role_id") ||
        !request_body.HasMember("password") ||
        !request_body.HasMember("first_name") ||
        !request_body.HasMember("second_name")) {
      response.SetStatus(userver::server::http::HttpStatus::kBadRequest);
      userver::formats::json::ValueBuilder result;
      result["detail"] = "Not enough arguments for creating a manager info";
      return userver::formats::json::ToString(result.ExtractValue());
    }

    auto login = request_body["login"].As<std::optional<std::string>>();
    auto role_id = request_body["role_id"].As<std::optional<std::string>>();
    auto status_id = std::optional<std::string>("1");
    auto password = request_body["password"].As<std::optional<std::string>>();
    auto first_name =
        request_body["first_name"].As<std::optional<std::string>>();
    auto second_name =
        request_body["second_name"].As<std::optional<std::string>>();

    if (!login.has_value() || login.value().empty()) {
      response.SetStatus(userver::server::http::HttpStatus::kBadRequest);
      userver::formats::json::ValueBuilder result;
      result["detail"] = "Invalid login";
      return userver::formats::json::ToString(result.ExtractValue());
    }

    if (!role_id.has_value() || role_id.value().empty()) {
      response.SetStatus(userver::server::http::HttpStatus::kBadRequest);
      userver::formats::json::ValueBuilder result;
      result["detail"] = "Invalid role_id";
      return userver::formats::json::ToString(result.ExtractValue());
    }

    if (!password.has_value() || password.value().empty()) {
      response.SetStatus(userver::server::http::HttpStatus::kBadRequest);
      userver::formats::json::ValueBuilder result;
      result["detail"] = "Invalid password";
      return userver::formats::json::ToString(result.ExtractValue());
    }

    if (!first_name.has_value() || first_name.value().empty()) {
      response.SetStatus(userver::server::http::HttpStatus::kBadRequest);
      userver::formats::json::ValueBuilder result;
      result["detail"] = "Invalid first_name";
      return userver::formats::json::ToString(result.ExtractValue());
    }

    if (!second_name.has_value() || second_name.value().empty()) {
      response.SetStatus(userver::server::http::HttpStatus::kBadRequest);
      userver::formats::json::ValueBuilder result;
      result["detail"] = "Invalid second_name";
      return userver::formats::json::ToString(result.ExtractValue());
    }

    auto check_login = pg_cluster_->Execute(
        userver::storages::postgres::ClusterHostType::kMaster,
        "SELECT * FROM lyceum_quest.user "
        "WHERE login = $1 ",
        login.value());
    if (!check_login.IsEmpty()) {
      response.SetStatus(userver::server::http::HttpStatus::kBadRequest);
      userver::formats::json::ValueBuilder answer;
      answer["detail"] = "Login already exists";
      return userver::formats::json::ToString(answer.ExtractValue());
    }

    auto role = pg_cluster_->Execute(
        userver::storages::postgres::ClusterHostType::kMaster,
        "SELECT * FROM lyceum_quest.user_role "
        "WHERE id = $1 ",
        role_id.value());

    if (role.IsEmpty()) {
      response.SetStatus(userver::server::http::HttpStatus::kBadRequest);
      userver::formats::json::ValueBuilder answer;
      answer["detail"] = "Invalid role";
      return userver::formats::json::ToString(answer.ExtractValue());
    }

    std::regex login_regex(R"(^[A-Za-z0-9+_.-]+@yandex-team\.ru$)");
    if (!std::regex_match(login.value(), login_regex)) {
      response.SetStatus(userver::server::http::HttpStatus::kBadRequest);
      userver::formats::json::ValueBuilder answer;
      answer["detail"] = "Incorrect login format";
      return userver::formats::json::ToString(answer.ExtractValue());
    }
    std::regex password_regex(
        R"((?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~!?@#$%^&*_\-+(){}\[\]<>/\\|"'.:,])[\S\s]{8,64})");
    if (!std::regex_match(password.value(), password_regex)) {
      response.SetStatus(userver::server::http::HttpStatus::kBadRequest);
      userver::formats::json::ValueBuilder answer;
      answer["detail"] = "Incorrect password format";
      return userver::formats::json::ToString(answer.ExtractValue());
    }

    auto hashed_password = userver::crypto::hash::Sha256(password.value());

    auto insert_result = pg_cluster_->Execute(
        userver::storages::postgres::ClusterHostType::kMaster,
        "INSERT INTO lyceum_quest.user(login, password, first_name, "
        "second_name, role_id) "
        "VALUES($1, $2, $3, $4, $5) "
        "RETURNING (id) ",
        login.value(), hashed_password, first_name.value(), second_name.value(),
        role_id.value());

    // auto user_id = insert_result[0]["id"].As<std::string>();
    auto user_id = insert_result.AsSingleRow<std::string>();

    auto result = pg_cluster_->Execute(
        userver::storages::postgres::ClusterHostType::kMaster,
        "SELECT u.id as id, u.login as login, u.password as password, "
        "u.first_name as first_name, u.second_name as second_name, ur.id as "
        "role_id, ur.title as "
        "role_title, us.id as status_id, us.title as status_title "
        "FROM lyceum_quest.user as u "
        "JOIN lyceum_quest.user_role AS ur ON u.role_id = ur.id "
        "JOIN lyceum_quest.user_status AS us ON u.status_id = us.id "
        "WHERE u.id = $1 ",
        user_id);

    auto user = result.AsSingleRow<TUser>(userver::storages::postgres::kRowTag);
    return userver::formats::json::ToString(
        userver::formats::json::ValueBuilder{user}.ExtractValue());
  }

 private:
  userver::storages::postgres::ClusterPtr pg_cluster_;
};

}  // namespace

void AppendAddManager(userver::components::ComponentList& component_list) {
  component_list.Append<AddManager>();
}

}  // namespace lyceum_quest