#include "view.hpp"

#include <fmt/format.h>

#include <userver/formats/json/serialize.hpp>
#include <vector>

#include <userver/components/component_context.hpp>
#include <userver/server/handlers/http_handler_base.hpp>
#include <userver/server/http/http_status.hpp>
#include <userver/storages/postgres/cluster.hpp>
#include <userver/storages/postgres/component.hpp>
#include <userver/utils/assert.hpp>
#include <userver/utils/uuid4.hpp>

#include "handlers/lib/auth.hpp"
#include "handlers/lib/quest_details.hpp"
#include "models/character.hpp"
#include "models/file.hpp"
#include "models/quest.hpp"
#include "models/session.hpp"
#include "models/task.hpp"
#include "models/task_x_files.hpp"

namespace lyceum_quest {

namespace {

class UpdateAdminQuest final
    : public userver::server::handlers::HttpHandlerBase {
 public:
  static constexpr std::string_view kName = "handler-v1-update-admin-quest";

  UpdateAdminQuest(
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

    auto session = lyceum_quest::GetSessionInfo(pg_cluster_, request);
    if (!session) {
      response.SetStatus(userver::server::http::HttpStatus::kUnauthorized);
      userver::formats::json::ValueBuilder result;
      result["detail"] = "Invalid or expired Authorization token";
      return userver::formats::json::ToString(result.ExtractValue());
    }

    const auto& quest_id = request.GetPathArg("id");
    auto result = pg_cluster_->Execute(
        userver::storages::postgres::ClusterHostType::kMaster,
        "SELECT * FROM lyceum_quest.quest "
        "WHERE id = $1 ",
        quest_id);

    if (result.IsEmpty()) {
      request.GetHttpResponse().SetStatus(
          userver::server::http::HttpStatus::kNotFound);
      userver::formats::json::ValueBuilder answer;
      answer["detail"] = "Quest is not found";
      return userver::formats::json::ToString(answer.ExtractValue());
    }

    auto request_body =
        userver::formats::json::FromString(request.RequestBody());

    if (!request_body.HasMember("name")) {
      response.SetStatus(userver::server::http::HttpStatus::kBadRequest);
      userver::formats::json::ValueBuilder result;
      result["detail"] = "Not enough arguments for creating a quest";
      return userver::formats::json::ToString(result.ExtractValue());
    }

    auto user_id = session.value().user_id;
    auto name = request_body["name"].As<std::optional<std::string>>();
    auto is_available = request_body["is_available"].As<std::optional<bool>>();
    auto public_beautiful_name =
        request_body["public_beautiful_name"].As<std::optional<std::string>>();

    if (!name.has_value() || name.value().empty()) {
      response.SetStatus(userver::server::http::HttpStatus::kBadRequest);
      userver::formats::json::ValueBuilder result;
      result["detail"] = "Invalid quest name";
      return userver::formats::json::ToString(result.ExtractValue());
    }

    if (!public_beautiful_name.has_value() ||
        public_beautiful_name.value().empty()) {
      public_beautiful_name = name.value();
    }

    std::vector<TTask> tasks = std::vector<TTask>();
    std::vector<TTaskXFiles> tasks_files = std::vector<TTaskXFiles>();
    if (request_body.HasMember("messages")) {
      for (auto message : request_body["messages"]) {
        if (!message.HasMember("id") || !message.HasMember("order_id") ||
            !message.HasMember("is_first") ||
            !message.HasMember("quest_task_type_id") ||
            !message.HasMember("data") || !message.HasMember("author")) {
          response.SetStatus(userver::server::http::HttpStatus::kBadRequest);
          userver::formats::json::ValueBuilder result;
          result["detail"] = "Not enough arguments for creating a quest task";
          return userver::formats::json::ToString(result.ExtractValue());
        }

        auto id = message["id"].As<std::optional<std::string>>();
        auto order_id = message["order_id"].As<std::optional<std::string>>();
        auto is_first = message["is_first"].As<std::optional<bool>>();
        auto quest_task_type_id =
            message["quest_task_type_id"].As<std::optional<std::string>>();

        auto data = userver::formats::json::ToString(message["data"]);
        auto character_id =
            message["character_id"].As<std::optional<std::string>>();
        auto author = message["author"].As<std::optional<std::string>>();

        if (!id.has_value() || id.value().empty()) {
          response.SetStatus(userver::server::http::HttpStatus::kBadRequest);
          userver::formats::json::ValueBuilder result;
          result["detail"] = "Invalid task id";
          return userver::formats::json::ToString(result.ExtractValue());
        }
        if (!order_id.has_value() || order_id.value().empty()) {
          response.SetStatus(userver::server::http::HttpStatus::kBadRequest);
          userver::formats::json::ValueBuilder result;
          result["detail"] = "Invalid task order_id";
          return userver::formats::json::ToString(result.ExtractValue());
        }
        if (!is_first.has_value()) {
          response.SetStatus(userver::server::http::HttpStatus::kBadRequest);
          userver::formats::json::ValueBuilder result;
          result["detail"] = "Invalid task is_first";
          return userver::formats::json::ToString(result.ExtractValue());
        }
        if (!quest_task_type_id.has_value() ||
            quest_task_type_id.value().empty()) {
          response.SetStatus(userver::server::http::HttpStatus::kBadRequest);
          userver::formats::json::ValueBuilder result;
          result["detail"] = "Invalid task quest_task_type_id";
          return userver::formats::json::ToString(result.ExtractValue());
        }
        if (data.empty()) {
          response.SetStatus(userver::server::http::HttpStatus::kBadRequest);
          userver::formats::json::ValueBuilder result;
          result["detail"] = "Invalid task data";
          return userver::formats::json::ToString(result.ExtractValue());
        }
        if (!author.has_value() || author.value().empty()) {
          response.SetStatus(userver::server::http::HttpStatus::kBadRequest);
          userver::formats::json::ValueBuilder result;
          result["detail"] = "Invalid task author";
          return userver::formats::json::ToString(result.ExtractValue());
        }

        TCharacter character;
        bool has_character = false;
        if (author.value() == "bot" && character_id.has_value() &&
            lyceum_quest::TryGetCharacter(character_id.value(), pg_cluster_,
                                          character)) {
          has_character = true;
        } else {
          character_id = std::optional<std::string>();
        }

        if (author.value() == "user") {
          has_character = true;
        }

        if (!has_character) {
          response.SetStatus(userver::server::http::HttpStatus::kBadRequest);
          userver::formats::json::ValueBuilder result;
          result["detail"] = "Invalid task character_id";
          return userver::formats::json::ToString(result.ExtractValue());
        }

        auto tmp_type = pg_cluster_->Execute(
            userver::storages::postgres::ClusterHostType::kMaster,
            "SELECT type_name FROM lyceum_quest.quest_task_type "
            "WHERE id = $1",
            quest_task_type_id.value());

        if (tmp_type.IsEmpty()) {
          response.SetStatus(userver::server::http::HttpStatus::kBadRequest);
          userver::formats::json::ValueBuilder result;
          result["detail"] = "Invalid task quest_task_type_id";
          return userver::formats::json::ToString(result.ExtractValue());
        }
        auto type = tmp_type.AsSingleRow<std::string>();
        if (type == "attachment" || type == "action_card") {
          if (!message.HasMember("attachment_id") ||
              !message["attachment_id"].IsArray()) {
            response.SetStatus(userver::server::http::HttpStatus::kBadRequest);
            userver::formats::json::ValueBuilder result;
            result["detail"] = "Not enough arguments for creating a quest task";
            return userver::formats::json::ToString(result.ExtractValue());
          }
        }
        if (type == "attachment") {
          std::vector<TTaskXFiles> task_files = std::vector<TTaskXFiles>();
          std::string attachment_type = "";
          if (message["attachment_id"].GetSize() == 0) {
            response.SetStatus(userver::server::http::HttpStatus::kBadRequest);
            userver::formats::json::ValueBuilder result;
            result["detail"] =
                "Invalid task attachment (at least one file required)";
            return userver::formats::json::ToString(result.ExtractValue());
          }
          for (auto attachment : message["attachment_id"]) {
            auto attachment_id = attachment.As<std::string>();
            auto task_file = pg_cluster_->Execute(
                userver::storages::postgres::ClusterHostType::kMaster,
                "SELECT * FROM lyceum_quest.file "
                "WHERE id = $1",
                attachment_id);

            if (task_file.IsEmpty()) {
              response.SetStatus(
                  userver::server::http::HttpStatus::kBadRequest);
              userver::formats::json::ValueBuilder result;
              result["detail"] = "Invalid task file_id (no such file)";
              return userver::formats::json::ToString(result.ExtractValue());
            }
            auto file = task_file.AsSingleRow<TFile>(
                userver::storages::postgres::kRowTag);
            if (attachment_type.empty()) {
              attachment_type = file.type;
            }
            if (attachment_type != file.type &&
                (attachment_type == "file" || file.type == "file")) {
              response.SetStatus(
                  userver::server::http::HttpStatus::kBadRequest);
              userver::formats::json::ValueBuilder result;
              result["detail"] =
                  "Invalid task file_type (you cannot add different file types "
                  "to one quest message)";
              return userver::formats::json::ToString(result.ExtractValue());
            }
            TTaskXFiles task_x_file = TTaskXFiles();
            task_x_file.file_id = file.id;
            task_x_file.quest_task_id = quest_id + "_" + id.value();
            task_files.push_back(std::move(task_x_file));
          }
          tasks_files.insert(tasks_files.end(), task_files.begin(),
                             task_files.end());
        }
        if (type == "action_card") {
          if (message["attachment_id"].GetSize() != 1) {
            response.SetStatus(userver::server::http::HttpStatus::kBadRequest);
            userver::formats::json::ValueBuilder result;
            result["detail"] = "Invalid task attachment (one image required)";
            return userver::formats::json::ToString(result.ExtractValue());
          }
          for (auto attachment : message["attachment_id"]) {
            auto attachment_id = attachment.As<std::string>();
            auto task_file = pg_cluster_->Execute(
                userver::storages::postgres::ClusterHostType::kMaster,
                "SELECT * FROM lyceum_quest.file "
                "WHERE id = $1",
                attachment_id);

            if (task_file.IsEmpty()) {
              response.SetStatus(
                  userver::server::http::HttpStatus::kBadRequest);
              userver::formats::json::ValueBuilder result;
              result["detail"] = "Invalid task file_id (no such file)";
              return userver::formats::json::ToString(result.ExtractValue());
            }
            auto file = task_file.AsSingleRow<TFile>(
                userver::storages::postgres::kRowTag);
            if (file.type != "image") {
              response.SetStatus(
                  userver::server::http::HttpStatus::kBadRequest);
              userver::formats::json::ValueBuilder result;
              result["detail"] =
                  "Invalid task file_type (you can add only image file)";
              return userver::formats::json::ToString(result.ExtractValue());
            }
            TTaskXFiles task_x_file = TTaskXFiles();
            task_x_file.file_id = file.id;
            task_x_file.quest_task_id = quest_id + "_" + id.value();
            tasks_files.push_back(task_x_file);
          }
        }
        TTask task = TTask();
        task.id = quest_id + "_" + id.value();
        task.quest_id = quest_id;
        task.order_id = order_id.value();
        task.is_first = is_first.value();
        task.quest_task_type_id = quest_task_type_id.value();
        task.data = data;
        task.character_id = character_id;
        task.author = author.value();
        tasks.push_back(std::move(task));
      }
    }

    pg_cluster_->Execute(userver::storages::postgres::ClusterHostType::kMaster,
                         "DELETE FROM lyceum_quest.quest_task_x_files "
                         "WHERE quest_task_id LIKE $1 ",
                         quest_id + "_%");
    pg_cluster_->Execute(userver::storages::postgres::ClusterHostType::kMaster,
                         "DELETE FROM lyceum_quest.quest_task "
                         "WHERE quest_id = $1 ",
                         quest_id);
    pg_cluster_->Execute(userver::storages::postgres::ClusterHostType::kMaster,
                         "DELETE FROM lyceum_quest.quest "
                         "WHERE id = $1 ",
                         quest_id);

    auto insert_quest_result = pg_cluster_->Execute(
        userver::storages::postgres::ClusterHostType::kMaster,
        "INSERT INTO lyceum_quest.quest(id, user_id, name, is_available, "
        "public_beautiful_name) "
        "VALUES($1, $2, $3, $4, $5) "
        "RETURNING * ",
        quest_id, user_id, name.value(), is_available.value(),
        public_beautiful_name.value());
    auto quest = insert_quest_result.AsSingleRow<TQuest>(
        userver::storages::postgres::kRowTag);

    for (auto task : tasks) {
      if (task.character_id.has_value() && !task.character_id.value().empty()) {
        auto insert_task_result = pg_cluster_->Execute(
            userver::storages::postgres::ClusterHostType::kMaster,
            "INSERT INTO lyceum_quest.quest_task(id, quest_id, order_id, "
            "is_first, quest_task_type_id, data, character_id, author) "
            "VALUES($1, $2, $3, $4, $5, $6, $7, $8) "
            "RETURNING * ",
            task.id, task.quest_id, task.order_id, task.is_first,
            task.quest_task_type_id, task.data, task.character_id.value(),
            task.author);
      } else {
        auto insert_task_result = pg_cluster_->Execute(
            userver::storages::postgres::ClusterHostType::kMaster,
            "INSERT INTO lyceum_quest.quest_task(id, quest_id, order_id, "
            "is_first, quest_task_type_id, data, author) "
            "VALUES($1, $2, $3, $4, $5, $6, $7) "
            "RETURNING * ",
            task.id, task.quest_id, task.order_id, task.is_first,
            task.quest_task_type_id, task.data, task.author);
      }
    }

    for (auto task_files : tasks_files) {
      auto insert_task_files_result = pg_cluster_->Execute(
          userver::storages::postgres::ClusterHostType::kMaster,
          "INSERT INTO lyceum_quest.quest_task_x_files(file_id, quest_task_id) "
          "VALUES($1, $2) "
          "RETURNING * ",
          task_files.file_id, task_files.quest_task_id);
    }

    return userver::formats::json::ToString(
        userver::formats::json::ValueBuilder{quest}.ExtractValue());
  }

 private:
  userver::storages::postgres::ClusterPtr pg_cluster_;
};

}  // namespace

void AppendUpdateAdminQuest(
    userver::components::ComponentList& component_list) {
  component_list.Append<UpdateAdminQuest>();
}

}  // namespace lyceum_quest