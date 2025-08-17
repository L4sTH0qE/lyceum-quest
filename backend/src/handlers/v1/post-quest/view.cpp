#include "view.hpp"

#include <fmt/format.h>

#include <string_view>
#include <userver/components/component_context.hpp>
#include <userver/formats/json/serialize.hpp>
#include <userver/formats/json/value.hpp>
#include <userver/formats/json/value_builder.hpp>
#include <userver/http/content_type.hpp>
#include <userver/logging/log.hpp>
#include <userver/server/handlers/http_handler_base.hpp>
#include <userver/server/http/http_status.hpp>
#include <userver/storages/postgres/cluster.hpp>
#include <userver/storages/postgres/cluster_types.hpp>
#include <userver/storages/postgres/component.hpp>
#include <userver/storages/postgres/result_set.hpp>
#include <userver/utils/assert.hpp>

#include "handlers/lib/quest_details.hpp"
#include "models/character.hpp"
#include "models/task.hpp"

namespace lyceum_quest {

namespace {

class PostQuest final : public userver::server::handlers::HttpHandlerBase {
 public:
  static constexpr std::string_view kName = "handler-v1-post-quest";

  PostQuest(const userver::components::ComponentConfig& config,
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

    if (!body_json.HasMember("quest_id") ||
        !body_json.HasMember("message_id") ||
        !body_json.HasMember("session_id")) {
      auto& response = request.GetHttpResponse();
      response.SetStatus(userver::server::http::HttpStatus::kBadRequest);
      return {};
    }

    auto quest_data = pg_cluster_->Execute(
        userver::storages::postgres::ClusterHostType::kMaster,
        "SELECT * FROM lyceum_quest.quest "
        "WHERE id = $1",
        body_json["quest_id"].As<std::string>());

    if (quest_data.IsEmpty()) {
      auto& response = request.GetHttpResponse();
      LOG_INFO() << "quest not found";
      response.SetStatus(userver::server::http::HttpStatus::kNotFound);
      return {};
    }

    auto session_id =
        pg_cluster_
            ->Execute(userver::storages::postgres::ClusterHostType::kMaster,
                      "SELECT session_id FROM lyceum_quest.session "
                      "WHERE session_id = $1",
                      body_json["session_id"].As<std::string>())
            .AsOptionalSingleRow<std::string>();

    if (!session_id.has_value()) {
      auto& response = request.GetHttpResponse();
      LOG_INFO() << "session not found";
      response.SetStatus(userver::server::http::HttpStatus::kNotFound);
      return {};
    }

    auto task_data = pg_cluster_->Execute(
        userver::storages::postgres::ClusterHostType::kMaster,
        "SELECT * FROM lyceum_quest.quest_task "
        "WHERE id = $1",
        body_json["message_id"].As<std::string>());

    if (task_data.IsEmpty()) {
      auto& response = request.GetHttpResponse();
      LOG_INFO() << "task not found";
      response.SetStatus(userver::server::http::HttpStatus::kNotFound);
      return {};
    }

    std::string next_task_id;
    auto task =
        task_data.AsSingleRow<TTask>(userver::storages::postgres::kRowTag);
    auto task_data_json = userver::formats::json::FromString(task.data);
    auto type =
        pg_cluster_
            ->Execute(userver::storages::postgres::ClusterHostType::kMaster,
                      "SELECT type_name FROM lyceum_quest.quest_task_type "
                      "WHERE id = $1",
                      task.quest_task_type_id)
            .AsSingleRow<std::string>();

    if (!TryParseBody(body_json, type, task_data_json, next_task_id, request)) {
      return {};
    }

    userver::formats::json::ValueBuilder response;
    response["quest_id"] = body_json["quest_id"];
    response["messages"].Resize(0);

    // Пытаемся найти следующее сообщение квеста.
    auto curr_task = pg_cluster_->Execute(
        userver::storages::postgres::ClusterHostType::kMaster,
        "SELECT * FROM lyceum_quest.quest_task "
        "WHERE quest_id = $1 AND id = $2",
        task.quest_id, task.quest_id + "_" + next_task_id);

    if (curr_task.IsEmpty()) {
      auto& response = request.GetHttpResponse();
      response.SetStatus(userver::server::http::HttpStatus::kNotFound);
      LOG_WARNING() << "No next task for quest with id = "
                    << body_json["quest_id"].As<std::string>();
      return "";
    }

    bool is_last = false;

    while (true) {
      userver::formats::json::ValueBuilder message;
      task = curr_task.AsSingleRow<TTask>(userver::storages::postgres::kRowTag);
      userver::formats::json::Value curr_elem_json =
          userver::formats::json::FromString(task.data);

      message["message_id"] = task.id;

      TCharacter character;
      if (task.author == "bot" && task.character_id.has_value() &&
          lyceum_quest::TryGetCharacter(task.character_id.value(), pg_cluster_,
                                        character)) {
        message["character"] = character;
      }

      // TODO: Обработать остальные поля json'а
      auto type =
          pg_cluster_
              ->Execute(userver::storages::postgres::ClusterHostType::kMaster,
                        "SELECT type_name FROM lyceum_quest.quest_task_type "
                        "WHERE id = $1",
                        task.quest_task_type_id)
              .AsSingleRow<std::string>();

      if (type == "attachment") {
        lyceum_quest::AddAttachments(message, pg_cluster_, task.id);
      } else if (type == "text" && curr_elem_json.HasMember("text")) {
        message["text"] = curr_elem_json["text"];
      } else if (type == "keyboard" && curr_elem_json.HasMember("keyboard")) {
        message["keyboard"] = curr_elem_json["keyboard"];
      } else if (type == "city_input") {
        // Пока ничего не делаем.
      } else if (type == "action_card" &&
                 curr_elem_json.HasMember("action_button") &&
                 curr_elem_json.HasMember("next_task_button") &&
                 curr_elem_json.HasMember("title") &&
                 curr_elem_json.HasMember("text")) {
        message["action_button"] = curr_elem_json["action_button"];
        message["next_task_button"] = curr_elem_json["next_task_button"];
        message["title"] = curr_elem_json["title"];
        message["text"] = curr_elem_json["text"];
        lyceum_quest::AddActionCard(message, pg_cluster_, task.id);
      }
      message["type"] = type;
      message["author"] = task.author;

      if ((!curr_elem_json.HasMember("next_task_id") ||
           curr_elem_json["next_task_id"].As<std::string>().empty()) &&
          (type == "attachment" || type == "text" || type == "action_card")) {
        is_last = true;
      }

      if (!curr_elem_json.HasMember("next_task_id") ||
          curr_elem_json["next_task_id"].As<std::string>().empty() ||
          type == "action_card") {
        TryAddCharactersOfNextMessages(message, pg_cluster_, task);
        response["messages"].PushBack(std::move(message));
        break;
      }

      response["messages"].PushBack(std::move(message));

      curr_task = pg_cluster_->Execute(
          userver::storages::postgres::ClusterHostType::kMaster,
          "SELECT * FROM lyceum_quest.quest_task "
          "WHERE id = $1",
          task.quest_id + "_" +
              curr_elem_json["next_task_id"].As<std::string>());

      if (curr_task.IsEmpty()) {
        auto& response = request.GetHttpResponse();
        response.SetStatus(userver::server::http::HttpStatus::kNotFound);
        LOG_WARNING() << "No next task for quest with id = "
                      << body_json["quest_id"].As<std::string>();
        return "";
      }
    }

    pg_cluster_->Execute(
        userver::storages::postgres::ClusterHostType::kMaster,
        "UPDATE lyceum_quest.session SET dropped_id = $1, quest_time = "
        "(EXTRACT(EPOCH FROM NOW()) - EXTRACT(EPOCH FROM "
        "begin_timestamp))::BIGINT WHERE session_id = "
        "$2 ",
        task.id, session_id.value());

    response["is_last"] = is_last;

    if (is_last) {
      pg_cluster_->Execute(
          userver::storages::postgres::ClusterHostType::kMaster,
          "UPDATE lyceum_quest.session SET is_dropped = FALSE, dropped_id = "
          "NULL, final_id = $1 WHERE session_id = $2 ",
          task.id, session_id.value());
    }

    return userver::formats::json::ToString(response.ExtractValue());
  }

