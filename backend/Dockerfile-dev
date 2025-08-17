FROM ghcr.io/userver-framework/ubuntu-22.04-userver-pg:latest

# Установка необходимых инструментов и зависимостей
RUN apt-get update && apt-get install -y \
    cmake \
    g++ \
    make \
    python3-pip \
    postgresql-client \
    clang-format \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Установка зависимостей Python
COPY requirements.txt /tmp/requirements.txt
RUN pip3 install --no-cache-dir -r /tmp/requirements.txt && rm /tmp/requirements.txt

# Копирование исходного кода
COPY . /lyceum_quest
WORKDIR /lyceum_quest
COPY configs /lyceum_quest/configs

# Сборка и установка
RUN cmake -B build_release -DCMAKE_BUILD_TYPE=Release -DCMAKE_EXPORT_COMPILE_COMMANDS=ON \
    && cmake --build build_release -j$(nproc) --target lyceum_quest

# Применение SQL-скриптов к базе данных (оставляем как есть)
CMD psql postgresql://user:password@service-postgres:5432/lyceum_quest_db_1 -f ./postgresql/schemas/db_1.sql -f ./postgresql/data/initial_data.sql \
    && ./build_release/lyceum_quest --config ./configs/static_config.yaml --config_vars ./configs/config_vars.docker.yaml
