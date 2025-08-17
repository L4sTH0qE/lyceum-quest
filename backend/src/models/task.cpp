#include "task.hpp"

namespace lyceum_quest {

userver::formats::json::Value Serialize(
    const TTask& task,
    userver::formats::serialize::To<userver::formats::json::Value>) {
  userver::formats::json::ValueBuilder item;
  item["id"] = task.id;
  item["quest_id"] = task.quest_id;
  item["order_id"] = task.order_id;
  item["is_first"] = task.is_first;
  item["quest_task_type_id"] = task.quest_task_type_id;
  item["data"] = task.data;
  if (task.character_id.has_value()) {
    item["character_id"] = task.character_id.value();
  }
  item["author"] = task.author;

  return item.ExtractValue();
}

}  // namespace lyceum_quest