 private:
  userver::storages::postgres::ClusterPtr pg_cluster_;

  bool TryParseBody(const userver::formats::json::Value body_json,
                    const std::string type,
                    const userver::formats::json::Value task_data_json,
                    std::string& next_task_id,
                    const userver::server::http::HttpRequest& request) const {
    // Если есть поле с айди кнопки, то ищем в базе айди следующего сообщения.
    if (body_json.HasMember("button_id") && type == "keyboard" &&
        task_data_json.HasMember("keyboard")) {
      bool found = false;
      for (auto button_array : task_data_json["keyboard"]) {
        for (auto button : button_array) {
          if (button["button_id"].As<std::string>() ==
              body_json["button_id"].As<std::string>()) {
            next_task_id = button["next_task_id"].As<std::string>();
            found = true;
            break;
          }
        }
        if (found) break;
      }

      if (!found) {
        auto& response = request.GetHttpResponse();
        LOG_INFO() << "button not found";
        response.SetStatus(userver::server::http::HttpStatus::kNotFound);
        return false;
      }
    }
    // Если есть поле с айди города, то также ищем в базе айди следующего
    // сообщения.
    else if (body_json.HasMember("city_id")) {
      auto has_lyceum =
          pg_cluster_
              ->Execute(userver::storages::postgres::ClusterHostType::kMaster,
                        "SELECT has_lyceum FROM lyceum_quest.city "
                        "WHERE id = $1",
                        body_json["city_id"].As<std::string>())
              .AsOptionalSingleRow<bool>();

      if (!has_lyceum.has_value()) {
        auto& response = request.GetHttpResponse();
        response.SetStatus(userver::server::http::HttpStatus::kNotFound);
        return false;
      }

      // Тут может быть опасно. Надо следить за целостностью json файла.
      if (has_lyceum.value()) {
        next_task_id = task_data_json["has_lyceum_next_id"].As<std::string>();
      } else {
        next_task_id = task_data_json["no_lyceum_next_id"].As<std::string>();
      }
    } else {
      // Это должно быть в данных для ActionCard
      if (task_data_json.HasMember("next_task_id")) {
        next_task_id = task_data_json["next_task_id"].As<std::string>();
        return true;
      }
      auto& response = request.GetHttpResponse();
      response.SetStatus(userver::server::http::HttpStatus::kNotFound);
      return false;
    }

    return true;
  }
};

}  // namespace

void AppendPostQuest(userver::components::ComponentList& component_list) {
  component_list.Append<PostQuest>();
}

}  // namespace lyceum_quest