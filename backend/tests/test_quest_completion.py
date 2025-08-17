import aiohttp

import pytest

# Start the tests via `make test-debug` or `make test-release`


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_basic_get(service_client, fetch_table_data):
    quest_id = 1

    session_count_before = len(fetch_table_data('session'))

    response = await service_client.get(
        f'/client/v1/quest/{quest_id}'
    )

    result = response.json()

    assert response.status == 200
    assert 'quest_id' in result
    assert 'session_id' in result
    # assert 'is_last' in result
    assert 'messages' in result

    assert result['quest_id'] == '1'
    # assert result['is_last'] == False
    assert len(result['messages']) == 5

    session_count_after = len(fetch_table_data('session'))
    assert session_count_after == session_count_before + 1

    for message in result['messages']:
        assert 'message_id' in message
        assert 'type' in message
        assert 'author' in message


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_basic_post(service_client):
    quest_id = 1

    response_get = await service_client.get(
        f'/client/v1/quest/{quest_id}'
    )

    result_get = response_get.json()

    response_post = await service_client.post(
        f'/client/v1/quest',
        json={
            'quest_id': str(quest_id),
            'session_id': result_get['session_id'],
            'message_id': '1_5',
            'button_id': '1'
        }
    )

    result_post = response_post.json()

    assert response_post.status == 200
    assert 'quest_id' in result_post
    assert 'is_last' in result_post
    assert 'messages' in result_post

    assert result_post['quest_id'] == '1'
    assert result_post['is_last'] is False
    assert len(result_post['messages']) == 3

    for message in result_post['messages']:
        assert 'message_id' in message
        assert 'type' in message
        assert 'author' in message


@pytest.mark.pgsql('db_1', files=['initial_test_data.sql'])
async def test_full_completion(service_client, fetch_table_data):
    quest_id = 1

    response_get = await service_client.get(
        f'/client/v1/quest/{quest_id}'
    )
    result_get = response_get.json()

    async def complete_quest(response):
        assert response.status == 200

        result = response.json()
        assert 'quest_id' in result
        # assert 'is_last' in result
        assert 'messages' in result

        if 'is_last' not in result:
            return

        if (result['is_last'] is True):
            return

        for message in result['messages'][:-1]:
            assert 'message_id' in message
            assert 'type' in message
            assert 'author' in message

        last_message = result['messages'][-1]

        assert last_message['type'] == 'keyboard' or last_message['type'] == 'action_card' or last_message['type'] == 'city_input'

        if (last_message['type'] == 'action_card'):
            assert 'action_button' in last_message
            assert 'next_task_button' in last_message
            assert 'image_url' in last_message
            assert 'title' in last_message
            assert 'text' in last_message

            new_response = await service_client.post(
                f'/client/v1/quest',
                json={
                    'quest_id': result['quest_id'],
                    'message_id': last_message['message_id'],
                    'session_id': result_get['session_id']
                }
            )
            await complete_quest(new_response)
        elif (last_message['type'] == 'keyboard'):
            for button_row in last_message['keyboard']:
                for button in button_row:
                    assert 'button_id' in button
                    assert 'text' in button
                    assert 'placeholder' in button

                    new_response = await service_client.post(
                        f'/client/v1/quest',
                        json={
                            'quest_id': result['quest_id'],
                            'message_id': last_message['message_id'],
                            'session_id': result_get['session_id'],
                            'button_id': button['button_id']
                        }
                    )
                    await complete_quest(new_response)
        else:
            city_id_with_lyceum = 0
            city_id_without_lyceum = 1
            cities = fetch_table_data('city')

            for city in cities:
                if city['has_lyceum']:
                    city_id_with_lyceum = city['id']
                else:
                    city_id_without_lyceum = city['id']

            new_response_1 = await service_client.post(
                f'/client/v1/quest',
                json={
                    'quest_id': result['quest_id'],
                    'message_id': last_message['message_id'],
                    'session_id': result_get['session_id'],
                    'city_id': city_id_with_lyceum
                }
            )
            await complete_quest(new_response_1)

            new_response_2 = await service_client.post(
                f'/client/v1/quest',
                json={
                    'quest_id': result['quest_id'],
                    'message_id': last_message['message_id'],
                    'session_id': result_get['session_id'],
                    'city_id': city_id_without_lyceum
                }
            )
            await complete_quest(new_response_2)

    await complete_quest(response_get)
