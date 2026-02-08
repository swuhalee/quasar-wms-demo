import { Article } from "src/models/Article";
import { AuditAction, AuditLogEntry } from "src/models/AuditLog";
import { ArticleItemLocation } from "src/models/InventoryLocation";
import { Order, OrderStatusId } from "src/models/Order";
import { ReturnCause, ReturnOrder, ReturnStatusId } from "src/models/ReturnOrder";
import { Location, Warehouse, Zone } from "src/models/Warehouse";
import { CustomWorkflow } from "src/models/Workflow";

// Warehouses: 창고
export function seedWarehouses(): Warehouse[] {
    return [{ warehouseId: 1, warehouseCode: 'WH-MAIN', warehouseName: 'Main Warehouse' }];
}

// Zones: 창고 안 구역
// receiving(입고), bulk(대량 보관), pick face(출고용 소량 보관), shipping(출고대기)
export function seedZones(): Zone[] {
    return [
        { zoneId: 1, zoneName: 'Receiving', zoneCode: 'RCV', warehouseId: 1 },
        { zoneId: 2, zoneName: 'Bulk Storage', zoneCode: 'BULK', warehouseId: 1 },
        { zoneId: 3, zoneName: 'Pick Face', zoneCode: 'PICK', warehouseId: 1 },
        { zoneId: 4, zoneName: 'Shipping', zoneCode: 'SHIP', warehouseId: 1 },
    ];
}

// Location: 구역(zone) 내의 실제 rack(파레트 통째로 올리는 큰 선반)이나 
// bin(rack 안에 들어가거나, 선반 위 작은 박스로 나뉜 칸)의 구체적인 위치
//
// rack는 아파트 층, rack은 호수로 봐도 무방함
export function seedLocations(): Location[] {
    return [
        // Receiving zone – 2 bins
        { locationId: 1, locationName: 'RCV-01', zoneId: 1, warehouseId: 1 },
        { locationId: 2, locationName: 'RCV-02', zoneId: 1, warehouseId: 1 },
        // Bulk Storage – 4 bins (2 rows x 2 levels)
        { locationId: 3, locationName: 'BULK-A1', zoneId: 2, warehouseId: 1 },
        { locationId: 4, locationName: 'BULK-A2', zoneId: 2, warehouseId: 1 },
        { locationId: 5, locationName: 'BULK-B1', zoneId: 2, warehouseId: 1 },
        { locationId: 6, locationName: 'BULK-B2', zoneId: 2, warehouseId: 1 },
        // Pick Face – 6 bins (one per SKU)
        { locationId: 7, locationName: 'PICK-01', zoneId: 3, warehouseId: 1 },
        { locationId: 8, locationName: 'PICK-02', zoneId: 3, warehouseId: 1 },
        { locationId: 9, locationName: 'PICK-03', zoneId: 3, warehouseId: 1 },
        { locationId: 10, locationName: 'PICK-04', zoneId: 3, warehouseId: 1 },
        { locationId: 11, locationName: 'PICK-05', zoneId: 3, warehouseId: 1 },
        { locationId: 12, locationName: 'PICK-06', zoneId: 3, warehouseId: 1 },
        // Shipping zone – 2 bins
        { locationId: 13, locationName: 'SHIP-01', zoneId: 4, warehouseId: 1 },
        { locationId: 14, locationName: 'SHIP-02', zoneId: 4, warehouseId: 1 },
    ];
}

