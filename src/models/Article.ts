export interface InventoryInfo {
    numberOfItems: number;
    sellableNumberOfItems: number;
}

export interface BarCode {
    barCode: string;
}

export interface Article {
    articleSystemId: number;
    articleNumber: string;
    articleName: string;
    productCode: string;
    barCodes: BarCode[];
    inventoryInfo: InventoryInfo;
    reorderPoint: number;
}