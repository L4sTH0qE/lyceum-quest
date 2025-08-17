#include "view.hpp"

#include <fmt/format.h>
#include <chrono>
#include <cstddef>
#include <cstdlib>
#include <ctime>
#include <iomanip>
#include <sstream>

#include <string>
#include <string_view>
#include <userver/clients/http/client.hpp>
#include <userver/clients/http/component.hpp>
#include <userver/clients/http/request.hpp>
#include <userver/components/component_context.hpp>
#include <userver/crypto/hash.hpp>
#include <userver/http/content_type.hpp>
#include <userver/server/handlers/http_handler_base.hpp>
#include <userver/server/http/http_request.hpp>
#include <userver/server/http/http_status.hpp>
#include <userver/storages/postgres/cluster.hpp>
#include <userver/storages/postgres/component.hpp>
#include <userver/utils/assert.hpp>

#include "handlers/lib/auth.hpp"

namespace lyceum_quest {

namespace {

class UploadFile final : public userver::server::handlers::HttpHandlerBase {
 public:
  static constexpr std::string_view kName = "handler-v1-upload-file";

  UploadFile(const userver::components::ComponentConfig& config,
             const userver::components::ComponentContext& component_context)
      : HttpHandlerBase(config, component_context),
        pg_cluster_(
            component_context
                .FindComponent<userver::components::Postgres>("postgres-db-1")
                .GetCluster()),
        http_client_{
            component_context.FindComponent<userver::components::HttpClient>()
                .GetHttpClient()} {}

  std::string HandleRequestThrow(
      const userver::server::http::HttpRequest& request,
      userver::server::request::RequestContext&) const override {
    auto session = lyceum_quest::GetSessionInfo(pg_cluster_, request);
    auto& response = request.GetHttpResponse();

    if (!session) {
      response.SetStatus(userver::server::http::HttpStatus::kUnauthorized);
      userver::formats::json::ValueBuilder result;
      result["detail"] = "Invalid or expired Authorization token";
      return userver::formats::json::ToString(result.ExtractValue());
    }

    const auto content_type =
        userver::http::ContentType(request.GetHeader("Content-Type"));

    if (content_type != "multipart/form-data") {
      response.SetStatus(userver::server::http::HttpStatus::kBadRequest);
      userver::formats::json::ValueBuilder result;
      result["detail"] = "Expected 'multipart/form-data' content type";
      return userver::formats::json::ToString(result.ExtractValue());
    }

    if (!request.HasFormDataArg("file") || !request.HasFormDataArg("type") ||
        !request.HasFormDataArg("file_name")) {
      response.SetStatus(userver::server::http::HttpStatus::kBadRequest);
      userver::formats::json::ValueBuilder result;
      result["detail"] = "Expected fields file, type and file_name";
      return userver::formats::json::ToString(result.ExtractValue());
    }

    const auto& file = request.GetFormDataArg("file");
    const auto& type = request.GetFormDataArg("type").value;
    const auto& file_name = request.GetFormDataArg("file_name").value;

    size_t index = file_name.rfind('.');

    if (index == std::string::npos ||
        file_name.find('/') != std::string::npos) {
      response.SetStatus(userver::server::http::HttpStatus::kBadRequest);
      userver::formats::json::ValueBuilder result;
      result["detail"] = "Incorrect file_name";
      return userver::formats::json::ToString(result.ExtractValue());
    }

    std::string extension =
        std::string(file_name.substr(index + 1, file_name.size() - index - 1));
    std::string directory{};

    if (type == "image") {
      directory = "images";
    } else if (type == "file") {
      directory = "files";
    } else if (type == "video") {
      directory = "videos";
    } else {
      response.SetStatus(userver::server::http::HttpStatus::kBadRequest);
      userver::formats::json::ValueBuilder result;
      result["detail"] = "Expected fields file, type and file_name";
      return userver::formats::json::ToString(result.ExtractValue());
    }

    int size = file.value.size() / 1024;
    std::string id =
        pg_cluster_
            ->Execute(userver::storages::postgres::ClusterHostType::kMaster,
                      "INSERT INTO lyceum_quest.file(name, type, extension, "
                      "size_in_kbytes, url) VALUES"
                      "($1, $2, $3, $4, $5) RETURNING id",
                      file_name, type, extension, size, "")
            .AsSingleRow<std::string>();

    auto now = std::chrono::system_clock::now();
    auto time_t_now = std::chrono::system_clock::to_time_t(now);
    std::tm tm_now;
    ::gmtime_r(&time_t_now, &tm_now);

    // Формирование строки даты в формате YYYYMMDD
    std::stringstream date_ss;
    date_ss << std::setfill('0') << std::setw(4) << (tm_now.tm_year + 1900)
            << std::setw(2) << (tm_now.tm_mon + 1) << std::setw(2)
            << tm_now.tm_mday;
    std::string date = date_ss.str();

    std::stringstream x_amz_date_time_ss;
    x_amz_date_time_ss << std::put_time(
        &tm_now, "%Y%m%dT%H%M%SZ");  // Формат 20240815T103704Z
    std::string x_amz_date_time = x_amz_date_time_ss.str();

    const std::string secret_key = "YCP78h5LGtenHhkE3EmAwhmbzOCNOL37Y2oY4I3j";
    const std::string key_id = "YCAJE8S0uXxCwjMZbvH0Z8eUz";

    std::string new_file_name = id + "." + extension;
    std::string url = fmt::format("https://storage.yandexcloud.net/{}/{}/{}",
                                  bucket_name, directory, new_file_name);

    std::string signature = GetSignature(new_file_name, x_amz_date_time, date,
                                         secret_key, directory);

    std::string auth = fmt::format(
        "AWS4-HMAC-SHA256 Credential={0}/{1}/ru-central1/s3/aws4_request, "
        "SignedHeaders=host;x-amz-content-sha256;x-amz-date, Signature={2}",
        key_id, date, signature);

    auto client_request =
        http_client_.CreateRequest()
            .put()
            .data(std::string(std::move(file.value)))
            .url(url)
            .headers({{"Authorization", auth},
                      {"host", "storage.yandexcloud.net"},
                      {"x-amz-content-sha256", "UNSIGNED-PAYLOAD"},
                      {"X-amz-date", x_amz_date_time}})
            .retry(1)
            .http_version(userver::clients::http::HttpVersion::k2)
            .timeout(2000);

    auto s3_response = client_request.perform();

    if (!s3_response->IsOk()) {
      pg_cluster_->Execute(
          userver::storages::postgres::ClusterHostType::kMaster,
          "DELETE FROM lyceum_quest.file WHERE id = $1", id);

      response.SetStatus(userver::server::http::HttpStatus::kBadRequest);
      userver::formats::json::ValueBuilder result;
      result["detail"] = "Something with storage went wrong(";
      return userver::formats::json::ToString(result.ExtractValue());
    }

    pg_cluster_->Execute(userver::storages::postgres::ClusterHostType::kMaster,
                         "UPDATE lyceum_quest.file SET url = $1 WHERE id = $2",
                         url, id);

    userver::formats::json::ValueBuilder result;
    result["id"] = id;
    result["url"] = url;
    return userver::formats::json::ToString(result.ExtractValue());
  }

