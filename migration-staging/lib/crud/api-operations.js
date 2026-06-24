// lib/crud/api-operations.js
import { postToAPI, updateInAPI, deleteFromAPI } from './api-utils';
import { API_URL, STRAPI_API_TOKEN } from '@/config/index';

// for help articles

// Helper function to format product tags properly for Strapi
const formatProductTags = (article) => {
  const attributes = article.attributes || article;
  
  // If product_tags exists in the data, ensure it's properly formatted for Strapi
  if (attributes.product_tags) {
    // If product_tags is already formatted for connect, leave it
    if (attributes.product_tags.connect) {
      return article;
    }
    
    // If it's in the data format returned from the API, convert it
    if (attributes.product_tags.data) {
      const tagIds = attributes.product_tags.data.map(tag => tag.id);
      
      // Check if tag ID 4 should be alone
      if (tagIds.includes(4) && tagIds.length > 1) {
        throw new Error(`Product tag ID 4 must be used alone for article: ${attributes.title || 'Untitled'}`);
      }
      
      // Set the proper connect format
      if (article.attributes) {
        article.attributes.product_tags = { connect: tagIds };
      } else {
        article.product_tags = { connect: tagIds };
      }
    } 
    // If it's an array of IDs, convert to connect format
    else if (Array.isArray(attributes.product_tags)) {
      const tagIds = attributes.product_tags;
      
      // Check if tag ID 4 should be alone
      if (tagIds.includes(4) && tagIds.length > 1) {
        throw new Error(`Product tag ID 4 must be used alone for article: ${attributes.title || 'Untitled'}`);
      }
      
      // Set the proper connect format
      if (article.attributes) {
        article.attributes.product_tags = { connect: tagIds };
      } else {
        article.product_tags = { connect: tagIds };
      }
    }
  }
  
  return article;
};


// Fetch Help Articles with filtering by category
export const fetchHelpArticles = async (categoryName) => {
  try {
    const baseUrl = `${API_URL}/help-articles?populate=*`;
    const filters = [];
    
    if (categoryName) {
      filters.push(`filters[category][name][$eq]=${categoryName}`);
    }
    
    const filterString = filters.length > 0 ? `&${filters.join('&')}` : '';
    const paginationString = '&pagination[limit]=200';
    
  //  console.log('Fetching help articles for category:', categoryName);
  //  console.log('URL:', `${baseUrl}${filterString}${paginationString}`);
    
    const response = await fetch(
      `${baseUrl}${filterString}${paginationString}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Raw response count:', data.data?.length || 0);
    
    return data;
  } catch (error) {
    console.error('Error fetching help articles:', error);
    throw error;
  }
};

// Fixed createHelpArticles function
export const createHelpArticles = async (jsonData, jwt) => {
  const results = [];
  
  // Ensure jsonData has the expected structure
  const dataToProcess = Array.isArray(jsonData.data) ? jsonData.data : 
                       (Array.isArray(jsonData) ? jsonData : [jsonData]);
  
  for (let article of dataToProcess) {
    try {
      // Format article data properly including product_tags
      article = formatProductTags(article);
      
      // Extract article data correctly based on structure
      const articleData = article.attributes || article;
      
      // Make sure we have a title for reporting
      const title = articleData.title || 'Untitled Help Article';
      
      // Send to API with hyphen, not underscore
      const result = await postToAPI('help-articles', articleData, jwt);
      
      results.push({
        title: title,
        success: true,
        data: result
      });
    } catch (error) {
      results.push({
        title: article.title || article.attributes?.title || 'Untitled Help Article',
        success: false,
        error: error.message
      });
    }
  }
  return results;
};

// Fixed updateHelpArticles function
export const updateHelpArticles = async (jsonData, jwt) => {
  const results = [];
  
  const dataToProcess = Array.isArray(jsonData.data) ? jsonData.data : 
                       (Array.isArray(jsonData) ? jsonData : [jsonData]);
  
  for (let article of dataToProcess) {
    try {
      // Format article data properly including product_tags
      article = formatProductTags(article);
      
      // Get the ID and data
      const id = article.id || article.attributes?.id;
      if (!id) {
        throw new Error('Missing ID for update operation');
      }
      
      const articleData = article.attributes || article;
      
      // Make sure we have a title for reporting
      const title = articleData.title || 'Untitled Help Article';
      
      // Send to API with hyphen, not underscore
      const result = await fetch(`${API_URL}/help-articles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({ data: articleData }),
      });
      
      if (!result.ok) {
        const errorText = await result.text();
        throw new Error(`API Error: ${result.status} ${result.statusText}. ${errorText}`);
      }
      
      const response = await result.json();
      
      results.push({
        title: title,
        success: true,
        data: response
      });
    } catch (error) {
      results.push({
        title: article.title || article.attributes?.title || 'Untitled Help Article',
        success: false,
        error: error.message
      });
    }
  }
  return results;
};

