#include "quest_details.hpp"
#include <userver/formats/json/serialize.hpp>
#include <userver/formats/json/value_builder.hpp>

namespace lyceum_quest {

bool TryGetCharacter(std::string_view id,
                     userver::storages::postgres::ClusterPtr pg_cluster_,
                     TCharacter& character) {
  auto result =
      pg_cluster_
          ->Execute(userver::storages::postgres::ClusterHostType::kMaster,
                    "SELECT * FROM lyceum_quest.character "
                    "WHERE id = $1 ",
                    id)
          .AsOptionalSingleRow<TCharacter>(
              userver::storages::postgres::kRowTag);

  if (!result.has_value()) return false;

  character = result.value();

  return true;
}

void AddActionCard(userver::formats::json::ValueBuilder& message,
                   userver::storages::postgres::ClusterPtr pg_cluster_,
                   std::string_view quest_task_id) {
  auto result = pg_cluster_->Execute(
      userver::storages::postgres::ClusterHostType::kMaster,
      "SELECT file_id FROM lyceum_quest.quest_task_x_files "
      "WHERE quest_task_id = $1 LIMIT 1 ",
      quest_task_id);

  if (result.IsEmpty()) {
    return;
  }

  auto file = pg_cluster_->Execute(
      userver::storages::postgres::ClusterHostType::kMaster,
      "SELECT * FROM lyceum_quest.file "
      "WHERE id = $1 ",
      result.AsSingleRow<std::string>());

  if (file.IsEmpty()) {
    return;
  }
  auto data = file.AsSingleRow<TFile>(userver::storages::postgres::kRowTag);
  message["image_url"] = data.url;
}

void AddAdminActionCard(userver::formats::json::ValueBuilder& message,
                   userver::storages::postgres::ClusterPtr pg_cluster_,
                   std::string_view quest_task_id) {
  auto result = pg_cluster_->Execute(
      userver::storages::postgres::ClusterHostType::kMaster,
      "SELECT file_id FROM lyceum_quest.quest_task_x_files "
      "WHERE quest_task_id = $1 LIMIT 1 ",
      quest_task_id);

  if (result.IsEmpty()) {
    return;
  }

  message["attachments"].Resize(0);

  for (auto file_id : result.AsSetOf<std::string>()) {
    auto file = pg_cluster_->Execute(
        userver::storages::postgres::ClusterHostType::kMaster,
        "SELECT * FROM lyceum_quest.file "
        "WHERE id = $1 ",
        file_id);
    if (!file.IsEmpty()) {
      auto data = file.AsSingleRow<TFile>(userver::storages::postgres::kRowTag);
      message["attachments"].PushBack(std::move(data));
    }
  }
}

void AddAttachments(userver::formats::json::ValueBuilder& message,
                    userver::storages::postgres::ClusterPtr pg_cluster_,
                    std::string_view quest_task_id) {
  auto result = pg_cluster_->Execute(
      userver::storages::postgres::ClusterHostType::kMaster,
      "SELECT file_id FROM lyceum_quest.quest_task_x_files "
      "WHERE quest_task_id = $1 ",
      quest_task_id);

  if (result.IsEmpty()) {
    return;
  }

  message["attachments"].Resize(0);

  for (auto file_id : result.AsSetOf<std::string>()) {
    auto file = pg_cluster_->Execute(
        userver::storages::postgres::ClusterHostType::kMaster,
        "SELECT * FROM lyceum_quest.file "
        "WHERE id = $1 ",
        file_id);
    if (!file.IsEmpty()) {
      auto data = file.AsSingleRow<TFile>(userver::storages::postgres::kRowTag);
      message["attachments"].PushBack(std::move(data));
    }
  }
}

void TryAddCharactersOfNextMessages(
    userver::formats::json::ValueBuilder& message,
    userver::storages::postgres::ClusterPtr pg_cluster_, const TTask& task) {
  auto type =
      pg_cluster_
          ->Execute(userver::storages::postgres::ClusterHostType::kMaster,
                    "SELECT type_name FROM lyceum_quest.quest_task_type "
                    "WHERE id = $1",
                    task.quest_task_type_id)
          .AsSingleRow<std::string>();
  auto json_data = userver::formats::json::FromString(task.data);

  if (type == "keyboard" && json_data.HasMember("keyboard")) {
    userver::formats::json::ValueBuilder new_keyboard;
    new_keyboard.Resize(0);

    for (auto& button_array : json_data["keyboard"]) {
      userver::formats::json::ValueBuilder new_keyboard_row;
      for (auto& button : button_array) {
        userver::formats::json::ValueBuilder new_button;
        new_button = button;
        auto next_task_id =
            task.quest_id + "_" + button["next_task_id"].As<std::string>();
        auto next_task_character =
            pg_cluster_
                ->Execute(
                    userver::storages::postgres::ClusterHostType::kMaster,
                    "SELECT c.id, c.name, c.profile_picture, "
                    "c.full_size_picture FROM lyceum_quest.character AS c JOIN "
                    "lyceum_quest.quest_task AS qt ON qt.character_id = c.id "
                    "WHERE qt.id = $1 ",
                    next_task_id)
                .AsOptionalSingleRow<TCharacter>(
                    userver::storages::postgres::kRowTag);

        if (!next_task_character.has_value()) {
          return;
        }

        new_button["next_message_character"] = next_task_character.value();
        new_keyboard_row.PushBack(new_button.ExtractValue());
      }
      new_keyboard.PushBack(new_keyboard_row.ExtractValue());
    }

    message["keyboard"] = new_keyboard.ExtractValue();
  } else if (type == "city_input") {
    if (!json_data.HasMember("has_lyceum_next_id") ||
        !json_data.HasMember("no_lyceum_next_id")) {
      return;
    }

    auto has_lyceum_next_id =
        task.quest_id + "_" + json_data["has_lyceum_next_id"].As<std::string>();
    auto no_lyceum_next_id =
        task.quest_id + "_" + json_data["no_lyceum_next_id"].As<std::string>();

    auto has_lyceum_next_task_character =
        pg_cluster_
            ->Execute(
                userver::storages::postgres::ClusterHostType::kMaster,
                "SELECT c.id, c.name, c.profile_picture, c.full_size_picture "
                "FROM lyceum_quest.character AS c JOIN lyceum_quest.quest_task "
                "AS qt ON qt.character_id = c.id "
                "WHERE qt.id = $1 ",
                has_lyceum_next_id)
            .AsOptionalSingleRow<TCharacter>(
                userver::storages::postgres::kRowTag);
    auto no_lyceum_next_task_character =
        pg_cluster_
            ->Execute(
                userver::storages::postgres::ClusterHostType::kMaster,
                "SELECT c.id, c.name, c.profile_picture, c.full_size_picture "
                "FROM lyceum_quest.character AS c JOIN lyceum_quest.quest_task "
                "AS qt ON qt.character_id = c.id "
                "WHERE qt.id = $1 ",
                no_lyceum_next_id)
            .AsOptionalSingleRow<TCharacter>(
                userver::storages::postgres::kRowTag);

    if (no_lyceum_next_task_character.has_value() &&
        has_lyceum_next_task_character.has_value()) {
      message["no_lyceum_next_message_character"] =
          no_lyceum_next_task_character.value();
      message["has_lyceum_next_message_character"] =
          has_lyceum_next_task_character.value();
    }
  } else if (type == "action_card") {
    // Это должно быть в данных для ActionCard
    if (json_data.HasMember("next_task_id")) {
      auto next_task_id =
          task.quest_id + "_" + json_data["next_task_id"].As<std::string>();
      auto next_task_character =
          pg_cluster_
              ->Execute(
                  userver::storages::postgres::ClusterHostType::kMaster,
                  "SELECT c.id, c.name, c.profile_picture, c.full_size_picture "
                  "FROM lyceum_quest.character AS c JOIN "
                  "lyceum_quest.quest_task AS qt ON qt.character_id = c.id "
                  "WHERE qt.id = $1 ",
                  next_task_id)
              .AsOptionalSingleRow<TCharacter>(
                  userver::storages::postgres::kRowTag);

      if (next_task_character.has_value()) {
        message["next_message_character"] = next_task_character.value();
      }
    }
  }
}

}  // namespace lyceum_quest
