import aiohttp

import pytest

# Start the tests via `make test-debug` or `make test-release`


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_get_reset_password(service_client, password_data):
    response = await service_client.get(
        '/api/v1/admin/reset-password/' + password_data.login,
    )
    result = response.json()

    assert response.status == 200

    assert 'id' in result

    assert result['id'] == '1'


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_get_reset_password_wrong_login(service_client, password_data):
    response = await service_client.get(
        '/api/v1/admin/reset-password/' + password_data.invalid_login,
    )
    assert response.status == 404


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_patch_reset_password(service_client, password_data, fetch_table_data):
    data = password_data.no_data
    response = await service_client.patch(
        '/api/v1/admin/reset-password',
        json=data
    )

    assert response.status == 400

    db_data = fetch_table_data('user')
    assert len(db_data) == 1
    assert db_data[0]['password'] == '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4'

    data = password_data.different_passwords
    response = await service_client.patch(
        '/api/v1/admin/reset-password',
        json=data
    )

    assert response.status == 400

    db_data = fetch_table_data('user')
    assert len(db_data) == 1
    assert db_data[0]['password'] == '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4'

    data = password_data.invalid_password_format
    response = await service_client.patch(
        '/api/v1/admin/reset-password',
        json=data
    )

    assert response.status == 400

    db_data = fetch_table_data('user')
    assert len(db_data) == 1
    assert db_data[0]['password'] == '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4'

    data = password_data.invalid_id
    response = await service_client.patch(
        '/api/v1/admin/reset-password',
        json=data
    )

    assert response.status == 404

    db_data = fetch_table_data('user')
    assert len(db_data) == 1
    assert db_data[0]['password'] == '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4'

    data = password_data.full_data
    response = await service_client.patch(
        '/api/v1/admin/reset-password',
        json=data
    )

    assert response.status == 200

    db_data = fetch_table_data('user')
    assert len(db_data) == 1
    assert db_data[0]['password'] == 'd8e02dc389f474320bf6ca93f9ae00fce62e319a52b29e7de04cb0658dda168d'
