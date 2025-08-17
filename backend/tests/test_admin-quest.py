import pytest
from tests.utils.my_helpers import is_uuidv4

from testsuite.databases import pgsql


# Start the tests via `make test-debug` or `make test-release`

@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_get_quests_no_header(service_client, header_data, fetch_table_data):
    response = await service_client.get(
        '/api/v1/admin/quests',
        headers=header_data.no_header
    )
    assert response.status == 401


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_get_quests_wrong_header(service_client, header_data, fetch_table_data):
    response = await service_client.get(
        '/api/v1/admin/quests',
        headers=header_data.wrong_header
    )
    assert response.status == 401


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_get_quest_no_header(service_client, header_data, fetch_table_data):
    response = await service_client.get(
        '/api/v1/admin/quests/1',
        headers=header_data.no_header
    )
    assert response.status == 401


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_get_quest_wrong_header(service_client, header_data, fetch_table_data):
    response = await service_client.get(
        '/api/v1/admin/quests/1',
        headers=header_data.wrong_header
    )
    assert response.status == 401


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_add_quest_no_header(service_client, header_data, fetch_table_data):
    response = await service_client.post(
        '/api/v1/admin/quests',
        headers=header_data.no_header
    )
    assert response.status == 401


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_add_quest_wrong_header(service_client, header_data, fetch_table_data):
    response = await service_client.post(
        '/api/v1/admin/quests',
        headers=header_data.wrong_header
    )
    assert response.status == 401


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_update_quest_no_header(service_client, header_data, fetch_table_data):
    response = await service_client.patch(
        '/api/v1/admin/quests/1',
        headers=header_data.no_header
    )
    assert response.status == 401


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_update_quest_wrong_header(service_client, header_data, fetch_table_data):
    response = await service_client.patch(
        '/api/v1/admin/quests/1',
        headers=header_data.wrong_header
    )
    assert response.status == 401


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_get_quests(service_client, header_data, admin_quest_data, fetch_table_data):
    response = await service_client.get(
        '/api/v1/admin/quests',
        headers=header_data.true_header
    )
    assert response.status == 200

    quests = response.json()

    assert len(quests) == 1

    assert quests[0]['id'] == '1'
    assert quests[0]['user_id'] == '1'
    assert quests[0]['name'] == 'quest 1'
    assert quests[0]['is_available'] is True
    assert quests[0]['public_beautiful_name'] == 'beautiful quest 1'

    # Check quests in db
    db_data = fetch_table_data('quest')
    assert len(db_data) == 1


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_get_quest(service_client, header_data, fetch_table_data):
    response = await service_client.get(
        '/api/v1/admin/quests/1',
        headers=header_data.true_header
    )
    assert response.status == 200

    quest = response.json()

    assert quest['id'] == '1'
    assert quest['user_id'] == '1'
    assert quest['name'] == 'quest 1'
    assert quest['is_available'] is True
    assert quest['public_beautiful_name'] == 'beautiful quest 1'
    assert 'messages' in quest
    assert len(quest['messages']) == 23

    # Check quests in db
    db_data = fetch_table_data('quest')
    assert len(db_data) == 1


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_get_quest_wrong_id(service_client, header_data, fetch_table_data):
    response = await service_client.get(
        '/api/v1/admin/quests/0',
        headers=header_data.true_header
    )
    assert response.status == 404

    # Check quests in db
    db_data = fetch_table_data('quest')
    assert len(db_data) == 1


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_add_quest(service_client, header_data, admin_quest_data, fetch_table_data):
    data = admin_quest_data.full_data
    response = await service_client.post(
        '/api/v1/admin/quests',
        headers=header_data.true_header,
        json=data
    )
    assert response.status == 200

    created_quest = response.json()

    assert created_quest['user_id'] == '1'
    assert created_quest['name'] == data['name']
    assert created_quest['is_available'] == data['is_available']
    assert created_quest['public_beautiful_name'] == data['public_beautiful_name']

    # Check quest added to db
    db_data = fetch_table_data('quest')
    assert len(db_data) == 2
    assert db_data[1]['user_id'] == '1'
    assert db_data[1]['name'] == data['name']
    assert db_data[1]['is_available'] == data['is_available']
    assert db_data[1]['public_beautiful_name'] == data['public_beautiful_name']

    db_data = fetch_table_data('quest_task')
    assert len(db_data) == 26

    data = admin_quest_data.no_data
    response = await service_client.post(
        '/api/v1/admin/quests',
        headers=header_data.true_header,
        json=data
    )
    assert response.status == 400

    # Check quest not added to db
    db_data = fetch_table_data('quest')
    assert len(db_data) == 2
    db_data = fetch_table_data('quest_task')
    assert len(db_data) == 26

    data = admin_quest_data.invalid_attachment_data
    response = await service_client.post(
        '/api/v1/admin/quests',
        headers=header_data.true_header,
        json=data
    )
    assert response.status == 400

    # Check quest not added to db
    db_data = fetch_table_data('quest')
    assert len(db_data) == 2
    db_data = fetch_table_data('quest_task')
    assert len(db_data) == 26

    data = admin_quest_data.invalid_character_data
    response = await service_client.post(
        '/api/v1/admin/quests',
        headers=header_data.true_header,
        json=data
    )
    assert response.status == 400

    # Check quest not added to db
    db_data = fetch_table_data('quest')
    assert len(db_data) == 2
    db_data = fetch_table_data('quest_task')
    assert len(db_data) == 26

    data = admin_quest_data.invalid_message_data
    response = await service_client.post(
        '/api/v1/admin/quests',
        headers=header_data.true_header,
        json=data
    )
    assert response.status == 400

    # Check quest not added to db
    db_data = fetch_table_data('quest')
    assert len(db_data) == 2
    db_data = fetch_table_data('quest_task')
    assert len(db_data) == 26


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_patch_quest(service_client, header_data, admin_quest_data, fetch_table_data):
    data = admin_quest_data.update_data
    response = await service_client.patch(
        '/api/v1/admin/quests/1',
        headers=header_data.true_header,
        json=data
    )

    updated_quest = response.json()

    assert updated_quest['id'] == '1'
    assert updated_quest['user_id'] == '1'
    assert updated_quest['name'] == data['name']
    assert updated_quest['is_available'] == data['is_available']
    assert updated_quest['public_beautiful_name'] == data['name']

    # Check quest updated in db
    db_data = fetch_table_data('quest')
    assert len(db_data) == 1
    assert db_data[0]['id'] == updated_quest['id']
    assert db_data[0]['user_id'] == updated_quest['user_id']
    assert db_data[0]['name'] == updated_quest['name']
    assert db_data[0]['is_available'] == updated_quest['is_available']
    assert db_data[0]['public_beautiful_name'] == updated_quest['public_beautiful_name']

    db_data = fetch_table_data('quest_task')
    assert len(db_data) == 0

    data = admin_quest_data.invalid_update_data
    response = await service_client.patch(
        '/api/v1/admin/quests/1',
        headers=header_data.true_header,
        json=data
    )
    assert response.status == 400

    # Check quests in db
    db_data = fetch_table_data('quest')
    assert len(db_data) == 1


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_patch_quest_wrong_id(service_client, header_data, fetch_table_data):
    response = await service_client.patch(
        '/api/v1/admin/quests/0',
        headers=header_data.true_header
    )
    assert response.status == 404

    # Check quests in db
    db_data = fetch_table_data('quest')
    assert len(db_data) == 1
