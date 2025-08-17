#pragma once

#include <string>
#include <userver/components/component_list.hpp>
#include <userver/server/handlers/http_handler_base.hpp>
#include <userver/storages/postgres/cluster.hpp>

namespace lyceum_quest {

void AppendUpdateManager(userver::components::ComponentList& component_list);

bool CheckUpdateManager(userver::storages::postgres::ClusterPtr pg_cluster_,
                        const userver::server::http::HttpRequest& request,
                        std::string user_id);

}  // namespace lyceum_quest
