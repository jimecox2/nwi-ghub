// lib/data-operations.js
import { postToAPI, updateInAPI, deleteFromAPI } from './api-utils';

export const createFAQs = async (jsonData, jwt) => {
  const results = [];
  for (const faq of jsonData.data) {
    try {
      const result = await postToAPI('faqs', faq.attributes, jwt);
      results.push({
        title: faq.attributes.title,
        success: true,
        data: result
      });
    } catch (error) {
      results.push({
        title: faq.attributes.title,
        success: false,
        error: error.message
      });
    }
  }
  return results;
};

export const createBlogs = async (jsonData, jwt) => {
  const results = [];
  for (const blog of jsonData.data) {
    try {
      const result = await postToAPI('articles', blog, jwt);
      results.push({
        title: blog.title || 'Untitled Blog',
        success: true,
        data: result
      });
    } catch (error) {
      results.push({
        title: blog.title || 'Untitled Blog',
        success: false,
        error: error.message
      });
    }
  }
  return results;
};

export const createFeatures = async (jsonData, jwt) => {
  const results = [];
  for (const feature of jsonData.data) {
    try {
      const result = await postToAPI('articles', feature[0], jwt);
      results.push({
        title: feature[0].title || 'Untitled Feature',
        success: true,
        data: result
      });
    } catch (error) {
      results.push({
        title: feature[0].title || 'Untitled Feature',
        success: false,
        error: error.message
      });
    }
  }
  return results;
};

export const createPubSets = async (jsonData, jwt) => {
  const results = [];
  for (const pubset of jsonData.data) {
    try {
      const result = await postToAPI('timebars', pubset, jwt);
      results.push({
        title: pubset.name || 'Untitled PubSet',
        success: true,
        data: result
      });
    } catch (error) {
      results.push({
        title: pubset.name || 'Untitled PubSet',
        success: false,
        error: error.message
      });
    }
  }
  return results;
};

export const updateBlogs = async (jsonData, jwt) => {
  const results = [];
  for (const blog of jsonData.data) {
    try {
      if (!blog.id) throw new Error('Blog ID is required for update');
      const result = await updateInAPI('articles', blog.id, blog, jwt);
      results.push({
        title: blog.title || 'Untitled Blog',
        success: true,
        data: result
      });
    } catch (error) {
      results.push({
        title: blog.title || 'Untitled Blog',
        success: false,
        error: error.message
      });
    }
  }
  return results;
};

export const updateFeatures = async (jsonData, jwt) => {
  const results = [];
  for (const feature of jsonData.data) {
    try {
      if (!feature[0].id) throw new Error('Feature ID is required for update');
      const result = await updateInAPI('articles', feature[0].id, feature[0], jwt);
      results.push({
        title: feature[0].title || 'Untitled Feature',
        success: true,
        data: result
      });
    } catch (error) {
      results.push({
        title: feature[0].title || 'Untitled Feature',
        success: false,
        error: error.message
      });
    }
  }
  return results;
};

export const deleteBlogs = async (jsonData, jwt) => {
  const results = [];
  for (const blog of jsonData.data) {
    try {
      if (!blog.id) throw new Error('Blog ID is required for deletion');
      const result = await deleteFromAPI('articles', blog.id, jwt);
      results.push({
        title: blog.title || `ID: ${blog.id}`,
        success: true,
        data: result
      });
    } catch (error) {
      results.push({
        title: blog.title || `ID: ${blog.id}`,
        success: false,
        error: error.message
      });
    }
  }
  return results;
};

export const deleteFeatures = async (jsonData, jwt) => {
  const results = [];
  for (const feature of jsonData.data) {
    try {
      if (!feature[0].id) throw new Error('Feature ID is required for deletion');
      const result = await deleteFromAPI('articles', feature[0].id, jwt);
      results.push({
        title: feature[0].title || `ID: ${feature[0].id}`,
        success: true,
        data: result
      });
    } catch (error) {
      results.push({
        title: feature[0].title || `ID: ${feature[0].id}`,
        success: false,
        error: error.message
      });
    }
  }
  return results;
};