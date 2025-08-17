import pytest
from tests.utils.my_helpers import is_uuidv4

from testsuite.databases import pgsql


# Start the tests via `make test-debug` or `make test-release`


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_get_info(service_client, header_data):
    response = await service_client.get(
        '/api/v1/admin/user-info',
        headers=header_data.true_header
    )
    assert response.status == 200

    user_info = response.json()

    assert 'first_name' in user_info
    assert 'second_name' in user_info
    assert 'role' in user_info
    assert 'status' in user_info
    assert user_info['first_name'] == 'Anton'
    assert user_info['second_name'] == 'Aleksashkin'
    assert user_info['role'] == 'admin'
    assert user_info['status'] == 'enabled'


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_get_info_wrong_header(service_client, header_data):
    response = await service_client.get(
        '/api/v1/admin/user-info',
        headers=header_data.wrong_header
    )
    assert response.status == 401


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_get_info_no_header(service_client, header_data):
    response = await service_client.get(
        '/api/v1/admin/user-info',
        headers=header_data.no_header
    )
    assert response.status == 401
