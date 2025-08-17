#ifndef CHECKADMIN_H_
#define CHECKADMIN_H_

#include <string>
#include <userver/storages/postgres/cluster.hpp>

namespace lyceum_quest {

bool CheckAdmin(userver::storages::postgres::ClusterPtr pg_cluster,
                std::string user_id);

}  // namespace lyceum_quest

#endif
