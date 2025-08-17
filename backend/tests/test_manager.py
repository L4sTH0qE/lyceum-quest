import pytest
from tests.utils.my_helpers import is_uuidv4

from testsuite.databases import pgsql


# Start the tests via `make test-debug` or `make test-release`

@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_get_managers_no_header(service_client, header_data, fetch_table_data):
    response = await service_client.get(
        '/api/v1/admin/managers',
        headers=header_data.no_header
    )
    assert response.status == 401


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_get_managers_wrong_header(service_client, header_data, fetch_table_data):
    response = await service_client.get(
        '/api/v1/admin/managers',
        headers=header_data.wrong_header
    )
    assert response.status == 401


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_get_manager_no_header(service_client, header_data, fetch_table_data):
    response = await service_client.get(
        '/api/v1/admin/managers/1',
        headers=header_data.no_header
    )
    assert response.status == 401


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_get_manager_wrong_header(service_client, header_data, fetch_table_data):
    response = await service_client.get(
        '/api/v1/admin/managers/1',
        headers=header_data.wrong_header
    )
    assert response.status == 401


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_add_manager_no_header(service_client, header_data, fetch_table_data):
    response = await service_client.post(
        '/api/v1/admin/managers',
        headers=header_data.no_header
    )
    assert response.status == 401


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_add_manager_wrong_header(service_client, header_data, fetch_table_data):
    response = await service_client.post(
        '/api/v1/admin/managers',
        headers=header_data.wrong_header
    )
    assert response.status == 401


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_update_manager_no_header(service_client, header_data, fetch_table_data):
    response = await service_client.patch(
        '/api/v1/admin/managers/1',
        headers=header_data.no_header
    )
    assert response.status == 401


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_update_manager_wrong_header(service_client, header_data, fetch_table_data):
    response = await service_client.patch(
        '/api/v1/admin/managers/1',
        headers=header_data.wrong_header
    )
    assert response.status == 401


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_get_managers(service_client, header_data, manager_data, fetch_table_data):
    data = manager_data.full_data
    response = await service_client.post(
        '/api/v1/admin/managers',
        headers=header_data.true_header,
        json=data
    )
    created_manager = response.json()

    response = await service_client.get(
        '/api/v1/admin/managers',
        headers=header_data.true_header
    )
    assert response.status == 200

    managers = response.json()

    assert len(managers) == 1

    assert managers[0]['id'] == created_manager['id']
    assert managers[0]['login'] == created_manager['login']
    assert managers[0]['first_name'] == created_manager['first_name']
    assert managers[0]['second_name'] == created_manager['second_name']
    assert managers[0]['role_id'] == created_manager['role_id']
    assert managers[0]['role_title'] == 'manager'
    assert managers[0]['status_id'] == '1'
    assert managers[0]['status_title'] == 'waiting'

    # Check managers in db
    db_data = fetch_table_data('user')
    assert len(db_data) == 2


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_get_manager(service_client, header_data, manager_data, fetch_table_data):
    data = manager_data.full_data
    response = await service_client.post(
        '/api/v1/admin/managers',
        headers=header_data.true_header,
        json=data
    )
    created_manager = response.json()

    response = await service_client.get(
        '/api/v1/admin/managers/' + created_manager['id'],
        headers=header_data.true_header
    )
    assert response.status == 200

    manager = response.json()

    assert manager['id'] == created_manager['id']
    assert manager['login'] == created_manager['login']
    assert manager['first_name'] == created_manager['first_name']
    assert manager['second_name'] == created_manager['second_name']
    assert manager['role_id'] == created_manager['role_id']
    assert manager['role_title'] == 'manager'
    assert manager['status_id'] == '1'
    assert manager['status_title'] == 'waiting'

    # Check managers in db
    db_data = fetch_table_data('user')
    assert len(db_data) == 2


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_get_manager_wrong_id(service_client, header_data, fetch_table_data):
    response = await service_client.get(
        '/api/v1/admin/managers/0',
        headers=header_data.true_header
    )
    assert response.status == 404

    # Check managers in db
    db_data = fetch_table_data('user')
    assert len(db_data) == 1


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_add_manager(service_client, header_data, manager_data, fetch_table_data):
    data = manager_data.full_data
    response = await service_client.post(
        '/api/v1/admin/managers',
        headers=header_data.true_header,
        json=data
    )
    assert response.status == 200

    created_manager = response.json()

    assert is_uuidv4(created_manager['id'])
    assert created_manager['login'] == data['login']
    assert created_manager['first_name'] == data['first_name']
    assert created_manager['second_name'] == data['second_name']
    assert created_manager['role_id'] == data['role_id']
    assert created_manager['status_id'] == '1'

    # Check manager added to db
    db_data = fetch_table_data('user')
    assert len(db_data) == 2
    assert is_uuidv4(db_data[1]['id'])
    assert db_data[1]['login'] == data['login']
    assert db_data[1]['first_name'] == data['first_name']
    assert db_data[1]['second_name'] == data['second_name']
    assert db_data[1]['password'] == 'd8e02dc389f474320bf6ca93f9ae00fce62e319a52b29e7de04cb0658dda168d'
    assert db_data[1]['role_id'] == data['role_id']
    assert db_data[1]['status_id'] == '1'

    data = manager_data.no_data
    response = await service_client.post(
        '/api/v1/admin/managers',
        headers=header_data.true_header,
        json=data
    )
    assert response.status == 400

    # Check manager not added to db
    db_data = fetch_table_data('user')
    assert len(db_data) == 2

    data = manager_data.invalid_login_data
    response = await service_client.post(
        '/api/v1/admin/managers',
        headers=header_data.true_header,
        json=data
    )
    assert response.status == 400

    # Check manager not added to db
    db_data = fetch_table_data('user')
    assert len(db_data) == 2

    data = manager_data.existing_login_data
    response = await service_client.post(
        '/api/v1/admin/managers',
        headers=header_data.true_header,
        json=data
    )
    assert response.status == 400

    # Check manager not added to db
    db_data = fetch_table_data('user')
    assert len(db_data) == 2

    data = manager_data.invalid_password_data
    response = await service_client.post(
        '/api/v1/admin/managers',
        headers=header_data.true_header,
        json=data
    )
    assert response.status == 400

    # Check manager not added to db
    db_data = fetch_table_data('user')
    assert len(db_data) == 2

    data = manager_data.invalid_role_data
    response = await service_client.post(
        '/api/v1/admin/managers',
        headers=header_data.true_header,
        json=data
    )
    assert response.status == 400

    # Check manager not added to db
    db_data = fetch_table_data('user')
    assert len(db_data) == 2

    data = manager_data.invalid_name_data
    response = await service_client.post(
        '/api/v1/admin/managers',
        headers=header_data.true_header,
        json=data
    )
    assert response.status == 400

    # Check manager not added to db
    db_data = fetch_table_data('user')
    assert len(db_data) == 2


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_patch_manager(service_client, header_data, manager_data, fetch_table_data):
    data = manager_data.full_data
    response = await service_client.post(
        '/api/v1/admin/managers',
        headers=header_data.true_header,
        json=data
    )
    created_manager = response.json()

    data = manager_data.update_data
    response = await service_client.patch(
        '/api/v1/admin/managers/' + created_manager['id'],
        headers=header_data.true_header,
        json=data
    )

    # Check manager updated in db
    db_data = fetch_table_data('user')
    assert len(db_data) == 2
    assert db_data[1]['role_id'] == data['role_id']
    assert db_data[1]['status_id'] == data['status_id']

    data = manager_data.invalid_update_data
    response = await service_client.patch(
        '/api/v1/admin/managers/' + created_manager['id'],
        headers=header_data.true_header,
        json=data
    )
    assert response.status == 400

    data = manager_data.full_data
    response = await service_client.patch(
        '/api/v1/admin/managers/1',
        headers=header_data.true_header,
        json=data
    )
    assert response.status == 404


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_patch_manager_wrong_id(service_client, header_data, fetch_table_data):
    response = await service_client.patch(
        '/api/v1/admin/managers/0',
        headers=header_data.true_header
    )
    assert response.status == 404

    # Check managers in db
    db_data = fetch_table_data('user')
    assert len(db_data) == 1
