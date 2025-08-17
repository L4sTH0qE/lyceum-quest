#pragma once
#include <userver/server/http/http_request.hpp>
#include <userver/server/middlewares/http_middleware_base.hpp>

namespace lyceum_quest {

class JsonMiddleware : public userver::server::middlewares::HttpMiddlewareBase {
 public:
  static constexpr std::string_view kName{"json-middleware"};
  explicit JsonMiddleware(const userver::server::handlers::HttpHandlerBase&) {}

 private:
  void HandleRequest(
      userver::server::http::HttpRequest& request,
      userver::server::request::RequestContext& context) const override {
    Next(request, context);

    request.GetHttpResponse().SetContentType("application/json");
  }
};

using JsonMiddlewareFactory =
    userver::server::middlewares::SimpleHttpMiddlewareFactory<JsonMiddleware>;

}  // namespace lyceum_quest
