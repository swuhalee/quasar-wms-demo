import { api } from 'src/boot/axios';
import type { Article } from 'src/models/Article';

export const articleApi = {
    fetchArticles: () =>
        api.get<Article[]>('/api/v1/articles').then((r) => r.data),
};
