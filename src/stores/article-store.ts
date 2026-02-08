import { acceptHMRUpdate, defineStore } from "pinia";
import { useQuery } from "@pinia/colada";
import { computed } from "vue";
import { api } from "src/boot/axios";
import type { Article } from "src/models/Article";

export const useArticleStore = defineStore('article', () => {
    const { state, refresh } = useQuery({
        key: ['articles'],
        query: () => api.get<Article[]>('/api/v1/articles').then(r => r.data),
    });

    const articles = computed(() => state.value.data ?? []);
    const loading = computed(() => state.value.status === 'pending');

    return { articles, loading, fetchArticles: refresh };
});

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useArticleStore, import.meta.hot));
}
