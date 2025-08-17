#ifndef QUESTDETAILS_H_
#define QUESTDETAILS_H_

#include <fmt/format.h>
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

#include "models/character.hpp"
#include "models/file.hpp"
#include "models/task.hpp"

namespace lyceum_quest {

bool TryGetCharacter(std::string_view id,
                     userver::storages::postgres::ClusterPtr pg_cluster_,
                     TCharacter& character);

void AddActionCard(userver::formats::json::ValueBuilder& message,
                   userver::storages::postgres::ClusterPtr pg_cluster_,
                   std::string_view quest_task_id);

void AddAdminActionCard(userver::formats::json::ValueBuilder& message,
                   userver::storages::postgres::ClusterPtr pg_cluster_,
                   std::string_view quest_task_id);

void AddAttachments(userver::formats::json::ValueBuilder& message,
                    userver::storages::postgres::ClusterPtr pg_cluster_,
                    std::string_view quest_task_id);

void TryAddCharactersOfNextMessages(
    userver::formats::json::ValueBuilder& message,
    userver::storages::postgres::ClusterPtr pg_cluster_, const TTask& task);

}  // namespace lyceum_quest

#endif
