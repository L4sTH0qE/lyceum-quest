#include "view.hpp"

#include <fmt/format.h>

#include <userver/components/component_context.hpp>
#include <userver/server/handlers/http_handler_base.hpp>
#include <userver/server/http/http_status.hpp>
#include <userver/storages/postgres/cluster.hpp>
#include <userver/storages/postgres/component.hpp>
#include <userver/utils/assert.hpp>

#include "handlers/lib/auth.hpp"
#include "handlers/lib/quest_details.hpp"
#include "models/quest.hpp"
#include "models/session.hpp"
#include "models/task.hpp"

namespace lyceum_quest {

namespace {

class GetAdminQuest final : public userver::server::handlers::HttpHandlerBase {
 public:
  static constexpr std::string_view kName = "handler-v1-get-admin-quest";

  GetAdminQuest(const userver::components::ComponentConfig& config,
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
        "SELECT * FROM lyceum_quest.quest "
        "WHERE id = $1 ",
        id);

    if (result.IsEmpty()) {
      request.GetHttpResponse().SetStatus(
          userver::server::http::HttpStatus::kNotFound);
      userver::formats::json::ValueBuilder answer;
      answer["detail"] = "Quest is not found";
      return userver::formats::json::ToString(answer.ExtractValue());
    }

    auto quest =
        result.AsSingleRow<TQuest>(userver::storages::postgres::kRowTag);

    userver::formats::json::ValueBuilder response{quest};
    response["messages"].Resize(0);

    auto messages = pg_cluster_->Execute(
        userver::storages::postgres::ClusterHostType::kMaster,
        "SELECT * FROM lyceum_quest.quest_task "
        "WHERE quest_id = $1 "
        "ORDER BY order_id::int ",
        id);
    for (auto row :
         messages.AsSetOf<TTask>(userver::storages::postgres::kRowTag)) {
      auto row_id = row.id;
      auto split = row.id.find("_");
      row.id = row.id.substr(split + 1, row.id.size() - split - 1);
      userver::formats::json::ValueBuilder message(row);

      TCharacter character;
      if (row.author == "bot" && row.character_id.has_value() &&
          lyceum_quest::TryGetCharacter(row.character_id.value(), pg_cluster_,
                                        character)) {
        message["character"] = character;
      }

      auto type =
          pg_cluster_
              ->Execute(userver::storages::postgres::ClusterHostType::kMaster,
                        "SELECT type_name FROM lyceum_quest.quest_task_type "
                        "WHERE id = $1",
                        row.quest_task_type_id)
              .AsSingleRow<std::string>();

      if (type == "attachment") {
        lyceum_quest::AddAttachments(message, pg_cluster_, row_id);
      } else if (type == "action_card") {
        lyceum_quest::AddAdminActionCard(message, pg_cluster_, row_id);
      }
      message["type"] = type;
      response["messages"].PushBack(std::move(message));
    }

    return userver::formats::json::ToString(response.ExtractValue());
  }

 private:
  userver::storages::postgres::ClusterPtr pg_cluster_;
};

}  // namespace

void AppendGetAdminQuest(userver::components::ComponentList& component_list) {
  component_list.Append<GetAdminQuest>();
}

}  // namespace lyceum_quest