// Fixed deleteHelpArticles function
export const deleteHelpArticles = async (jsonData, jwt) => {
  const results = [];
  
  const dataToProcess = Array.isArray(jsonData.data) ? jsonData.data : 
                       (Array.isArray(jsonData) ? jsonData : [jsonData]);
  
  for (const article of dataToProcess) {
    try {
      // Get the ID
      const id = article.id || article.attributes?.id;
      if (!id) {
        throw new Error('Missing ID for delete operation');
      }
      
      // Make sure we have a title for reporting
      const title = article.title || article.attributes?.title || 'Untitled Help Article';
      
      // Send to API with hyphen, not underscore
      const result = await fetch(`${API_URL}/help-articles/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
      
      if (!result.ok) {
        const errorText = await result.text();
        throw new Error(`API Error: ${result.status} ${result.statusText}. ${errorText}`);
      }
      
      const response = await result.json();
      
      results.push({
        title: title,
        success: true,
        data: response
      });
    } catch (error) {
      results.push({
        title: article.title || article.attributes?.title || 'Untitled Help Article',
        success: false,
        error: error.message
      });
    }
  }
  return results;
};

// Update only the content field of a single help article
export const updateHelpArticleContent = async (id, content, jwt) => {
  const response = await fetch(`${API_URL}/help-articles/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({ data: { content } }),
  })
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`API Error: ${response.status} ${response.statusText}. ${errorText}`)
  }
  return response.json()
}

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

export const createArticles = async (jsonData, jwt) => {
  const results = [];
  for (const article of jsonData.data) {
    try {
      const result = await postToAPI('articles', article, jwt);
      results.push({
        title: article.title || 'Untitled Article',
        success: true,
        data: result
      });
    } catch (error) {
      results.push({
        title: article.title || 'Untitled Article',
        success: false,
        error: error.message
      });
    }
  }
  return results;
};

export const updateArticles = async (jsonData, jwt) => {
  const results = [];
  for (const article of jsonData.data) {
    try {
      if (!article.id) throw new Error('Article ID is required for update');
      const result = await updateInAPI('articles', article.id, article, jwt);
      results.push({
        title: article.title || `ID: ${article.id}`,
        success: true,
        data: result
      });
    } catch (error) {
      results.push({
        title: article.title || 'Untitled Article',
        success: false,
        error: error.message
      });
    }
  }
  return results;
};

export const deleteArticles = async (jsonData, jwt) => {
  const results = [];
  for (const article of jsonData.data) {
    try {
      if (!article.id) throw new Error('Article ID is required for deletion');
      const result = await deleteFromAPI('articles', article.id, jwt);
      results.push({
        title: article.title || `ID: ${article.id}`,
        success: true,
        data: result
      });
    } catch (error) {
      results.push({
        title: article.title || `ID: ${article.id}`,
        success: false,
        error: error.message
      });
    }
  }
  return results;
};

// new for exporting json



export async function fetchStrapiContent() {
  try {
    const response = await fetch(`${API_URL}/articles?populate[category]=true`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
       /*  Authorization: `Bearer ${STRAPI_API_TOKEN}`, */
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch content');
    }

    const data = await response.json();
    
    // Transform the Strapi response to our needed format
    return data.data.map(item => ({
      id: item.id,
      title: item.attributes.title,
      content: item.attributes.content,
      category: item.attributes.category, // Agilebars, Timebars, Costbars
      type: item.attributes.type,        // product-help, product-marketing, tutorials
      createdAt: item.attributes.createdAt,
      updatedAt: item.attributes.updatedAt
    }));
  } catch (error) {
    console.error('Error in fetchStrapiContent:', error);
    throw error;
  }
}
// https://be2.timebars.app/api/articles?populate[category]=true&filters[type][$eq]=Feature&filters[category][name][$eq]=Agilebars&pagination[limit]=200


// https://be2.timebars.app/api/articles?populate[category]=true&filters[type][$eq]=Product Help&filters[category][name][$eq]=Agilebars&pagination[limit]=200

// In lib/api.js

//https://be2.timebars.app/api/articles?populate=*&filters[type][$eq]='Product Help'&filters[category][$eq]=Agilebars
// https://be2.timebars.app/api/articles?populate=*&filters[type][$eq]=Process Help

// https://be2.timebars.app/api/articles?populate=*&filters[type][$eq]=Process Help

// https://be2.timebars.app/api/articles?populate[category]=true&filters[type][$eq]=Product%20Help&filters[category][name][$eq]=Agilebars&pagination[limit]=50

// https://be2.timebars.app/api/articles?populate[category]=true&filters[type][$eq]=Product Help&filters[category][name][$eq]=Agilebars&pagination[limit]=200
// https://be2.timebars.app/api/articles?populate[category]=true&filters[type][$eq]=Product Help&filters[category][name][$eq]=Agilebars&pagination[limit]=200

// Optional: Add this if you want to filter on the server side
export async function fetchFilteredContent(type, category) {
    try {
      const baseUrl = `${API_URL}/articles?populate[category]=true`;
      const filters = [];
      
      if (type) filters.push(`filters[type][$eq]=${type}`);
      if (category) filters.push(`filters[category][name][$eq]=${category}`);
      
      const filterString = filters.length > 0 ? `&${filters.join('&')}` : '';
      const paginationString = '&pagination[limit]=200';
      
      const response = await fetch(
        `${baseUrl}${filterString}${paginationString}`, 
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          /*   Authorization: `Bearer ${STRAPI_API_TOKEN}`, */
          },
        }
      );
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      return data;
  
    } catch (error) {
      console.error('Error fetching filtered content:', error);
      throw error;
    }
  }