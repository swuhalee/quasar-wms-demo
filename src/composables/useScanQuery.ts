import { useQuery } from '@pinia/colada';
import { scanApi } from 'src/api/scanApi';
import type { RecentScan } from 'src/models/Scan';
import { ref, watch } from 'vue';

/** 최근 스캔 이력: 모든 컴포넌트에서 공유 가능 */
const recentScans = ref<RecentScan[]>([]);

export const SCAN_KEYS = {
    barcode: (barcode: string) => ['scan', barcode] as const,
};

/** 바코드 스캔 결과 조회 */
export function useScanBarcode(getBarcode: () => string) {
    const query = useQuery({
        key: () => [...SCAN_KEYS.barcode(getBarcode())],
        query: () => scanApi.scanBarcode(getBarcode()),
        enabled: () => getBarcode().trim().length > 0,
    });

    watch(
        [query.data, query.error],
        ([newData, newError]) => {
            const code = getBarcode();
            if (!code.trim()) return; // 빈 값일 때는 기록하지 않음

            const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            if (newData) {
                // 성공 시 처리
                const label = newData.type === 'article'
                    ? newData.data.articleName
                    : newData.data.locationName;

                addToHistory({
                    barcode: code,
                    type: newData.type,
                    label,
                    time: now
                });
            } else if (newError) {
                // 실패 시 처리
                addToHistory({
                    barcode: code,
                    type: 'not_found',
                    label: '정보 없음',
                    time: now
                });
            }
        },
        { flush: 'post' } // DOM 업데이트나 상태 변경 후 실행되도록 설정
    );

    function addToHistory(scan: RecentScan) {
        const filtered = recentScans.value.filter(s => s.barcode !== scan.barcode);
        recentScans.value = [scan, ...filtered].slice(0, 10);
    }

    return { ...query, recentScans };
}
