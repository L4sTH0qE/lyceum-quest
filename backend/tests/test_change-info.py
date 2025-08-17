import pytest
from tests.utils.my_helpers import is_uuidv4

from testsuite.databases import pgsql


# Start the tests via `make test-debug` or `make test-release`


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_change_info(service_client, info_data, header_data, fetch_table_data):
    data = info_data.full_data

    response = await service_client.patch(
        '/api/v1/admin/user-info',
        json=data,
        headers=header_data.true_header
    )
    assert response.status == 200

    # Check auth_session added to db
    db_data = fetch_table_data('user')
    assert len(db_data) == 1
    assert db_data[0]['first_name'] == 'Alex'
    assert db_data[0]['second_name'] == 'Meycer'


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_change_info_no_data(service_client, info_data, header_data, fetch_table_data):
    data = info_data.no_data

    response = await service_client.patch(
        '/api/v1/admin/user-info',
        json=data,
        headers=header_data.true_header
    )
    assert response.status == 400

    # Check auth_session added to db
    db_data = fetch_table_data('user')
    assert len(db_data) == 1
    assert db_data[0]['first_name'] == 'Anton'
    assert db_data[0]['second_name'] == 'Aleksashkin'


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_change_info_only_first_name(service_client, info_data, header_data, fetch_table_data):
    data = info_data.first_name_only_data

    response = await service_client.patch(
        '/api/v1/admin/user-info',
        json=data,
        headers=header_data.true_header
    )
    assert response.status == 200

    # Check auth_session added to db
    db_data = fetch_table_data('user')
    assert len(db_data) == 1
    assert db_data[0]['first_name'] == 'Alex'
    assert db_data[0]['second_name'] == 'Aleksashkin'


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_change_info_only_second_name(service_client, info_data, header_data, fetch_table_data):
    data = info_data.second_name_only_data

    response = await service_client.patch(
        '/api/v1/admin/user-info',
        json=data,
        headers=header_data.true_header
    )
    assert response.status == 200

    # Check auth_session added to db
    db_data = fetch_table_data('user')
    assert len(db_data) == 1
    assert db_data[0]['first_name'] == 'Anton'
    assert db_data[0]['second_name'] == 'Meycer'


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_change_info_empty_first_name(service_client, info_data, header_data, fetch_table_data):
    data = info_data.first_name_empty_data

    response = await service_client.patch(
        '/api/v1/admin/user-info',
        json=data,
        headers=header_data.true_header
    )
    assert response.status == 400

    # Check auth_session added to db
    db_data = fetch_table_data('user')
    assert len(db_data) == 1
    assert db_data[0]['first_name'] == 'Anton'
    assert db_data[0]['second_name'] == 'Aleksashkin'


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_change_info_empty_second_name(service_client, info_data, header_data, fetch_table_data):
    data = info_data.second_name_empty_data

    response = await service_client.patch(
        '/api/v1/admin/user-info',
        json=data,
        headers=header_data.true_header
    )
    assert response.status == 400

    # Check auth_session added to db
    db_data = fetch_table_data('user')
    assert len(db_data) == 1
    assert db_data[0]['first_name'] == 'Anton'
    assert db_data[0]['second_name'] == 'Aleksashkin'


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_change_info_wrong_header(service_client, info_data, header_data):
    response = await service_client.patch(
        '/api/v1/admin/user-info',
        headers=header_data.wrong_header
    )
    assert response.status == 401


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_change_info_no_header(service_client, info_data, header_data):
    response = await service_client.patch(
        '/api/v1/admin/user-info',
        headers=header_data.no_header
    )
    assert response.status == 401
