FROM nginx:stable-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN mkdir -p /usr/share/nginx/html/chat
RUN mkdir -p /usr/share/nginx/html/admin
RUN mkdir -p /usr/share/nginx/html/openapi

COPY --from=lyceum-cloud-client:latest /usr/share/nginx/html /usr/share/nginx/html/chat
COPY --from=lyceum-cloud-admin:latest /usr/share/nginx/html /usr/share/nginx/html/admin
COPY --from=cr.yandex/crpuo6a2ikk02e6gt8b7/swagger_lyceum:v1.0_latest /usr/share/nginx/html /usr/share/nginx/html/openapi

EXPOSE 80
EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]
