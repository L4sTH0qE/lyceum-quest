#include <userver/clients/dns/component.hpp>
#include <userver/clients/http/component.hpp>
#include <userver/components/minimal_server_component_list.hpp>
#include <userver/server/handlers/ping.hpp>
#include <userver/server/handlers/server_monitor.hpp>
#include <userver/server/handlers/tests_control.hpp>
#include <userver/storages/postgres/component.hpp>
#include <userver/testsuite/testsuite_support.hpp>
#include <userver/utils/daemon_run.hpp>

#include "handlers/api/v1/options/view.hpp"

#include "handlers/api/v1/characters/add-character/view.hpp"
#include "handlers/api/v1/characters/delete-character/view.hpp"
#include "handlers/api/v1/characters/get-character/view.hpp"
#include "handlers/api/v1/characters/get-characters/view.hpp"
#include "handlers/api/v1/characters/update-character/view.hpp"
#include "handlers/api/v1/login/view.hpp"
#include "handlers/api/v1/logout/view.hpp"
#include "handlers/api/v1/managers/add-manager/view.hpp"
#include "handlers/api/v1/managers/get-manager/view.hpp"
#include "handlers/api/v1/managers/get-managers/view.hpp"
#include "handlers/api/v1/managers/update-manager/view.hpp"
#include "handlers/api/v1/quests/add-quest/view.hpp"
#include "handlers/api/v1/quests/get-quest/view.hpp"
#include "handlers/api/v1/quests/get-quests/view.hpp"
#include "handlers/api/v1/quests/update-quest/view.hpp"
#include "handlers/api/v1/reset-password/get-reset-password/view.hpp"
#include "handlers/api/v1/reset-password/patch-reset-password/view.hpp"
#include "handlers/api/v1/roles/view.hpp"
#include "handlers/api/v1/statuses/view.hpp"
#include "handlers/api/v1/update-password/view.hpp"
#include "handlers/api/v1/upload-file/view.hpp"
#include "handlers/api/v1/user-info/change-info/view.hpp"
#include "handlers/api/v1/user-info/get-info/view.hpp"
#include "handlers/lib/cors_middleware.hpp"
#include "handlers/lib/json_middleware.hpp"
#include "handlers/v1/analytics/put-is-redirected/view.hpp"
#include "handlers/v1/get-cities/view.hpp"
#include "handlers/v1/get-quest/view.hpp"
#include "handlers/v1/post-quest/view.hpp"

int main(int argc, char* argv[]) {
  auto component_list =
      userver::components::MinimalServerComponentList()
          .Append<userver::server::handlers::Ping>()
          .Append<userver::server::handlers::ServerMonitor>()
          .Append<userver::components::TestsuiteSupport>()
          .Append<userver::components::HttpClient>()
          .Append<userver::server::handlers::TestsControl>()
          .Append<userver::components::Postgres>("postgres-db-1")
          .Append<userver::clients::dns::Component>()
          .Append<lyceum_quest::CorsMiddlewareFactory>()
          .Append<lyceum_quest::JsonMiddlewareFactory>();

  lyceum_quest::AppendLoginUser(component_list);
  lyceum_quest::AppendLogoutUser(component_list);

  lyceum_quest::AppendGetCities(component_list);

  lyceum_quest::AppendGetCharacters(component_list);
  lyceum_quest::AppendGetCharacter(component_list);
  lyceum_quest::AppendAddCharacter(component_list);
  lyceum_quest::AppendUpdateCharacter(component_list);
  lyceum_quest::AppendDeleteCharacter(component_list);
  lyceum_quest::AppendOptionsCharacter(component_list);

  lyceum_quest::AppendPostQuest(component_list);
  lyceum_quest::AppendGetQuest(component_list);
  lyceum_quest::AppendGetRoles(component_list);
  lyceum_quest::AppendGetStatuses(component_list);

  lyceum_quest::AppendGetManagers(component_list);
  lyceum_quest::AppendGetManager(component_list);
  lyceum_quest::AppendAddManager(component_list);
  lyceum_quest::AppendUpdateManager(component_list);

  lyceum_quest::AppendGetResetPassword(component_list);
  lyceum_quest::AppendPatchResetPassword(component_list);

  lyceum_quest::AppendUpdatePassword(component_list);

  lyceum_quest::AppendGetUserInfo(component_list);
  lyceum_quest::AppendChangeUserInfo(component_list);

  lyceum_quest::AppendGetAdminQuests(component_list);
  lyceum_quest::AppendGetAdminQuest(component_list);
  lyceum_quest::AppendAddAdminQuest(component_list);
  lyceum_quest::AppendUpdateAdminQuest(component_list);

  lyceum_quest::AppendUploadFile(component_list);

  lyceum_quest::AppendPutIsRedirected(component_list);

  return userver::utils::DaemonMain(argc, argv, component_list);
}
