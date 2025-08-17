import aiohttp

import pytest

# Start the tests via `make test-debug` or `make test-release`


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_basic(service_client, header_data, fetch_table_data):
    response = await service_client.delete(
        '/api/v1/admin/login',
        headers=header_data.true_header
    )
    assert response.status == 200

    # Check auth_session deleted from db
    db_data = fetch_table_data('auth_session')
    assert len(db_data) == 0


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_wrong_header(service_client, header_data):
    response = await service_client.delete(
        '/api/v1/admin/login',
        headers=header_data.wrong_header
    )
    assert response.status == 401


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_no_header(service_client, header_data):
    response = await service_client.delete(
        '/api/v1/admin/login',
        headers=header_data.no_header
    )
    assert response.status == 401
