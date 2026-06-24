// lib/api-utils.js
import { API_URL } from '@/config/index';

// Improved postToAPI function with proper error handling
export const postToAPI = async (endpoint, data, jwt) => {
  try {
    console.log(`Post to api url ${API_URL}/${endpoint}`)

    const response = await fetch(`${API_URL}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({ data }),
    });

    // Check if the response is ok before trying to parse JSON
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} ${response.statusText}. ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const updateInAPI = async (endpoint, id, data, jwt) => {
  try {
    const response = await fetch(`${API_URL}/${endpoint}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({ data }),
    });
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const deleteFromAPI = async (endpoint, id, jwt) => {
  try {
    const response = await fetch(`${API_URL}/${endpoint}/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// for exporting json
// In lib/utils.js


export function formatContentForExport(content, selectedType, selectedCategory) {
  // Ensure we have data to process
  if (!content?.data) {
    return [];
  }
  // Map the data to a cleaner format
  return content.data.map(item => ({
    id: item.id,
    title: item.attributes.title,
    description: item.attributes.description,
    content: item.attributes.content,
    type: item.attributes.type,
    slug: item.attributes.slug,
    status: item.attributes.status,
    category: item.attributes.category?.data?.attributes?.name || '',
    related_articles: item.attributes.related_articles || '',
    seo_title: item.attributes.seo_title || item.attributes.title,
    tags: item.attributes.tags || '',
    seo_keywords: item.attributes.seo_keywords || '',
    createdAt: item.attributes.createdAt,
    updatedAt: item.attributes.updatedAt,
    publishedAt: item.attributes.publishedAt
  }));
}


export function formatContentForExportOld(content, type, category) {
  // Filter content if type or category is provided
  let filteredContent = content;
  
  if (type || category) {
    filteredContent = content.filter(item => {
      const typeMatch = !type || item.type === type;
      const categoryMatch = !category || item.category === category;
      return typeMatch && categoryMatch;
    });
  }

  return filteredContent.map(item => ({
    id: item.id,
    title: item.title,
    content: item.content,
    category: item.category,
    type: item.type,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  }));
}

export function generateExportFilename(type, category) {
  const date = new Date().toISOString().split('T')[0];
  return `${category}-${type}-${date}.json`;
}