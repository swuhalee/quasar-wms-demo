export interface Warehouse {
    warehouseId: number;
    warehouseCode: string;
    warehouseName: string;
}

export interface Zone {
    zoneId: number;
    zoneName: string;
    zoneCode: string;
    warehouseId: number;
}

export interface Location {
    locationId: number;
    locationName: string;
    zoneId: number;
    warehouseId: number;
}