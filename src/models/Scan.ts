import type { Article } from "./Article";
import type { ArticleItemLocation } from "./InventoryLocation";
import type { Location } from "./Warehouse";

export type ScanBarcodeResult =
    | {
        type: 'article';
        data: Article;
        locations: ArticleItemLocation[];
        items?: never;
    }
    | {
        type: 'location';
        data: Location;
        items: ArticleItemLocation[];
        locations?: never;
    };

export interface RecentScan {
    barcode: string;
    type: 'article' | 'location' | 'not_found';
    label: string;
    time: string;
}
