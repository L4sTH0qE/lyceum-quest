#pragma once
#include <userver/server/http/http_request.hpp>
#include <userver/server/middlewares/http_middleware_base.hpp>

namespace lyceum_quest {

class CorsMiddleware : public userver::server::middlewares::HttpMiddlewareBase {
 public:
  static constexpr std::string_view kName{"cors-middleware"};
  explicit CorsMiddleware(const userver::server::handlers::HttpHandlerBase&) {}

 private:
  void HandleRequest(
      userver::server::http::HttpRequest& request,
      userver::server::request::RequestContext& context) const override {
    Next(request, context);

    request.GetHttpResponse().SetHeader(kAccessControlAllowOriginHeader, "*");
    request.GetHttpResponse().SetHeader(kAccessControlAllowHeadersHeader,
                                        "Authorization, Content-Type");
    request.GetHttpResponse().SetHeader(kAccessControlAllowCredentialsHeader,
                                        "true");
  }

  static constexpr userver::http::headers::PredefinedHeader
      kAccessControlAllowOriginHeader{"Access-Control-Allow-Origin"};
  static constexpr userver::http::headers::PredefinedHeader
      kAccessControlAllowHeadersHeader{"Access-Control-Allow-Headers"};
  static constexpr userver::http::headers::PredefinedHeader
      kAccessControlAllowCredentialsHeader{"Access-Control-Allow-Credentials"};
};

using CorsMiddlewareFactory =
    userver::server::middlewares::SimpleHttpMiddlewareFactory<CorsMiddleware>;

}  // namespace lyceum_quest
