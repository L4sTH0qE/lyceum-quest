import pytest
from tests.utils.my_helpers import is_uuidv4

from testsuite.databases import pgsql


# Start the tests via `make test-debug` or `make test-release`


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_get_roles(service_client, header_data):
    response = await service_client.get(
        '/api/v1/admin/user-get-roles',
        headers=header_data.true_header
    )
    assert response.status == 200

    role_list = response.json()

    assert len(role_list) == 2
    assert role_list[0]['id'] == '1'
    assert role_list[0]['title'] == 'admin'

    assert role_list[1]['id'] == '2'
    assert role_list[1]['title'] == 'manager'


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_get_roles_wrong_header(service_client, header_data):
    response = await service_client.get(
        '/api/v1/admin/user-get-roles',
        headers=header_data.wrong_header
    )
    assert response.status == 401


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_get_roles_no_header(service_client, header_data):
    response = await service_client.get(
        '/api/v1/admin/user-get-statuses',
        headers=header_data.no_header
    )
    assert response.status == 401
