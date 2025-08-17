cmake_minimum_required(VERSION 3.12)
project(lyceum_quest CXX)


# Adding userver dependency
find_package(userver COMPONENTS core postgresql QUIET)
if(NOT userver_FOUND)  # Fallback to subdirectory usage
    # Enable userver libraries that are needed in this project
    set(USERVER_FEATURE_POSTGRESQL ON CACHE BOOL "" FORCE)

    # Compatibility mode: some systems don't support these features
    set(USERVER_FEATURE_CRYPTOPP_BLAKE2 OFF CACHE BOOL "" FORCE)
    set(USERVER_FEATURE_GRPC_CHANNELZ OFF CACHE BOOL "" FORCE)
    set(USERVER_FEATURE_REDIS_HI_MALLOC ON CACHE BOOL "" FORCE)

    if (EXISTS ${CMAKE_CURRENT_SOURCE_DIR}/third_party/userver)
        message(STATUS "Using userver framework from third_party/userver")
        add_subdirectory(third_party/userver)
    else()
        message(FATAL_ERROR "Either install the userver or provide a path to it")
    endif()
endif()

userver_setup_environment()


# Common sources
add_library(${PROJECT_NAME}_objs OBJECT
    src/models/user.hpp
    src/models/user.cpp
    src/models/task.hpp
    src/models/task.cpp
    src/models/role.hpp
    src/models/role.cpp
    src/models/user_status.hpp
    src/models/user_status.cpp
    src/models/character.hpp
    src/models/character.cpp
    src/models/file.hpp
    src/models/file.cpp
    src/models/session.hpp
    src/models/quest.hpp
    src/models/quest.cpp
    src/models/task_x_files.hpp
    src/handlers/v1/get-cities/view.hpp
    src/handlers/v1/get-cities/view.cpp
    src/handlers/v1/get-quest/view.hpp
    src/handlers/v1/get-quest/view.cpp
    src/handlers/v1/analytics/put-is-redirected/view.hpp
    src/handlers/v1/analytics/put-is-redirected/view.cpp
    src/handlers/v1/post-quest/view.hpp
    src/handlers/v1/post-quest/view.cpp
    src/handlers/api/v1/options/view.hpp
    src/handlers/api/v1/options/view.cpp
    src/handlers/api/v1/roles/view.cpp
    src/handlers/api/v1/roles/view.hpp
    src/handlers/api/v1/statuses/view.cpp
    src/handlers/api/v1/statuses/view.hpp
    src/handlers/api/v1/characters/get-characters/view.hpp
    src/handlers/api/v1/characters/get-characters/view.cpp
    src/handlers/api/v1/characters/get-character/view.hpp
    src/handlers/api/v1/characters/get-character/view.cpp
    src/handlers/api/v1/characters/add-character/view.hpp
    src/handlers/api/v1/characters/add-character/view.cpp
    src/handlers/api/v1/characters/update-character/view.hpp
    src/handlers/api/v1/characters/update-character/view.cpp
    src/handlers/api/v1/characters/delete-character/view.hpp
    src/handlers/api/v1/characters/delete-character/view.cpp
    src/handlers/api/v1/managers/get-managers/view.hpp
    src/handlers/api/v1/managers/get-managers/view.cpp
    src/handlers/api/v1/managers/get-manager/view.hpp
    src/handlers/api/v1/managers/get-manager/view.cpp
    src/handlers/api/v1/managers/add-manager/view.hpp
    src/handlers/api/v1/managers/add-manager/view.cpp
    src/handlers/api/v1/managers/update-manager/view.hpp
    src/handlers/api/v1/managers/update-manager/view.cpp
    src/handlers/api/v1/login/view.hpp
    src/handlers/api/v1/login/view.cpp
    src/handlers/api/v1/logout/view.hpp
    src/handlers/api/v1/logout/view.cpp
    src/handlers/api/v1/reset-password/get-reset-password/view.hpp
    src/handlers/api/v1/reset-password/get-reset-password/view.cpp
    src/handlers/api/v1/reset-password/patch-reset-password/view.hpp
    src/handlers/api/v1/reset-password/patch-reset-password/view.cpp
    src/handlers/api/v1/update-password/view.hpp
    src/handlers/api/v1/update-password/view.cpp
    src/handlers/api/v1/user-info/get-info/view.hpp
    src/handlers/api/v1/user-info/get-info/view.cpp
    src/handlers/api/v1/user-info/change-info/view.hpp
    src/handlers/api/v1/user-info/change-info/view.cpp
    src/handlers/api/v1/quests/get-quests/view.hpp
    src/handlers/api/v1/quests/get-quests/view.cpp
    src/handlers/api/v1/quests/get-quest/view.hpp
    src/handlers/api/v1/quests/get-quest/view.cpp
    src/handlers/api/v1/quests/add-quest/view.hpp
    src/handlers/api/v1/quests/add-quest/view.cpp
    src/handlers/api/v1/quests/update-quest/view.hpp
    src/handlers/api/v1/quests/update-quest/view.cpp
    src/handlers/api/v1/upload-file/view.hpp
    src/handlers/api/v1/upload-file/view.cpp
    src/handlers/lib/auth.hpp
    src/handlers/lib/auth.cpp
    src/handlers/lib/check_admin.hpp
    src/handlers/lib/check_admin.cpp
    src/handlers/lib/quest_details.hpp
    src/handlers/lib/quest_details.cpp
    src/handlers/lib/cors_middleware.hpp
    src/handlers/lib/json_middleware.hpp
)
target_link_libraries(${PROJECT_NAME}_objs PUBLIC userver::postgresql)


# The Service
add_executable(${PROJECT_NAME} src/main.cpp)
target_link_libraries(${PROJECT_NAME} PRIVATE ${PROJECT_NAME}_objs)
target_include_directories(${PROJECT_NAME}_objs PRIVATE src/)


# Unit Tests
add_executable(${PROJECT_NAME}_unittest
    
)
target_link_libraries(${PROJECT_NAME}_unittest PRIVATE ${PROJECT_NAME}_objs userver::utest)
add_google_tests(${PROJECT_NAME}_unittest)


# Benchmarks
add_executable(${PROJECT_NAME}_benchmark
    
)
target_link_libraries(${PROJECT_NAME}_benchmark PRIVATE ${PROJECT_NAME}_objs userver::ubench)
add_google_benchmark_tests(${PROJECT_NAME}_benchmark)


# Functional Tests
include(UserverTestsuite)

userver_testsuite_add_simple()


# Install
include(GNUInstallDirs)

if(DEFINED ENV{PREFIX})
  message(STATUS "Set install prefix: $ENV{PREFIX}")
  file(TO_CMAKE_PATH "$ENV{PREFIX}" PREFIX_PATH)
  set(CMAKE_INSTALL_PREFIX ${PREFIX_PATH})
endif()

file(GLOB CONFIGS_FILES ${CMAKE_CURRENT_SOURCE_DIR}/configs/*.yaml ${CMAKE_CURRENT_SOURCE_DIR}/configs/*.json)

install(TARGETS ${PROJECT_NAME} DESTINATION ${CMAKE_INSTALL_BINDIR} COMPONENT ${PROJECT_NAME})
install(FILES ${CONFIGS_FILES} DESTINATION ${CMAKE_INSTALL_SYSCONFDIR}/${PROJECT_NAME} COMPONENT ${PROJECT_NAME})