// Article: 판매되는 상품(SKU)의 마스터 정보(이름, 바코드, 재주문 시점 등)
export function seedArticles(): Article[] {
    return [
        {
            articleSystemId: 1,
            articleNumber: 'SKU-1001',
            articleName: 'Wireless Bluetooth Headphones',
            productCode: 'WBH-200',
            barCodes: [{ barCode: '7350001010015' }],
            inventoryInfo: { numberOfItems: 120, sellableNumberOfItems: 105 },
            reorderPoint: 20,
        },
        {
            articleSystemId: 2,
            articleNumber: 'SKU-1002',
            articleName: 'USB-C Charging Cable 2m',
            productCode: 'UCC-2M',
            barCodes: [{ barCode: '7350001010022' }],
            inventoryInfo: { numberOfItems: 500, sellableNumberOfItems: 480 },
            reorderPoint: 50,
        },
        {
            articleSystemId: 3,
            articleNumber: 'SKU-1003',
            articleName: 'Ergonomic Mouse Pad',
            productCode: 'EMP-BLK',
            barCodes: [{ barCode: '7350001010039' }],
            inventoryInfo: { numberOfItems: 30, sellableNumberOfItems: 8 },
            reorderPoint: 15,
        },
        {
            articleSystemId: 4,
            articleNumber: 'SKU-1004',
            articleName: 'Mechanical Keyboard (Cherry MX)',
            productCode: 'MKB-CMX',
            barCodes: [{ barCode: '7350001010046' }],
            inventoryInfo: { numberOfItems: 75, sellableNumberOfItems: 60 },
            reorderPoint: 10,
        },
        {
            articleSystemId: 5,
            articleNumber: 'SKU-1005',
            articleName: '27" 4K Monitor',
            productCode: 'MON-27-4K',
            barCodes: [{ barCode: '7350001010053' }],
            inventoryInfo: { numberOfItems: 15, sellableNumberOfItems: 5 },
            reorderPoint: 8,
        },
        {
            articleSystemId: 6,
            articleNumber: 'SKU-1006',
            articleName: 'Laptop Stand Aluminum',
            productCode: 'LSA-SLV',
            barCodes: [{ barCode: '7350001010060' }],
            inventoryInfo: { numberOfItems: 200, sellableNumberOfItems: 195 },
            reorderPoint: 25,
        },
    ];
}

// ArticleItemLocation: 특정 위치(Location)에 어떤 상품이 몇 개 있는지 매핑한 데이터
export function seedArticleItemLocations(): ArticleItemLocation[] {
    // Distribute stock across Bulk Storage and Pick Face
    return [
        // SKU-1001: 120 total → 80 bulk, 40 pick
        { articleNumber: 'SKU-1001', locationId: 3, quantity: 80, allocatedQuantity: 0 },
        { articleNumber: 'SKU-1001', locationId: 7, quantity: 40, allocatedQuantity: 15 },
        // SKU-1002: 500 total → 350 bulk, 150 pick
        { articleNumber: 'SKU-1002', locationId: 4, quantity: 350, allocatedQuantity: 0 },
        { articleNumber: 'SKU-1002', locationId: 8, quantity: 150, allocatedQuantity: 20 },
        // SKU-1003: 30 total → 22 bulk, 8 pick
        { articleNumber: 'SKU-1003', locationId: 5, quantity: 22, allocatedQuantity: 0 },
        { articleNumber: 'SKU-1003', locationId: 9, quantity: 8, allocatedQuantity: 0 },
        // SKU-1004: 75 total → 50 bulk, 25 pick
        { articleNumber: 'SKU-1004', locationId: 5, quantity: 50, allocatedQuantity: 0 },
        { articleNumber: 'SKU-1004', locationId: 10, quantity: 25, allocatedQuantity: 15 },
        // SKU-1005: 15 total → 10 bulk, 5 pick
        { articleNumber: 'SKU-1005', locationId: 6, quantity: 10, allocatedQuantity: 0 },
        { articleNumber: 'SKU-1005', locationId: 11, quantity: 5, allocatedQuantity: 0 },
        // SKU-1006: 200 total → 120 bulk, 80 pick
        { articleNumber: 'SKU-1006', locationId: 6, quantity: 120, allocatedQuantity: 0 },
        { articleNumber: 'SKU-1006', locationId: 12, quantity: 80, allocatedQuantity: 5 },
    ];
}

