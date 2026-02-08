import { acceptHMRUpdate, defineStore } from "pinia";
import { useQuery } from "@pinia/colada";
import { computed } from "vue";
import { api } from "src/boot/axios";
import type { ArticleItemLocation } from "src/models/InventoryLocation";
import type { Warehouse, Location } from "src/models/Warehouse";

export interface ZoneWithLocations {
    zoneId: number;
    zoneName: string;
    zoneCode: string;
    warehouseId: number;
    locations: Location[];
}

export const useWarehouseStore = defineStore('warehouse', () => {
    const { state: whState, refresh: refreshWarehouses, isLoading: loadingWarehouses } = useQuery({
        key: ['warehouse', 'warehouses'],
        query: () => api.get<Warehouse[]>('/api/v1/warehouses').then(r => r.data),
    });

    const { state: zoneState, refresh: refreshZones, isLoading: loadingZones } = useQuery({
        key: ['warehouse', 'zones'],
        query: () => api.get<ZoneWithLocations[]>('/api/v1/warehouses/zones').then(r => r.data),
    });

    const { state: locState, refresh: refreshLocations, isLoading: loadingLocations } = useQuery({
        key: ['warehouse', 'locations'],
        query: () => api.get<Location[]>('/api/v1/warehouses/locations').then(r => r.data),
    });

    const { state: ailState, refresh: refreshAIL, isLoading: loadingArticleItemLocations } = useQuery({
        key: ['warehouse', 'articleItemLocations'],
        query: () => api.get<ArticleItemLocation[]>('/api/v1/articleItemLocations').then(r => r.data),
    });

    const warehouses = computed(() => whState.value.data ?? []);
    const zones = computed(() => zoneState.value.data ?? []);
    const locations = computed(() => locState.value.data ?? []);
    const articleItemLocations = computed(() => ailState.value.data ?? []);

    const loading = computed(() =>
        loadingWarehouses.value || loadingZones.value || loadingLocations.value || loadingArticleItemLocations.value,
    );

    async function fetchAll() {
        await Promise.all([
            refreshWarehouses(),
            refreshZones(),
            refreshLocations(),
            refreshAIL(),
        ]);
    }

    return {
        warehouses,
        zones,
        locations,
        articleItemLocations,
        loadingWarehouses,
        loadingZones,
        loadingLocations,
        loadingArticleItemLocations,
        loading,
        fetchWarehouses: refreshWarehouses,
        fetchZones: refreshZones,
        fetchLocations: refreshLocations,
        fetchArticleItemLocations: refreshAIL,
        fetchAll,
    };
});

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useWarehouseStore, import.meta.hot));
}
