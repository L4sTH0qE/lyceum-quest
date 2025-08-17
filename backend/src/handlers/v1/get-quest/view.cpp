#include "view.hpp"

#include <fmt/format.h>
#include <chrono>
#include <cstdlib>
#include <ctime>
#include <iomanip>
#include <sstream>

#include <string_view>
#include <userver/components/component_context.hpp>
#include <userver/formats/json/serialize.hpp>
#include <userver/formats/json/value.hpp>
#include <userver/formats/json/value_builder.hpp>
#include <userver/logging/log.hpp>
#include <userver/server/handlers/http_handler_base.hpp>
#include <userver/server/http/http_status.hpp>
#include <userver/storages/postgres/cluster.hpp>
#include <userver/storages/postgres/component.hpp>
#include <userver/storages/postgres/result_set.hpp>
#include <userver/utils/assert.hpp>

#include "handlers/lib/quest_details.hpp"
#include "models/character.hpp"
#include "models/task.hpp"

namespace lyceum_quest {

namespace {

class GetQuest final : public userver::server::handlers::HttpHandlerBase {
 public:
  static constexpr std::string_view kName = "handler-v1-get-quest";

  GetQuest(const userver::components::ComponentConfig& config,
           const userver::components::ComponentContext& component_context)
      : HttpHandlerBase(config, component_context),
        pg_cluster_(
            component_context
                .FindComponent<userver::components::Postgres>("postgres-db-1")
                .GetCluster()) {}

  std::string HandleRequestThrow(
      const userver::server::http::HttpRequest& request,
      userver::server::request::RequestContext&) const override {
    const auto& id = request.GetPathArg("id");
    auto result = pg_cluster_->Execute(
        userver::storages::postgres::ClusterHostType::kMaster,
        "SELECT * FROM lyceum_quest.quest "
        "WHERE id = $1 AND is_available = TRUE",
        id);

    if (result.IsEmpty() || !result[0]["is_available"].As<bool>()) {
      auto& response = request.GetHttpResponse();
      response.SetStatus(userver::server::http::HttpStatus::kNotFound);
      return {};
    }

    userver::formats::json::ValueBuilder response;
    response["quest_id"] = id;
    response["messages"].Resize(0);

    // Пытаемся найти первое сообщение квеста.
    auto curr_task = pg_cluster_->Execute(
        userver::storages::postgres::ClusterHostType::kMaster,
        "SELECT * FROM lyceum_quest.quest_task "
        "WHERE quest_id = $1 AND is_first = TRUE",
        id);

    if (curr_task.IsEmpty()) {
      auto& response = request.GetHttpResponse();
      response.SetStatus(userver::server::http::HttpStatus::kNotFound);
      LOG_WARNING() << "No first task for quest with id = " << id;
      return "";
    }

    TTask task;
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
          id + "_" + curr_elem_json["next_task_id"].As<std::string>());

      if (curr_task.IsEmpty()) {
        auto& response = request.GetHttpResponse();
        response.SetStatus(userver::server::http::HttpStatus::kNotFound);
        LOG_WARNING() << "No next task for quest with id = " << id;
        return "";
      }
    }

    auto now = std::chrono::system_clock::now();
    auto time_t_now = std::chrono::system_clock::to_time_t(now);
    std::tm tm_now;
    ::gmtime_r(&time_t_now, &tm_now);

    // Формирование строки даты в формате YYYY-MM-DD
    std::stringstream date_ss;
    date_ss << std::setfill('0') << std::setw(4) << (tm_now.tm_year + 1900)
            << '-' << std::setw(2) << (tm_now.tm_mon + 1) << '-' << std::setw(2)
            << tm_now.tm_mday;

    auto session_id =
        pg_cluster_
            ->Execute(userver::storages::postgres::ClusterHostType::kMaster,
                      "INSERT INTO lyceum_quest.session(date, quest_id, "
                      "dropped_id) VALUES ($1, $2, $3) RETURNING session_id  ",
                      date_ss.str(), id, task.id)
            .AsOptionalSingleRow<std::string>();

    response["session_id"] = session_id.value();
    response["is_last"] = is_last;

    return userver::formats::json::ToString(response.ExtractValue());
  }

 private:
  userver::storages::postgres::ClusterPtr pg_cluster_;
};

}  // namespace

void AppendGetQuest(userver::components::ComponentList& component_list) {
  component_list.Append<GetQuest>();
}

}  // namespace lyceum_quest