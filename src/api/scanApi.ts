import { api } from 'src/boot/axios';
import type { ScanBarcodeResult } from 'src/models/Scan';

export const scanApi = {
    scanBarcode: (barcode: string) =>
        api.get<ScanBarcodeResult>(`/api/v1/scan/${barcode}`).then((r) => r.data),
};
