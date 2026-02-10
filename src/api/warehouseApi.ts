import { api } from 'src/boot/axios';
import type { Warehouse, Location } from 'src/models/Warehouse';
import type { ArticleItemLocation } from 'src/models/InventoryLocation';

export interface ZoneWithLocations {
    zoneId: number;
    zoneName: string;
    zoneCode: string;
    warehouseId: number;
    locations: Location[];
}

export const warehouseApi = {
    fetchWarehouses: () =>
        api.get<Warehouse[]>('/api/v1/warehouses').then((r) => r.data),

    fetchZones: () =>
        api.get<ZoneWithLocations[]>('/api/v1/warehouses/zones').then((r) => r.data),

    fetchLocations: () =>
        api.get<Location[]>('/api/v1/warehouses/locations').then((r) => r.data),

    fetchArticleItemLocations: () =>
        api.get<ArticleItemLocation[]>('/api/v1/articleItemLocations').then((r) => r.data),
};
