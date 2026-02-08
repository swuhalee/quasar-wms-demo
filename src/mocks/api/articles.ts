import { http, HttpResponse } from 'msw';
import { BASE } from '../helper';
import { db } from '../data/db';

const getArticles = http.get(`${BASE}/articles`, () => {
    return HttpResponse.json(db.articles);
});

const getArticle = http.get(`${BASE}/articles/:articleSystemId`, ({ params }) => {
    const id = Number(params['articleSystemId']);
    const article = db.articles.find((a) => a.articleSystemId === id);
    if (!article) {
        return HttpResponse.json({ message: 'Article not found' }, { status: 404 });
    }
    return HttpResponse.json(article);
});

const getArticleItemLocations = http.get(`${BASE}/articleItemLocations`, () => {
    return HttpResponse.json(db.articleItemLocations);
});

export const articlesHandlers = [
    getArticles,
    getArticle,
    getArticleItemLocations
];
