#pragma once

#include <userver/server/http/http_request.hpp>
#include <userver/storages/postgres/cluster.hpp>
#include <userver/utils/datetime.hpp>

#include "models/session.hpp"

namespace lyceum_quest {

const std::string USER_TICKET_HEADER_NAME = "Authorization";

std::optional<TSession> GetSessionInfo(
    userver::storages::postgres::ClusterPtr pg_cluster,
    const userver::server::http::HttpRequest& request);

}  // namespace lyceum_quest
