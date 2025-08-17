import aiohttp

import pytest

# Start the tests via `make test-debug` or `make test-release`


async def test_basic(service_client):

    response = await service_client.options(
        '/api/v1/admin/login',
    )
    headers = response.headers

    assert response.status == 200
    assert 'Content-Type' in headers
    assert 'Access-Control-Allow-Origin' in headers
    assert 'Access-Control-Allow-Headers' in headers
    assert 'Access-Control-Allow-Credentials' in headers
    assert 'Access-Control-Allow-Methods' in headers

    assert headers['Content-Type'] == 'application/json'
    assert headers['Access-Control-Allow-Origin'] == '*'
    assert headers['Access-Control-Allow-Headers'] == 'Authorization, Content-Type'
    assert headers['Access-Control-Allow-Credentials'] == 'true'
    assert headers['Access-Control-Allow-Methods'] == 'GET, POST, OPTIONS, PUT, PATCH, DELETE'