// Order: 고객의 출고 요청(주문)
// 어떤 상품을 몇 개 가져갈지 기록
export function seedOrders(): Order[] {
    const today = new Date().toISOString();
    return [
        {
            orderId: 1,
            orderNumber: 'ORD-20240101',
            goodsOwnerId: 1,
            orderStatus: { statusId: OrderStatusId.Shipped, statusText: 'Shipped' },
            orderLines: [
                {
                    rowNumber: 1,
                    articleNumber: 'SKU-1001',
                    orderedNumberOfItems: 2,
                    pickedNumberOfItems: 2,
                },
            ],
            orderRemark: 'Express delivery',
            createdDate: today,
        },
        {
            orderId: 2,
            orderNumber: 'ORD-20240102',
            goodsOwnerId: 1,
            orderStatus: { statusId: OrderStatusId.Picked, statusText: 'Picked' },
            orderLines: [
                {
                    rowNumber: 1,
                    articleNumber: 'SKU-1002',
                    orderedNumberOfItems: 5,
                    pickedNumberOfItems: 5,
                },
                {
                    rowNumber: 2,
                    articleNumber: 'SKU-1004',
                    orderedNumberOfItems: 1,
                    pickedNumberOfItems: 1,
                },
            ],
            orderRemark: 'Bulk order',
            createdDate: today,
        },
    ];
}

// ReturnOrder: 고객이 보낸 반품 요청
// 반품 사유와 검수 후 처리 결과(재입고 등) 기록
export function seedReturnOrders(): ReturnOrder[] {
    return [
        {
            returnOrderId: 1,
            returnOrderNumber: 'RET-20240101',
            originalOrderNumber: 'ORD-20240101',
            goodsOwnerId: 1,
            returnStatus: { statusId: ReturnStatusId.Restocked, statusText: 'Restocked' },
            returnLines: [
                {
                    rowNumber: 1,
                    articleNumber: 'SKU-1001',
                    returnedNumberOfItems: 1,
                    cause: ReturnCause.DamagedInTransit,
                    inspectionNote: 'Minor box dent, product OK',
                    disposition: 'restock',
                },
            ],
            returnRemark: 'Customer reported damaged packaging',
            createdDate: new Date().toISOString(),
            processedDate: new Date().toISOString(),
        },
    ];
}

// AuditLog: 창고 내에서 일어난 모든 활동의 history(log)
// 누가, 언제, 무엇을 했는지 기록
export function seedAuditLog(): AuditLogEntry[] {
    const now = new Date().toISOString();
    return [
        {
            auditId: 1,
            timestamp: now,
            action: AuditAction.OrderCreated,
            articleNumber: 'SKU-1001',
            referenceType: 'order',
            referenceId: 1,
            description: 'Order ORD-20240101 created with 1 line',
            details: { orderNumber: 'ORD-20240101' },
        },
        {
            auditId: 2,
            timestamp: now,
            action: AuditAction.OrderShipped,
            articleNumber: 'SKU-1001',
            referenceType: 'order',
            referenceId: 1,
            description: 'Order ORD-20240101 shipped',
            details: { orderNumber: 'ORD-20240101' },
        },
        {
            auditId: 3,
            timestamp: now,
            action: AuditAction.ReturnReceived,
            articleNumber: 'SKU-1001',
            referenceType: 'returnOrder',
            referenceId: 1,
            description: 'Return RET-20240101 received for SKU-1001',
            details: { returnOrderNumber: 'RET-20240101', cause: 'DAMAGED_IN_TRANSIT' },
        },
    ];
}

// CustomWorkflow: 주문 상태가 어떻게 변해야 하는지 정의하는 업무 흐름도
// 예시: 생성(Created) -> 피킹(Picked) -> 배송(Shipped)
export function seedCustomWorkflows(): CustomWorkflow[] {
    return [
        {
            workflowId: 1,
            workflowName: 'Default Order Workflow',
            statuses: [
                { statusId: 100, statusLabel: 'Created', color: 'blue', isFinal: false },
                { statusId: 400, statusLabel: 'Picked', color: 'orange', isFinal: false },
                { statusId: 500, statusLabel: 'Shipped', color: 'positive', isFinal: true },
            ],
            transitions: [
                { fromStatusId: 100, toStatusId: 400, actionLabel: 'Pick', icon: 'inventory' },
                { fromStatusId: 400, toStatusId: 500, actionLabel: 'Ship', icon: 'local_shipping' },
            ],
            createdDate: new Date().toISOString(),
        },
    ];
}
