// lib/crud/articleHelpers.js - Helper functions for managing articles
import { getAllArticles } from './coreCrud';

export const getArticlesByCategory = async (categoryName) => {
  const allArticles = await getAllArticles();
  return allArticles.filter(article => 
    article.categoryName === categoryName || article.categoryName === "Common"
  );
};

export const getArticleBySlug = async (slug) => {
  const allArticles = await getAllArticles();
  return allArticles.find(article => article.slug === slug);
};

export const getAllSlugs = async () => {
  const allArticles = await getAllArticles();
  return allArticles.map(article => article.slug);
};

export const getRelatedArticles = async (articleSlug) => {
  const allArticles = await getAllArticles();
  const article = allArticles.find(article => article.slug === articleSlug);
  
  if (!article || !article.related_articles) return [];
  
  const relatedSlugs = article.related_articles.split(',').map(slug => slug.trim());
  return allArticles.filter(a => relatedSlugs.includes(a.slug));
};