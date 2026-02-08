import { http, HttpResponse } from 'msw';
import { BASE } from '../helper';
import { resetDb } from '../data/db';

const postReset = http.post(`${BASE}/reset`, () => {
    resetDb();
    return HttpResponse.json({ message: 'Database reset to seed state' });
});

export const resetHandlers = [
    postReset
];