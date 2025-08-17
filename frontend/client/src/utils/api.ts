// import { AnyMessage } from './interfaces';

const baseUrl = 'https://api.darkony.ru/client/v1';

export const getInitialMessages = (quest_id: string) =>
    fetch(`${baseUrl}/quest/${quest_id}`).then((res) => res.json());

export const getNextMessages = (body: any) =>
    fetch(`${baseUrl}/quest`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify(body),
    }).then((res) => res.json());

export const getCities = () => fetch(`${baseUrl}/cities`).then((res) => res.json());

export const putAnalyticsIsRedirected = () => {
    const sessionId = localStorage.getItem('session_id');
    fetch(`${baseUrl}/analytics/is-redirected`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify({ session_id: sessionId }),
    });
};
