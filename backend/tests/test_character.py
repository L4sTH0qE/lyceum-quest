import pytest
from tests.utils.my_helpers import is_uuidv4

from testsuite.databases import pgsql


# Start the tests via `make test-debug` or `make test-release`

@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_get_characters_no_header(service_client, header_data, fetch_table_data):
    response = await service_client.get(
        '/api/v1/admin/characters',
        headers=header_data.no_header
    )
    assert response.status == 401


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_get_characters_wrong_header(service_client, header_data, fetch_table_data):
    response = await service_client.get(
        '/api/v1/admin/characters',
        headers=header_data.wrong_header
    )
    assert response.status == 401


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_get_character_no_header(service_client, header_data, fetch_table_data):
    response = await service_client.get(
        '/api/v1/admin/characters/1',
        headers=header_data.no_header
    )
    assert response.status == 401


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_get_character_wrong_header(service_client, header_data, fetch_table_data):
    response = await service_client.get(
        '/api/v1/admin/characters/1',
        headers=header_data.wrong_header
    )
    assert response.status == 401


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_add_character_no_header(service_client, header_data, fetch_table_data):
    response = await service_client.post(
        '/api/v1/admin/characters',
        headers=header_data.no_header
    )
    assert response.status == 401


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_add_character_wrong_header(service_client, header_data, fetch_table_data):
    response = await service_client.post(
        '/api/v1/admin/characters',
        headers=header_data.wrong_header
    )
    assert response.status == 401


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_update_character_no_header(service_client, header_data, fetch_table_data):
    response = await service_client.patch(
        '/api/v1/admin/characters/1',
        headers=header_data.no_header
    )
    assert response.status == 401


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_update_character_wrong_header(service_client, header_data, fetch_table_data):
    response = await service_client.patch(
        '/api/v1/admin/characters/1',
        headers=header_data.wrong_header
    )
    assert response.status == 401


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_delete_character_no_header(service_client, header_data, fetch_table_data):
    response = await service_client.delete(
        '/api/v1/admin/characters/1',
        headers=header_data.no_header
    )
    assert response.status == 401


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_delete_character_wrong_header(service_client, header_data, fetch_table_data):
    response = await service_client.delete(
        '/api/v1/admin/characters/1',
        headers=header_data.wrong_header
    )
    assert response.status == 401


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_get_characters(service_client, header_data, fetch_table_data):
    response = await service_client.get(
        '/api/v1/admin/characters',
        headers=header_data.true_header
    )
    assert response.status == 200

    characters = response.json()

    assert len(characters) == 3

    assert characters[0]['id'] == '1'
    assert characters[0]['name'] == 'Петя'
    assert 'avatar' in characters[0]
    assert 'full_size_image' in characters[0]

    assert characters[1]['id'] == '2'
    assert characters[1]['name'] == 'Саша'
    assert 'avatar' in characters[1]
    assert 'full_size_image' in characters[1]

    assert characters[2]['id'] == '3'
    assert characters[2]['name'] == 'Преподаватель Сергей'
    assert 'avatar' in characters[2]
    assert 'full_size_image' in characters[2]

    # Check characters in db
    db_data = fetch_table_data('character')
    assert len(db_data) == 3


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_get_character(service_client, header_data, fetch_table_data):
    response = await service_client.get(
        '/api/v1/admin/characters/1',
        headers=header_data.true_header
    )
    assert response.status == 200

    character = response.json()

    assert character['id'] == '1'
    assert character['name'] == 'Петя'
    assert 'avatar' in character
    assert 'full_size_image' in character

    # Check characters in db
    db_data = fetch_table_data('character')
    assert len(db_data) == 3


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_get_character_wrong_id(service_client, header_data, fetch_table_data):
    response = await service_client.get(
        '/api/v1/admin/characters/0',
        headers=header_data.true_header
    )
    assert response.status == 404

    # Check characters in db
    db_data = fetch_table_data('character')
    assert len(db_data) == 3


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_add_character(service_client, header_data, character_data, fetch_table_data):
    data = character_data.full_data
    response = await service_client.post(
        '/api/v1/admin/characters',
        headers=header_data.true_header,
        json=data
    )
    assert response.status == 200

    created_character = response.json()

    assert is_uuidv4(created_character['id'])
    assert created_character['name'] == data['name']
    assert created_character['avatar'] == data['avatar']
    assert created_character['full_size_image'] == data['full_size_image']

    # Check character added to db
    db_data = fetch_table_data('character')
    assert len(db_data) == 4
    assert is_uuidv4(db_data[3]['id'])
    assert db_data[3]['name'] == data['name']
    assert db_data[3]['profile_picture'] == data['avatar']
    assert db_data[3]['full_size_picture'] == data['full_size_image']

    data = character_data.no_data
    response = await service_client.post(
        '/api/v1/admin/characters',
        headers=header_data.true_header,
        json=data
    )
    assert response.status == 400

    # Check character not added to db
    db_data = fetch_table_data('character')
    assert len(db_data) == 4

    data = character_data.invalid_name_data
    response = await service_client.post(
        '/api/v1/admin/characters',
        headers=header_data.true_header,
        json=data
    )
    assert response.status == 400

    # Check character not added to db
    db_data = fetch_table_data('character')
    assert len(db_data) == 4

    data = character_data.invalid_avatar_data
    response = await service_client.post(
        '/api/v1/admin/characters',
        headers=header_data.true_header,
        json=data
    )
    assert response.status == 400

    # Check character not added to db
    db_data = fetch_table_data('character')
    assert len(db_data) == 4

    data = character_data.invalid_full_size_image_data
    response = await service_client.post(
        '/api/v1/admin/characters',
        headers=header_data.true_header,
        json=data
    )
    assert response.status == 400

    # Check character not added to db
    db_data = fetch_table_data('character')
    assert len(db_data) == 4


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_delete_character(service_client, header_data, character_data, fetch_table_data):
    data = character_data.full_data
    response = await service_client.post(
        '/api/v1/admin/characters',
        headers=header_data.true_header,
        json=data
    )
    assert response.status == 200

    created_character = response.json()
    character_id = created_character['id']

    # Check character added to db
    db_data = fetch_table_data('character')
    assert len(db_data) == 4

    response = await service_client.delete(
        '/api/v1/admin/characters/' + character_id,
        headers=header_data.true_header,
    )
    assert response.status == 200

    character = response.json()

    assert character['id'] == character_id

    # Check character deleted from db
    db_data = fetch_table_data('character')
    assert len(db_data) == 3


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_delete_character_wrong_id(service_client, header_data, fetch_table_data):
    response = await service_client.delete(
        '/api/v1/admin/characters/0',
        headers=header_data.true_header
    )
    assert response.status == 404

    # Check characters in db
    db_data = fetch_table_data('character')
    assert len(db_data) == 3

    response = await service_client.delete(
        '/api/v1/admin/characters/1',
        headers=header_data.true_header
    )
    assert response.status == 404

    # Check characters in db
    db_data = fetch_table_data('character')
    assert len(db_data) == 3


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_patch_character(service_client, header_data, character_data, fetch_table_data):
    data = character_data.full_data
    response = await service_client.patch(
        '/api/v1/admin/characters/1',
        headers=header_data.true_header,
        json=data
    )
    assert response.status == 200

    updated_character = response.json()

    assert updated_character['id'] == '1'
    assert updated_character['name'] == data['name']
    assert updated_character['avatar'] == data['avatar']
    assert updated_character['full_size_image'] == data['full_size_image']

    # Check character updated in db
    db_data = fetch_table_data('character')
    assert len(db_data) == 3
    assert db_data[2]['id'] == '1'
    assert db_data[2]['name'] == data['name']
    assert db_data[2]['profile_picture'] == data['avatar']
    assert db_data[2]['full_size_picture'] == data['full_size_image']

    response = await service_client.patch(
        '/api/v1/admin/characters/1',
        headers=header_data.true_header,
        json={}
    )
    assert response.status == 200

    updated_character = response.json()

    assert updated_character['id'] == '1'
    assert updated_character['name'] == data['name']
    assert updated_character['avatar'] == data['avatar']
    assert updated_character['full_size_image'] == data['full_size_image']

    # Check character updated in db
    db_data = fetch_table_data('character')
    assert len(db_data) == 3
    assert db_data[2]['id'] == '1'
    assert db_data[2]['name'] == data['name']
    assert db_data[2]['profile_picture'] == data['avatar']
    assert db_data[2]['full_size_picture'] == data['full_size_image']


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_patch_character_wrong_id(service_client, header_data, character_data, fetch_table_data):
    data = character_data.full_data

    response = await service_client.patch(
        '/api/v1/admin/characters/0',
        headers=header_data.true_header
    )
    assert response.status == 404

    # Check characters in db
    db_data = fetch_table_data('character')
    assert len(db_data) == 3
