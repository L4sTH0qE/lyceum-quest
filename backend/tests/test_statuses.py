import pytest
from tests.utils.my_helpers import is_uuidv4

from testsuite.databases import pgsql


# Start the tests via `make test-debug` or `make test-release`


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_get_statuses(service_client, header_data):
    response = await service_client.get(
        '/api/v1/admin/user-get-statuses',
        headers=header_data.true_header
    )
    assert response.status == 200

    status_list = response.json()

    assert len(status_list) == 3
    assert status_list[0]['id'] == '1'
    assert status_list[0]['title'] == 'waiting'

    assert status_list[1]['id'] == '2'
    assert status_list[1]['title'] == 'enabled'

    assert status_list[2]['id'] == '3'
    assert status_list[2]['title'] == 'disabled'


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_get_statuses_wrong_header(service_client, header_data):
    response = await service_client.get(
        '/api/v1/admin/user-get-statuses',
        headers=header_data.wrong_header
    )
    assert response.status == 401


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_get_statuses_no_header(service_client, header_data):
    response = await service_client.get(
        '/api/v1/admin/user-get-statuses',
        headers=header_data.no_header
    )
    assert response.status == 401
