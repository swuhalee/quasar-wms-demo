import { http, HttpResponse } from 'msw';
import { BASE } from '../helper';
import { db } from '../data/db';

const scanBarcode = http.get(`${BASE}/scan/:barcode`, ({ params }) => {
    const barcode = params['barcode'] as string;

    // Try matching article barcode
    const articleByBarcode = db.articles.find((a) =>
        a.barCodes.some((bc) => bc.barCode === barcode),
    );
    if (articleByBarcode) {
        return HttpResponse.json({
            type: 'article',
            data: articleByBarcode,
            locations: db.articleItemLocations.filter(
                (ail) => ail.articleNumber === articleByBarcode.articleNumber,
            ),
        });
    }

    // Try matching article number (SKU)
    const articleBySku = db.articles.find((a) => a.articleNumber === barcode);
    if (articleBySku) {
        return HttpResponse.json({
            type: 'article',
            data: articleBySku,
            locations: db.articleItemLocations.filter(
                (ail) => ail.articleNumber === articleBySku.articleNumber,
            ),
        });
    }

    // Try matching location name
    const location = db.locations.find(
        (l) => l.locationName.toUpperCase() === barcode.toUpperCase(),
    );
    if (location) {
        const items = db.articleItemLocations.filter((ail) => ail.locationId === location.locationId);
        return HttpResponse.json({ type: 'location', data: location, items });
    }

    return HttpResponse.json({ message: 'No match found' }, { status: 404 });
});

export const scanHandlers = [
    scanBarcode
];