 private:
  userver::storages::postgres::ClusterPtr pg_cluster_;
  const std::string bucket_name = "lyceum-cloud";
  userver::clients::http::Client& http_client_;

  std::string GetCanonicalRequests(const std::string_view file_name,
                                   const std::string_view x_amz_date_time,
                                   const std::string_view directory) const {
    return fmt::format(
        "PUT\n/{0}/{1}/{2}\n\nhost:storage.yandexcloud.net\n"
        "x-amz-content-sha256:UNSIGNED-PAYLOAD\nx-amz-date:{3}\n\nhost;x-amz-"
        "content-sha256;x-amz-date\nUNSIGNED-PAYLOAD",
        bucket_name, directory, file_name, x_amz_date_time);
  }

  std::string GetSignature(const std::string_view file_name,
                           const std::string_view x_amz_date_time,
                           const std::string_view date,
                           const std::string_view secret_key,
                           const std::string_view directory) const {
    std::string canonical_req =
        GetCanonicalRequests(file_name, x_amz_date_time, directory);
    std::string string_to_sign = fmt::format(
        "AWS4-HMAC-SHA256\n{}\n{}/ru-central1/s3/aws4_request\n{}",
        x_amz_date_time, date, userver::crypto::hash::Sha256(canonical_req));

    std::string date_key = userver::crypto::hash::HmacSha256(
        "AWS4" + std::string(secret_key), date,
        userver::crypto::hash::OutputEncoding::kBinary);
    std::string region_key = userver::crypto::hash::HmacSha256(
        date_key, "ru-central1",
        userver::crypto::hash::OutputEncoding::kBinary);
    std::string service_key = userver::crypto::hash::HmacSha256(
        region_key, "s3", userver::crypto::hash::OutputEncoding::kBinary);
    std::string signing_key = userver::crypto::hash::HmacSha256(
        service_key, "aws4_request",
        userver::crypto::hash::OutputEncoding::kBinary);

    return userver::crypto::hash::HmacSha256(
        signing_key, string_to_sign,
        userver::crypto::hash::OutputEncoding::kBase16);
  }
};

}  // namespace

void AppendUploadFile(userver::components::ComponentList& component_list) {
  component_list.Append<UploadFile>();
}
}  // namespace lyceum_quest