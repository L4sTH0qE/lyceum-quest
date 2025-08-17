#ifndef TSESSION_H_
#define TSESSION_H_

#include <chrono>
#include <string>

namespace lyceum_quest {

struct TSession {
  std::string id;
  std::string user_id;
  std::chrono::system_clock::time_point begin_timestamp;
  std::chrono::system_clock::time_point end_timestamp;
};

}  // namespace lyceum_quest

#endif
