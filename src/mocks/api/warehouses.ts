import { http, HttpResponse } from 'msw';
import { BASE } from '../helper';
import { db } from '../data/db';

const getWarehouses = http.get(`${BASE}/warehouses`, () => {
    return HttpResponse.json(db.warehouses);
});

const getZones = http.get(`${BASE}/warehouses/zones`, () => {
    const enriched = db.zones.map((z) => ({
        ...z,
        locations: db.locations.filter((l) => l.zoneId === z.zoneId),
    }));
    return HttpResponse.json(enriched);
});

const getLocations = http.get(`${BASE}/warehouses/locations`, () => {
    return HttpResponse.json(db.locations);
});

export const warehousesHandlers = [
    getWarehouses,
    getZones,
    getLocations
];
