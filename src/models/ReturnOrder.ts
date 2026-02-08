export enum ReturnStatusId {
    Received = 100,
    Inspected = 200,
    Restocked = 300,
    Damaged = 400,
}

export const ReturnStatusLabel: Record<ReturnStatusId, string> = {
    [ReturnStatusId.Received]: 'Received',
    [ReturnStatusId.Inspected]: 'Inspected',
    [ReturnStatusId.Restocked]: 'Restocked',
    [ReturnStatusId.Damaged]: 'Damaged',
};

export enum ReturnCause {
    WrongItem = 'WRONG_ITEM',
    DamagedInTransit = 'DAMAGED_IN_TRANSIT',
    Defective = 'DEFECTIVE',
    NotAsDescribed = 'NOT_AS_DESCRIBED',
    ChangedMind = 'CHANGED_MIND',
    Other = 'OTHER',
}

export const ReturnCauseLabel: Record<ReturnCause, string> = {
    [ReturnCause.WrongItem]: 'Wrong Item',
    [ReturnCause.DamagedInTransit]: 'Damaged in Transit',
    [ReturnCause.Defective]: 'Defective',
    [ReturnCause.NotAsDescribed]: 'Not as Described',
    [ReturnCause.ChangedMind]: 'Changed Mind',
    [ReturnCause.Other]: 'Other',
};

export interface ReturnOrderLine {
    rowNumber: number;
    articleNumber: string;
    returnedNumberOfItems: number;
    cause: ReturnCause;
    inspectionNote: string;
    disposition: 'pending' | 'restock' | 'damaged';
}

export interface ReturnOrder {
    returnOrderId: number;
    returnOrderNumber: string;
    originalOrderNumber: string;
    goodsOwnerId: number;
    returnStatus: {
        statusId: ReturnStatusId;
        statusText: string;
    };
    returnLines: ReturnOrderLine[];
    returnRemark: string;
    createdDate: string;
    processedDate: string | null;
}