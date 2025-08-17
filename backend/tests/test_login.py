import aiohttp

import pytest

# Start the tests via `make test-debug` or `make test-release`


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_basic(service_client, user_data, fetch_table_data):
    data = user_data.get_multipart_form_data(user_data.full_data)

    response = await service_client.post(
        '/api/v1/admin/login',
        data=data,
        headers={
            'Content-Type': 'multipart/form-data; boundary=' + data.boundary,
        }
    )
    result = response.json()

    assert response.status == 200
    assert 'token' in result
    assert 'user_id' in result
    assert 'status_id' in result
    assert 'status_title' in result

    assert result['token'] == '1'
    assert result['user_id'] == '1'
    assert result['status_id'] == '2'
    assert result['status_title'] == 'enabled'

    # Check auth_session added to db
    db_data = fetch_table_data('auth_session')
    assert len(db_data) == 1
    assert db_data[0]['id'] == '1'
    assert db_data[0]['user_id'] == '1'


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_wrong_login(service_client, user_data):
    data = user_data.get_multipart_form_data(user_data.wrong_login_data)

    response = await service_client.post(
        '/api/v1/admin/login',
        data=data,
        headers={
            'Content-Type': 'multipart/form-data; boundary=' + data.boundary,
        }
    )
    assert response.status == 404


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_wrong_password(service_client, user_data):
    data = user_data.get_multipart_form_data(user_data.wrong_password_data)

    response = await service_client.post(
        '/api/v1/admin/login',
        data=data,
        headers={
            'Content-Type': 'multipart/form-data; boundary=' + data.boundary,
        }
    )
    assert response.status == 404


async def test_no_data(service_client, user_data):
    data = user_data.get_multipart_form_data(user_data.no_data)

    response = await service_client.post(
        '/api/v1/admin/login',
        data=data,
        headers={
            'Content-Type': 'multipart/form-data; boundary=' + data.boundary,
        }
    )
    assert response.status == 401


async def test_no_email(service_client, user_data):
    data = user_data.get_multipart_form_data(user_data.password_only_data)

    response = await service_client.post(
        '/api/v1/admin/login',
        data=data,
        headers={
            'Content-Type': 'multipart/form-data; boundary=' + data.boundary,
        }
    )
    assert response.status == 401


async def test_no_password(service_client, user_data):
    data = user_data.get_multipart_form_data(user_data.login_only_data)

    response = await service_client.post(
        '/api/v1/admin/login',
        data=data,
        headers={
            'Content-Type': 'multipart/form-data; boundary=' + data.boundary,
        }
    )
    assert response.status == 401


async def test_login_empty(service_client, user_data):
    data = user_data.get_multipart_form_data(user_data.login_empty_data)

    response = await service_client.post(
        '/api/v1/admin/login',
        data=data,
        headers={
            'Content-Type': 'multipart/form-data; boundary=' + data.boundary,
        }
    )
    assert response.status == 401


async def test_password_empty(service_client, user_data):
    data = user_data.get_multipart_form_data(user_data.password_empty_data)

    response = await service_client.post(
        '/api/v1/admin/login',
        data=data,
        headers={
            'Content-Type': 'multipart/form-data; boundary=' + data.boundary,
        }
    )
    assert response.status == 401
