import { acceptHMRUpdate, defineStore } from "pinia";
import { useQuery } from "@pinia/colada";
import { computed } from "vue";
import { api } from "src/boot/axios";
import type { Article } from "src/models/Article";

export const ARTICLE_KEYS = {
    list: ['articles'] as const,
};

export const useArticleStore = defineStore('article', () => {
    const { state, refresh, isLoading: loading } = useQuery({
        key: ARTICLE_KEYS.list,
        query: () => api.get<Article[]>('/api/v1/articles').then(r => r.data),
    });

    const articles = computed(() => state.value.data ?? []);

    return { articles, loading, fetchArticles: refresh };
});

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useArticleStore, import.meta.hot));
}
