import pathlib

import datetime

import pytest

import aiohttp

from testsuite.databases.pgsql import discover


pytest_plugins = ['pytest_userver.plugins.postgresql']


@pytest.fixture(scope='session')
def service_source_dir():
    """Path to root directory service."""
    return pathlib.Path(__file__).parent.parent


@pytest.fixture(scope='session')
def initial_data_path(service_source_dir):
    """Path for find files with data"""
    return [
        service_source_dir / 'postgresql/data',
    ]


@pytest.fixture(scope='session')
def pgsql_local(service_source_dir, pgsql_local_create):
    """Create schemas databases for tests"""
    databases = discover.find_schemas(
        'lyceum_quest',  # service name that goes to the DB connection
        [service_source_dir.joinpath('postgresql/schemas')],
    )
    return pgsql_local_create(list(databases.values()))


def _serialize(value):
    if isinstance(value, datetime.datetime):
        return datetime.datetime.strftime(value, '%Y-%m-%d %H:%M:%S')
    return value


def _serialize_dict(dict_):
    for key in dict_:
        value = dict_[key]
        dict_[key] = _serialize(value)
    return dict_


# fixture to parse mocked db
@pytest.fixture
def fetch_table_data(pgsql):
    def wrapper(
            table_name: str,
            table_schema: str = 'lyceum_quest',
    ):
        with pgsql['db_1'].dict_cursor() as cursor:
            cursor.execute(
                f"""
                SELECT
                    *
                FROM {table_schema}.{table_name};
                """,
            )

            return [_serialize_dict(dict(r)) for r in cursor.fetchall()]

    return wrapper


@pytest.fixture
def user_data():
    """Provide user data for login requests for tests"""
    class UserTestData:
        def __init__(self):
            self.full_data = {
                "login": "aleksashkin@yandex-team.ru", "password": "1234"}
            self.no_data = {}
            self.login_only_data = {"login": "aleksashkin@yandex-team.ru"}
            self.password_only_data = {"password": "1234"}
            self.login_empty_data = {"login": "", "password": "1234"}
            self.password_empty_data = {
                "login": "aleksashkin@yandex-team.ru", "password": ""}
            self.wrong_login_data = {
                "login": "google@ya.ru", "password": "1234"}
            self.wrong_password_data = {
                "login": "aleksashkin@yandex-team.ru", "password": "1111"}

        # Transform json to multipart/form-data
        def get_multipart_form_data(self, user_data):
            with aiohttp.MultipartWriter('form-data') as data:
                for key, value in user_data.items():
                    payload = aiohttp.payload.StringPayload(value)
                    payload.set_content_disposition('form-data', name=key)
                    data.append_payload(payload)
            return data
    return UserTestData()


@pytest.fixture
def password_data():
    """Provide user data for login requests for tests"""
    class PasswordTestData:
        def __init__(self):
            self.login = "aleksashkin@yandex-team.ru"
            self.invalid_login = "invalid_login"
            self.full_data = {
                "id": "1", "new_password": "Qwerty1234!", "new_password_again": "Qwerty1234!"}
            self.no_data = {}
            self.different_passwords = {
                "id": "1", "new_password": "Qwerty1234!", "new_password_again": "Qwerty1234!!"}
            self.invalid_password_format = {
                "id": "1", "new_password": "1234", "new_password_again": "1234"}
            self.invalid_id = {
                "id": "0", "new_password": "Qwerty1234!", "new_password_again": "Qwerty1234!"}
    return PasswordTestData()


@pytest.fixture
def info_data():
    """Provide user info for change-info requests for tests"""
    class InfoTestData:
        def __init__(self):
            self.full_data = {"new_first_name": "Alex",
                              "new_second_name": "Meycer"}
            self.no_data = {}
            self.first_name_only_data = {"new_first_name": "Alex"}
            self.second_name_only_data = {"new_second_name": "Meycer"}
            self.first_name_empty_data = {
                "new_first_name": "", "new_second_name": "Meycer"}
            self.second_name_empty_data = {
                "new_first_name": "Alex", "new_second_name": ""}
    return InfoTestData()


@pytest.fixture
def character_data():
    """Provide character info for character requests for tests"""
    class CharacterTestData:
        def __init__(self):
            self.full_data = {"name": "test_character",
                              "avatar": "avatar_url", "full_size_image": "full_size_image_url"}
            self.no_data = {}
            self.invalid_name_data = {
                "name": "", "avatar": "avatar_url", "full_size_image": "full_size_image_url"}
            self.invalid_avatar_data = {
                "name": "test_character", "avatar": "", "full_size_image": "full_size_image_url"}
            self.invalid_full_size_image_data = {
                "name": "", "avatar": "avatar_url", "full_size_image": ""}
    return CharacterTestData()


