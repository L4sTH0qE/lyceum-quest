import pytest

from testsuite.databases import pgsql
from tests.utils.my_helpers import is_uuidv4


# Start the tests via `make test-debug` or `make test-release`


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_cities(service_client):
    response = await service_client.get(
        '/client/v1/cities'
    )

    assert response.status == 200

    city_list = response.json()

    for city in city_list:
        assert 'city_id' in city
        assert isinstance(city['city_id'], str)
        assert is_uuidv4(city['city_id'])
        assert 'name' in city
        assert isinstance(city['name'], str)
        assert 'has_lyceum' in city
        assert isinstance(city['has_lyceum'], bool)
