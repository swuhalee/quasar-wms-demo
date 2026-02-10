import { useQuery } from '@pinia/colada';
import { computed } from 'vue';
import { articleApi } from 'src/api/articleApi';

export const ARTICLE_KEYS = {
    list: ['articles'] as const,
};

/** 품목 전체 목록 조회 */
export function useArticles() {
    const { state, refresh, isLoading } = useQuery({
        key: () => [...ARTICLE_KEYS.list],
        query: articleApi.fetchArticles,
    });

    const articles = computed(() => state.value.data ?? []);

    return { articles, isLoading, refresh };
}
