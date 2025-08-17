CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
DROP SCHEMA IF EXISTS lyceum_quest CASCADE;

CREATE SCHEMA IF NOT EXISTS lyceum_quest;

-- Город
CREATE TABLE IF NOT EXISTS lyceum_quest.city (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    name TEXT NOT NULL,
    has_lyceum BOOLEAN DEFAULT FALSE NOT NULL
);

-- Роль манагера
CREATE TABLE IF NOT EXISTS lyceum_quest.user_role (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    title TEXT NOT NULL
);

-- Статус манагера
CREATE TABLE IF NOT EXISTS lyceum_quest.user_status (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    title TEXT NOT NULL
);

-- Манагер
CREATE TABLE IF NOT EXISTS lyceum_quest.user (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    login TEXT NOT NULL,
    password TEXT NOT NULL,
    first_name TEXT NOT NULL,
    second_name TEXT NOT NULL,
    status_id TEXT NOT NULL DEFAULT '1',
    role_id TEXT NOT NULL,
    create_timestamp TIMESTAMP NOT NULL DEFAULT now(),
    foreign key(role_id) REFERENCES lyceum_quest.user_role(id),
    foreign key(status_id) REFERENCES lyceum_quest.user_status(id)
);

-- Квест
CREATE TABLE IF NOT EXISTS lyceum_quest.quest (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    user_id TEXT NOT NULL REFERENCES lyceum_quest.user(id),
    name TEXT NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT FALSE,
    public_beautiful_name TEXT,
    create_timestamp TIMESTAMP NOT NULL DEFAULT now()
);

-- Файл
CREATE TABLE IF NOT EXISTS lyceum_quest.file (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    extension TEXT NOT NULL,
    size_in_kbytes INTEGER NOT NULL,
    url TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS lyceum_quest.quest_task_type (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    type_name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS lyceum_quest.character (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    name TEXT NOT NULL,
    profile_picture TEXT NOT NULL,
    full_size_picture TEXT NOT NULL,
    create_timestamp TIMESTAMP NOT NULL DEFAULT now()
);

-- Шаг квеста
CREATE TABLE IF NOT EXISTS lyceum_quest.quest_task (
    id TEXT PRIMARY KEY NOT NULL,
    quest_id TEXT NOT NULL,
    order_id TEXT NOT NULL,
    is_first BOOLEAN NOT NULL DEFAULT FALSE,
    quest_task_type_id TEXT NOT NULL,
    data TEXT NOT NULL,
    character_id TEXT,
    author VARCHAR(10) NOT NULL,
    foreign key(quest_id) REFERENCES lyceum_quest.quest(id),
    foreign key(character_id) REFERENCES lyceum_quest.character(id),
    foreign key(quest_task_type_id) REFERENCES lyceum_quest.quest_task_type(id)
);

CREATE TABLE IF NOT EXISTS lyceum_quest.quest_task_x_files (
    file_id TEXT DEFAULT uuid_generate_v4() NOT NULL,
    quest_task_id TEXT DEFAULT uuid_generate_v4() NOT NULL,
    PRIMARY KEY (file_id, quest_task_id),
    foreign key(file_id) REFERENCES lyceum_quest.file(id),
    foreign key(quest_task_id) REFERENCES lyceum_quest.quest_task(id)
);


-- Аналитика

CREATE TABLE IF NOT EXISTS lyceum_quest.session (
    session_id TEXT PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    date TEXT NOT NULL,
    begin_timestamp TIMESTAMP NOT NULL DEFAULT now(),
    quest_id TEXT NOT NULL,
    quest_time BIGINT NOT NULL DEFAULT 0,
    is_dropped BOOLEAN DEFAULT TRUE NOT NULL,
    dropped_id TEXT,
    is_redirected BOOLEAN DEFAULT FALSE NOT NULL,
    final_id TEXT
);

---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS lyceum_quest.auth_session (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    user_id TEXT NOT NULL UNIQUE,
    begin_timestamp TIMESTAMP NOT NULL DEFAULT now(),
    end_timestamp TIMESTAMP NOT NULL DEFAULT now() + INTERVAL '24 hours',
    foreign key(user_id) REFERENCES lyceum_quest.user(id)
);