@pytest.fixture
def manager_data():
    """Provide manager info for manager requests for tests"""
    class ManagerTestData:
        def __init__(self):
            self.full_data = {"login": "alex@yandex-team.ru", "password": "Qwerty1234!",
                              "first_name": "Alex", "second_name": "Meycer", "role_id": "2"}
            self.no_data = {}
            self.invalid_login_data = {"login": "alex@yandex.ru", "password": "Qwerty1234!",
                                       "first_name": "Alex", "second_name": "Meycer", "role_id": "2"}
            self.existing_login_data = {"login": "aleksashkin@yandex-team.ru",
                                        "password": "Qwerty1234!", "first_name": "Alex", "second_name": "Meycer", "role_id": "2"}
            self.invalid_password_data = {"login": "alex@yandex-team.ru", "password": "1234",
                                          "first_name": "Alex", "second_name": "Meycer", "role_id": "2"}
            self.invalid_role_data = {"login": "alex@yandex-team.ru", "password": "1234",
                                      "first_name": "Alex", "second_name": "Meycer", "role_id": "10"}
            self.invalid_name_data = {"login": "alex@yandex-team.ru",
                                      "password": "1234", "first_name": "", "second_name": "", "role_id": "10"}
            self.update_data = {"role_id": "1", "status_id": "1"}
            self.invalid_update_data = {"role_id": "10", "status_id": "3"}
    return ManagerTestData()


@pytest.fixture
def admin_quest_data():
    """Provide quest info for admin-quest requests for tests"""
    class QuestTestData:
        def __init__(self):
            self.full_data = {"name": "quest 1", "is_available": True, "public_beautiful_name": "beautiful quest 1", "messages": [
                {"id": "1", "order_id": "1", "is_first": True, "quest_task_type_id": "3", "data": {
                    "next_task_id": "2"}, "character_id": "1", "author": "bot", "attachment_id": ["1"]},
                {"id": "2", "order_id": "2", "is_first": False, "quest_task_type_id": "1", "data": {
                    "text": "Да, крутая тема. Как туда попасть?", "next_task_id": "3"}, "character_id": "1", "author": "bot"},
                {"id": "3", "order_id": "3", "is_first": False, "quest_task_type_id": "5", "data": {"title": "Основы программирования на Python.", "text": "Годовой курс по разработке на Python для тех, кто хочет разобраться в основах языка, научиться делать прогнозы, строить графики, проводить аналитику и кодить простые программы", "action_button": {"action_url": "https://lyceum.yandex.ru/python", "placeholder": "Перейти на страницу курса"}, "next_task_button": {"placeholder": "Дальше"}, "next_task_id": "16"}, "character_id": "1", "author": "bot", "attachment_id": ["1"]}]}
            self.no_data = {}
            self.invalid_attachment_data = {"name": "quest 1", "is_available": True, "public_beautiful_name": "beautiful quest 1", "messages": [
                {"id": "1", "order_id": "1", "is_first": True, "quest_task_type_id": "3", "data": {"next_task_id": "2"}, "character_id": "1", "author": "bot", "attachment_id": ["10"]}]}
            self.invalid_character_data = {"name": "quest 1", "is_available": True, "public_beautiful_name": "beautiful quest 1", "messages": [
                {"id": "2", "order_id": "2", "is_first": False, "quest_task_type_id": "1", "data": {"text": "Да, крутая тема. Как туда попасть?", "next_task_id": "3"}, "author": "bot"}]}
            self.invalid_message_data = {"name": "quest 1", "is_available": True, "public_beautiful_name": "beautiful quest 1", "messages": [
                {"id": "2", "quest_task_type_id": "1", "data": {"text": "Да, крутая тема. Как туда попасть?", "next_task_id": "3"}, "character_id": "1", "author": "bot"}]}
            self.update_data = {"name": "updated quest 1",
                                "is_available": False, "messages": []}
            self.invalid_update_data = {"name": "updated quest 1", "messages": [
                {"id": "2", "quest_task_type_id": "1", "data": {"text": "Да, крутая тема. Как туда попасть?", "next_task_id": "3"}, "character_id": "1", "author": "bot"}]}
    return QuestTestData()


@pytest.fixture
def header_data():
    """Provide headers for admin endpoints"""
    class HeaderTestData:
        def __init__(self):
            self.true_header = {"Authorization": "Bearer 1"}
            self.wrong_header = {"Authorization": "Bearer 2"}
            self.no_header = {}

    return HeaderTestData()
