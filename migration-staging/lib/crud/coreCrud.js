//lib/crud/coreCrud.js
import axios from 'axios';
// READ OPERATIONS no auth needed
import { API_URL, API_URL_GQL, FRONTEND_URL, RUN_URL_AB, RUN_URL_TB, RUN_URL_CB, CDN_URL } from '@/config/index';;

// Sorting function
const sortByHierarchyOrder = (a, b) => a.tbHierarchyOrder - b.tbHierarchyOrder;


export async function fetchProjectDataFromPubset(email, jwt) {
  // console.log("log fetcher: ", { email, jwt })
  try {
    const res = await axios.get(`${API_URL}/timebars?filters[owner][$eq]=${email}&filters[isActive][$eq]=true`, {
      headers: { 'Authorization': `Bearer ${jwt}` }
    });
    const pubSet = res.data.data[0]?.attributes;

    if (!pubSet || pubSet.tb.length === 0) {
      throw new Error('No data found');
    }
    const allRows = pubSet.tbmdjoined.sort(sortByHierarchyOrder);

    return {
      pfRows: allRows.filter(row => row.tbType === "Portfolio"),
      pjRows: allRows.filter(row => row.tbType === "Project" && row.tbMDStatus === "In progress"),
    };
  } catch (error) {
    throw new Error('Failed to fetch data: ' + error.message);
  }
}



// Get all notifications for a specific order
export const getNotificationsByOrder = async (orderId, jwt) => {
  try {
    const endpoint = `${API_URL}/notifications?populate[order][populate]=product&filters[order][id][$eq]=${orderId}`;
    const msgOut = "Fetching notifications for order";
    const data = await readStrapiData100(endpoint, msgOut, jwt);

    if (!data) {
      return [];
    }

    const notificationList = data.map(item => ({
      id: item.id,
      manager_name: item.attributes.manager_name,
      manager_phone: item.attributes.manager_phone,
      manager_email: item.attributes.manager_email,
      timezone: item.attributes.timezone,
      is_active: item.attributes.is_active,
      primary_channel: item.attributes.primary_channel,
      secondary_channel: item.attributes.secondary_channel,
      business_hours_only: item.attributes.business_hours_only,
      quiet_hours_start: item.attributes.quiet_hours_start,
      quiet_hours_end: item.attributes.quiet_hours_end,
      weekend_notifications: item.attributes.weekend_notifications,
      days_overdue_threshold: item.attributes.days_overdue_threshold,
      budget_overrun_percent: item.attributes.budget_overrun_percent,
      overall_health_threshold: item.attributes.overall_health_threshold,
      executive_commitment_threshold: item.attributes.executive_commitment_threshold,
      risk_size_complexity_threshold: item.attributes.risk_size_complexity_threshold,
      strategic_value_threshold: item.attributes.strategic_value_threshold,
      likelyhood_of_success: item.attributes.likelyhood_of_success,
      cooldown_hours: item.attributes.cooldown_hours,
      max_notifications_per_day: item.attributes.max_notifications_per_day,
      last_notification_sent: item.attributes.last_notification_sent,
      notification_count_today: item.attributes.notification_count_today,
      enable_escalation: item.attributes.enable_escalation,
      escalation_delay_hours: item.attributes.escalation_delay_hours,
      max_escalation_attempts: item.attributes.max_escalation_attempts,
      escalation_phone: item.attributes.escalation_phone,
      notes: item.attributes.notes,
      createdAt: item.attributes.createdAt,
      updatedAt: item.attributes.updatedAt,
      order: {
        id: item.attributes.order?.data?.id,
        owner: item.attributes.order?.data?.attributes?.owner,
        total: item.attributes.order?.data?.attributes?.total,
        status: item.attributes.order?.data?.attributes?.status,
        name: item.attributes.order?.data?.attributes?.name,
        product_code: item.attributes.order?.data?.attributes?.product?.data?.attributes?.product_code || null,
        product_name: item.attributes.order?.data?.attributes?.product?.data?.attributes?.name || null,
      }
    }));

    return notificationList;
  } catch (error) {
    console.error('Error in getNotificationsByOrder:', error);
    throw error;
  }
};

// Get single notification by ID
export const getNotification = async (notificationId, jwt) => {
  try {
    const endpoint = `${API_URL}/notifications/${notificationId}?populate=order`;
    const msgOut = "Fetching notification";
    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${jwt}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.data) {
      throw new Error('No notification data received');
    }

    const item = result.data;
    const flattenedData = {
      id: item.id,
      manager_name: item.attributes.manager_name,
      manager_phone: item.attributes.manager_phone,
      manager_email: item.attributes.manager_email,
      timezone: item.attributes.timezone,
      is_active: item.attributes.is_active,
      primary_channel: item.attributes.primary_channel,
      secondary_channel: item.attributes.secondary_channel,
      business_hours_only: item.attributes.business_hours_only,
      quiet_hours_start: item.attributes.quiet_hours_start,
      quiet_hours_end: item.attributes.quiet_hours_end,
      weekend_notifications: item.attributes.weekend_notifications,
      days_overdue_threshold: item.attributes.days_overdue_threshold,
      budget_overrun_percent: item.attributes.budget_overrun_percent,
      overall_health_threshold: item.attributes.overall_health_threshold,
      executive_commitment_threshold: item.attributes.executive_commitment_threshold,
      risk_size_complexity_threshold: item.attributes.risk_size_complexity_threshold,
      strategic_value_threshold: item.attributes.strategic_value_threshold,
      likelyhood_of_success: item.attributes.likelyhood_of_success,
      cooldown_hours: item.attributes.cooldown_hours,
      max_notifications_per_day: item.attributes.max_notifications_per_day,
      last_notification_sent: item.attributes.last_notification_sent,
      notification_count_today: item.attributes.notification_count_today,
      enable_escalation: item.attributes.enable_escalation,
      escalation_delay_hours: item.attributes.escalation_delay_hours,
      max_escalation_attempts: item.attributes.max_escalation_attempts,
      escalation_phone: item.attributes.escalation_phone,
      notes: item.attributes.notes,
      createdAt: item.attributes.createdAt,
      updatedAt: item.attributes.updatedAt,
      order_id: item.attributes.order?.data?.id,
    };

    return flattenedData;
  } catch (error) {
    console.error('Error fetching notification:', error);
    throw error;
  }
};


// Enhanced debugging version of your functions

// Create new notification
export const createNotification = async (jwt, notificationData) => {
  // console.log("=== CREATE NOTIFICATION START ===");
  // console.log("notificationData:", notificationData);
  // console.log("jwt exists:", !!jwt);
  // console.log("jwt length:", jwt ? jwt.length : 0);

  const messageOutput = "Creating a notification";
  const endpoint = `${API_URL}/notifications`;

  //console.log("API_URL:", API_URL);
  //console.log("Full endpoint:", endpoint);

  try {
    //console.log("About to call createStrapiData...");
    const newNotification = await createStrapiData(endpoint, messageOutput, notificationData, jwt);
    //console.log("createStrapiData returned:", newNotification);
    return newNotification;
  } catch (err) {
    //console.error("=== ERROR IN createNotification ===");
    //console.error("Error type:", typeof err);
    //console.error("Error message:", err.message);
    //console.error("Error stack:", err.stack);
    //console.error("Full error object:", err);
    //// RE-THROW the error instead of returning a string
    throw err;
  }
};

// Create
export const createStrapiData = async (endpoint, msgOut, data, jwt = null) => {
  //  console.log("Data:", JSON.stringify(data, null, 2));
  // console.log("JWT provided:", !!jwt);

  try {
    const config = jwt ? { headers: { Authorization: `Bearer ${jwt}` } } : {};
    // console.log("Axios config:", config);
    const response = await axiosClient.post(endpoint, data, config);
    return response.data;
  } catch (error) {

    // Log more details about the error
    if (error.response) {

    } else if (error.request) {
      console.error("Error request:", error.request);
      console.error("No response received");
    } else {
      console.error("Error setting up request:", error.message);
    }

    console.error("Full error object:", error);

    // Call your handleError function but then RE-THROW
    handleError(error, `Error creating data at ${endpoint}:`);

    // RE-THROW the error instead of swallowing it
    throw error;
  }
};


// Update notification
export const updateNotification = async (jwt, data, notificationId) => {

  //console.log(" ---updateNotification ", data);

  let endpoint = `${API_URL}/notifications/${notificationId}`;
  const msgOut = "Updating a notification";
  try {
    await updateStrapiData(endpoint, msgOut, data, jwt);
  } catch (err) {
    console.error(err);
  }
};


// Delete notification
export const deleteNotification = async (jwt, notificationId) => {
  //console.log(" ---deleteNotification ");
  let endpoint = `${API_URL}/notifications/${notificationId}`;
  const msgOut = "Deleting a notification";
  try {
    await deleteStrapiData(endpoint, msgOut, jwt);
  } catch (err) {
    console.error(err);
  }
};

// Get orders for dropdown (lightweight version)
export const getOrdersForDropdown = async (email, jwt) => {
  try {
    const endpoint = `${API_URL}/orders?populate[0]=product&filters[owner][$eq]=${email}&filters[active_status][$eq]=true`;
    const msgOut = "Fetching active orders for dropdown";
    const data = await readStrapiData100(endpoint, msgOut, jwt);

    if (!data) {
      return [];
    }

    const orderList = data.map(item => ({
      id: item.id,
      label: `${item.attributes.owner} - ${item.attributes.product?.data?.attributes?.name || 'Unknown Product'}`,
      owner: item.attributes.owner,
      total: item.attributes.total,
      product_name: item.attributes.product?.data?.attributes?.name,
      expires_on: item.attributes.expires_on,
    }));

    return orderList;
  } catch (error) {
    console.error('Error in getOrdersForDropdown:', error);
    throw error;
  }
};

// Get all products
export const getAllProducts = async () => {
  const endpoint = API_URL + '/products?populate=*';
  const msgOut = 'Fetching all products';
  const response = await readStrapiData100(endpoint, msgOut);

  // console.log(response)

  return response.map(item => ({
    id: item.id,
    name: item.attributes.name,
    content: item.attributes.content,
    meta_description: item.attributes.meta_description,
    meta_title: item.attributes.meta_title,
    price: item.attributes.price,
    slug: item.attributes.slug,
    stripe_id: item.attributes.stripe_id,
    product_code: item.attributes.product_code,
    subscription_description: item.attributes.subscription_description,
    qty_backlogs: item.attributes.qty_backlogs,
    qty_pubsets: item.attributes.qty_pubsets,
    qty_training: item.attributes.qty_training,
    notes: item.attributes.notes,
    qty_bars: item.attributes.qty_bars,
    sort_by: item.attributes.sort_by,
    qty_spreadsheets: item.attributes.qty_spreadsheets,
    featured: item.attributes.featured,
    description: item.attributes.description,
    published: item.attributes.published,
    brand: item.attributes.brand,
    color: item.attributes.color,
    size: item.attributes.size,
    quantity: item.attributes.quantity,
    discount_price: item.attributes.discount_price,
    discount_start_date: item.attributes.discount_start_date,
    discount_end_date: item.attributes.discount_end_date,
    category: item.attributes.category,
    currency: item.attributes.currency,
    bestseller: item.attributes.bestseller,
    createdAt: item.attributes.createdAt,
    updatedAt: item.attributes.updatedAt,
    publishedAt: item.attributes.publishedAt,
    image1Path: item.attributes.image?.data?.attributes?.url ? `${API_URL_GQL}${item.attributes.image.data.attributes.url}` : null,
    image1SmallPath: item.attributes.image?.data?.attributes?.formats?.small?.url || null,
    image1ThumbPath: item.attributes.image?.data?.attributes?.formats?.thumbnail?.url || null,
    image1Name: item.attributes.image?.data?.attributes?.name || null,
    image1Width: item.attributes.image?.data?.attributes?.width || null,
    image1Height: item.attributes.image?.data?.attributes?.height || null,
    image1Hash: item.attributes.image?.data?.attributes?.hash || null,
    image1Ext: item.attributes.image?.data?.attributes?.ext || null,
    image1Mime: item.attributes.image?.data?.attributes?.mime || null,

    // Image 2 (imageUrl)
    image2Path: item.attributes.imageUrl?.data?.attributes?.url ? `${API_URL_GQL}${item.attributes.imageUrl.data.attributes.url}` : null,
    image2Name: item.attributes.imageUrl?.data?.attributes?.name || null,
    image2Width: item.attributes.imageUrl?.data?.attributes?.width || null,
    image2Height: item.attributes.imageUrl?.data?.attributes?.height || null,
    image2Hash: item.attributes.imageUrl?.data?.attributes?.hash || null,
    image2Ext: item.attributes.imageUrl?.data?.attributes?.ext || null,
    image2Mime: item.attributes.imageUrl?.data?.attributes?.mime || null
  }));
};

export const getOneProduct = async (productID) => {
  try {
    const endpoint = `${API_URL}/products/${productID}?populate=*`;
    const response = await readStrapiData100(endpoint, 'Fetching one product');

    const productData = Array.isArray(response) ? response[0] : response;
    if (!productData) return null;

    const item = productData.data || productData;
    return {
      id: item.id,
      name: item.attributes.name,
      content: item.attributes.content,
      meta_description: item.attributes.meta_description,
      meta_title: item.attributes.meta_title,
      price: item.attributes.price,
      slug: item.attributes.slug,
      stripe_id: item.attributes.stripe_id,
      product_code: item.attributes.product_code,
      subscription_description: item.attributes.subscription_description,
      qty_backlogs: item.attributes.qty_backlogs,
      qty_pubsets: item.attributes.qty_pubsets,
      qty_training: item.attributes.qty_training,
      notes: item.attributes.notes,
      qty_bars: item.attributes.qty_bars,
      sort_by: item.attributes.sort_by,
      qty_spreadsheets: item.attributes.qty_spreadsheets,
      featured: item.attributes.featured,
      description: item.attributes.description,
      published: item.attributes.published,
      brand: item.attributes.brand,
      color: item.attributes.color,
      size: item.attributes.size,
      quantity: item.attributes.quantity,
      discount_price: item.attributes.discount_price,
      discount_start_date: item.attributes.discount_start_date,
      discount_end_date: item.attributes.discount_end_date,
      category: item.attributes.category,
      currency: item.attributes.currency,
      bestseller: item.attributes.bestseller,
      createdAt: item.attributes.createdAt,
      updatedAt: item.attributes.updatedAt,
      publishedAt: item.attributes.publishedAt,
      image1Path: item.attributes.image?.data?.attributes?.url ? `${API_URL_GQL}${item.attributes.image.data.attributes.url}` : null,
      image1SmallPath: item.attributes.image?.data?.attributes?.formats?.small?.url || null,
      image1ThumbPath: item.attributes.image?.data?.attributes?.formats?.thumbnail?.url || null,
      image1Name: item.attributes.image?.data?.attributes?.name || null,
      image1Width: item.attributes.image?.data?.attributes?.width || null,
      image1Height: item.attributes.image?.data?.attributes?.height || null,
      image1Hash: item.attributes.image?.data?.attributes?.hash || null,
      image1Ext: item.attributes.image?.data?.attributes?.ext || null,
      image1Mime: item.attributes.image?.data?.attributes?.mime || null,

      // Image 2 (imageUrl)
      image2Path: item.attributes.imageUrl?.data?.attributes?.url ? `${API_URL_GQL}${item.attributes.imageUrl.data.attributes.url}` : null,
      image2Name: item.attributes.imageUrl?.data?.attributes?.name || null,
      image2Width: item.attributes.imageUrl?.data?.attributes?.width || null,
      image2Height: item.attributes.imageUrl?.data?.attributes?.height || null,
      image2Hash: item.attributes.imageUrl?.data?.attributes?.hash || null,
      image2Ext: item.attributes.imageUrl?.data?.attributes?.ext || null,
      image2Mime: item.attributes.imageUrl?.data?.attributes?.mime || null
    };
  } catch (error) {
    return null;
  }
};


// Get One product
export const getOneProductNoTryCatch = async (productID) => {
  const endpoint = `${API_URL}/products/${productID}?populate=*`;
  const msgOut = 'Fetching one product';
  const response = await readStrapiData100(endpoint, msgOut);

  // Check if response is an object (single product) or an array
  const productData = Array.isArray(response) ? response[0] : response;

  // If productData is undefined or null, throw an error
  if (!productData) {
    throw new Error('Product not found');
  }

  // Extract the data from the response
  const item = productData.data || productData;

  //console.log("productID ", productID);

  return {
    id: item.id,
    name: item.attributes.name,
    content: item.attributes.content,
    meta_description: item.attributes.meta_description,
    meta_title: item.attributes.meta_title,
    price: item.attributes.price,
    slug: item.attributes.slug,
    stripe_id: item.attributes.stripe_id,
    product_code: item.attributes.product_code,
    subscription_description: item.attributes.subscription_description,
    qty_backlogs: item.attributes.qty_backlogs,
    qty_pubsets: item.attributes.qty_pubsets,
    qty_training: item.attributes.qty_training,
    notes: item.attributes.notes,
    qty_bars: item.attributes.qty_bars,
    sort_by: item.attributes.sort_by,
    qty_spreadsheets: item.attributes.qty_spreadsheets,
    featured: item.attributes.featured,
    description: item.attributes.description,
    published: item.attributes.published,
    brand: item.attributes.brand,
    color: item.attributes.color,
    size: item.attributes.size,
    quantity: item.attributes.quantity,
    discount_price: item.attributes.discount_price,
    discount_start_date: item.attributes.discount_start_date,
    discount_end_date: item.attributes.discount_end_date,
    category: item.attributes.category,
    currency: item.attributes.currency,
    bestseller: item.attributes.bestseller,
    createdAt: item.attributes.createdAt,
    updatedAt: item.attributes.updatedAt,
    publishedAt: item.attributes.publishedAt,
    image1Path: item.attributes.image?.data?.attributes?.url ? `${API_URL_GQL}${item.attributes.image.data.attributes.url}` : null,
    image1SmallPath: item.attributes.image?.data?.attributes?.formats?.small?.url || null,
    image1ThumbPath: item.attributes.image?.data?.attributes?.formats?.thumbnail?.url || null,
    image1Name: item.attributes.image?.data?.attributes?.name || null,
    image1Width: item.attributes.image?.data?.attributes?.width || null,
    image1Height: item.attributes.image?.data?.attributes?.height || null,
    image1Hash: item.attributes.image?.data?.attributes?.hash || null,
    image1Ext: item.attributes.image?.data?.attributes?.ext || null,
    image1Mime: item.attributes.image?.data?.attributes?.mime || null,

    // Image 2 (imageUrl)
    image2Path: item.attributes.imageUrl?.data?.attributes?.url ? `${API_URL_GQL}${item.attributes.imageUrl.data.attributes.url}` : null,
    image2Name: item.attributes.imageUrl?.data?.attributes?.name || null,
    image2Width: item.attributes.imageUrl?.data?.attributes?.width || null,
    image2Height: item.attributes.imageUrl?.data?.attributes?.height || null,
    image2Hash: item.attributes.imageUrl?.data?.attributes?.hash || null,
    image2Ext: item.attributes.imageUrl?.data?.attributes?.ext || null,
    image2Mime: item.attributes.imageUrl?.data?.attributes?.mime || null
  };
};

// Get products by category (assuming this function exists based on your component usage)
export const getProductsByCategory = async (categorySlug) => {
  const endpoint = `/products?filters[categories][slug][$eq]=${categorySlug}&populate=*`;
  const msgOut = `Fetching products for category: ${categorySlug}`;
  const response = await readStrapiData100(endpoint, msgOut);

  // Check if response is an array (multiple products)
  if (!Array.isArray(response)) {
    throw new Error('Invalid response format');
  }

  // If response is empty, throw an error
  if (response.length === 0) {
    throw new Error('No products found for this category');
  }

  // Extract and transform the data from the response
  return response.map(item => ({
    id: item.id,
    name: item.attributes.name,
    description: item.attributes.description,
    mrp: item.attributes.mrp,
    sellingPrice: item.attributes.sellingPrice,
    itemQuantityType: item.attributes.itemQuantityType,
    categorySlug: item.attributes.slug,
    createdAt: item.attributes.createdAt,
    updatedAt: item.attributes.updatedAt,
    publishedAt: item.attributes.publishedAt,
    detail: item.attributes.detail,
    categoryName: item.attributes.categories?.data[0]?.attributes?.name || null,
    imageName: item.attributes.images?.data[0]?.attributes?.name || null,
    imageUrl: item.attributes.images?.data[0]?.attributes?.url || null,
    imgUrlFull: item.attributes.images?.data[0]?.attributes?.url
      ? `${API_URL}${item.attributes.images.data[0].attributes.url}`
      : null,
  }));
};

/* Documents from tbdocuments store */

/**
 * Fetches a single document from Strapi by slug
 * @param {string} docSlug - The slug of the document to fetch
 * @returns {Promise<Object|null>} - The formatted document or null if not found
 */
export const getTbDocument = async (docSlug) => {
  try {

    // console.log("docSlug ", docSlug)

    // Fix: Use template literals properly with backticks
    // const endpoint = `${API_URL}/tbdocuments?filters[slug][$eq]=${docSlug}&populate=*`;
    const msgOut = `Fetching document with slug: ${docSlug}`;
    const endpoint = "https://be2.timebars.com/api/tbdocuments?filters[slug][$eq]=features-json&populate=*"
    const response = await readStrapiDataClaude(endpoint, msgOut);

    // Strapi v4 usually returns { data, meta } structure
    // Check if response exists and has data
    if (!response || !response.data || response.data.length === 0) {
      console.log(`No document found with slug: ${docSlug}`);
      return null;
    }
    // Since we're filtering by slug which should be unique, 
    // we should only get one result, so take the first item
    const item = response.data[0];
    // console.log(`fetching document with slug ${docSlug}:`);
    // Return a single object instead of an array since we're fetching by unique slug
    return {
      id: item.id,
      name: item.attributes.name,
      type: item.attributes.type,
      author: item.attributes.author,
      categoryName: item.attributes.category,
      short_description: item.attributes.short_description,
      status: item.attributes.status,
      content: item.attributes.content,
      jsoncontent: item.attributes.jsoncontent,
      slug: item.attributes.slug,
      video_url: item.attributes.video_url,
      createdAt: item.attributes.createdAt,
      updatedAt: item.attributes.updatedAt,
      publishedAt: item.attributes.publishedAt,
    };
  } catch (error) {
    console.error(`Error fetching document with slug ${docSlug}:`, error);
    throw new Error(`Failed to fetch document: ${error.message}`);
  }
};

// lib/crud/coreCrud.js

export const getAllFAQs = async () => {
  try {
    const msgOut = `Fetching all FAQs`;
    const endpoint = `${API_URL}/faqs?&populate=*`;

    // Use readStrapiData100 instead of readStrapiDataClaude
    // This will get up to 100 FAQs in a single request
    const response = await readStrapiData100(endpoint, msgOut);

    // Check if response exists and has data
    if (!response || response.length === 0) {
      console.log(`No FAQs found.`);
      return [];
    }

    // Map over response to extract FAQ details
    const faqs = response.map(item => ({
      id: item.id,
      title: item.attributes.title,
      content: item.attributes.content,
      category: item.attributes.category,
      site_page: item.attributes.site_page,
      createdAt: item.attributes.createdAt,
      updatedAt: item.attributes.updatedAt,
      publishedAt: item.attributes.publishedAt,
    }));

    return faqs;

  } catch (error) {
    console.error(`Error fetching FAQs:`, error);
    // Return empty array instead of null to prevent filter errors
    return [];
  }
};

// If you need more than 100 FAQs, you can use this function instead
export const getAllFAQsPaginated = async () => {
  try {
    const msgOut = `Fetching all FAQs`;
    const endpoint = `${API_URL}/faqs?&populate=*`;

    let allFAQs = [];
    let page = 1;
    let hasMoreData = true;

    // Fetch all pages until no more data is returned
    while (hasMoreData) {
      const response = await readStrapiData100(endpoint, msgOut, null, page, 100);

      if (!response || response.length === 0) {
        hasMoreData = false;
      } else {
        const faqs = response.map(item => ({
          id: item.id,
          title: item.attributes.title,
          content: item.attributes.content,
          category: item.attributes.category,
          site_page: item.attributes.site_page,
          createdAt: item.attributes.createdAt,
          updatedAt: item.attributes.updatedAt,
          publishedAt: item.attributes.publishedAt,
        }));

        allFAQs = [...allFAQs, ...faqs];
        page++;
      }
    }

    return allFAQs;

  } catch (error) {
    console.error(`Error fetching FAQs:`, error);
    return [];
  }
};

/** Generic function to fetch data from Strapi API */
export const readStrapiDataClaude = async (endpoint, logMessage = 'Fetching data', options = {}) => {
  try {
    //console.log(logMessage);

    // Set default options for fetch
    const fetchOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    };

    // Add authorization if JWT token exists
    const token = typeof window !== 'undefined' ? localStorage.getItem('jwt') : null;
    if (token) {
      fetchOptions.headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(endpoint, fetchOptions);

    // Check for HTTP errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}. ${errorData.error?.message || ''
        }`
      );
    }

    // Parse JSON response
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error in readStrapiData100 for ${endpoint}:`, error);
    throw error;
  }
};

export const getTbDocumentOrig = async (docSlug) => {
  const endpoint = API_URL + '/tbdocuments?filters[slug][$eq]=${docSlug}&populate=*';
  const msgOut = 'Fetching one document';
  const response = await readStrapiData100(endpoint, msgOut);

  //console.log(response);
  //return
  // The response.data is a document
  return response.map(item => ({
    id: item.id,
    name: item.attributes.name,
    type: item.attributes.type,
    author: item.attributes.author,
    categoryName: item.attributes.category,
    short_description: item.attributes.short_description,
    status: item.attributes.status,
    content: item.attributes.content,
    jsoncontent: item.attributes.jsoncontent,
    slug: item.attributes.slug,
    video_url: item.attributes.video_url,
    createdAt: item.attributes.createdAt,
    updatedAt: item.attributes.updatedAt,
    publishedAt: item.attributes.publishedAt,
  }));

};

// for ab, tb cb and common
export const getAllArticles = async () => {
  //  const endpoint = API_URL + '/articles?populate=*&filters[category][name][$in][0]=Agilebars&filters[category][name][$in][1]=Costbars&filters[category][name][$in][2]=Timebars&filters[category][name][$in][3]=Common';
  const endpoint = API_URL + '/articles?populate=*';
  const msgOut = 'Fetching all articles';
  const response = await readStrapiData100(endpoint, msgOut);

  return response.map(item => ({
    id: item.id,
    title: item.attributes.title,
    content: item.attributes.content,
    contentjson: item.attributes.contentjson,
    email: item.attributes.email,
    createdAt: item.attributes.createdAt,
    updatedAt: item.attributes.updatedAt,
    publishedAt: item.attributes.publishedAt,
    locale: item.attributes.locale,
    slug: item.attributes.slug,
    categoryName: item.attributes.category?.data?.attributes?.name || null,
    categoryColor: item.attributes.category?.data?.attributes?.color || null,
    typeName: item.attributes.type || null,
    description: item.attributes.description || null,
    statusName: item.attributes.status?.data?.attributes?.name || null,
    // Added SEO and related fields
    seo_title: item.attributes.seo_title || item.attributes.title,
    related_articles: item.attributes.related_articles || '',
    tags: item.attributes.tags || '',
    seo_keywords: item.attributes.seo_keywords || '',
    image_link: item.attributes.image_link || ''

  }));
};



// may not be used???
export const getOneArticle = async (articleSlug) => {
  const endpoint = API_URL + `/articles?filters[slug][$eq]=${articleSlug}&populate=*`;
  //const endpoint = 'https://ntbe.rlan.ca/api/articles?filters[slug][$eq]=about-page&populate=*'
  const msgOut = `Fetching one article by slug: ${articleSlug}`;
  const response = await readStrapiData100(endpoint, msgOut);
  const item = response[0]

  // console.log("getOneArticle()  articleSlug: ", articleSlug);

  // Check if an article was found
  if (item) {
    return {
      id: item.id,
      title: item.attributes.title,
      content: item.attributes.content,
      contentjson: item.attributes.contentjson,
      email: item.attributes.email,
      createdAt: item.attributes.createdAt,
      updatedAt: item.attributes.updatedAt,
      publishedAt: item.attributes.publishedAt,
      locale: item.attributes.locale,
      slug: item.attributes.slug,
      categoryName: item.attributes.category?.data?.attributes?.name || null,
      categoryColor: item.attributes.category?.data?.attributes?.color || null,
      typeName: item.attributes.type?.data?.attributes?.name || null,
      typeDescription: item.attributes.type?.data?.attributes?.description || null,
      statusName: item.attributes.status?.data?.attributes?.name || null,
      // Add any other fields you need from the JSON structure
    };

  } else {
    // Return null or throw an error if no article is found
    return null;
  }
};

export const getBlogArticles = async () => {
  const endpoint = `/articles?filters[type][name][$eq]=Blog&populate=*`;
  //const endpoint = 'https://ntbe.rlan.ca/api/articles?filters[type][name][$eq]=Blog&populate=*'
  const msgOut = `Fetching all blog articles where Type = blog:`;
  const response = await readStrapiData100(endpoint, msgOut);

  // console.log("response ", response);

  // Check if an article was found
  if (response) {
    return response.map(item => ({
      id: item.id,
      title: item.attributes.title,
      content: item.attributes.content,
      contentjson: item.attributes.contentjson,
      email: item.attributes.email,
      createdAt: item.attributes.createdAt,
      updatedAt: item.attributes.updatedAt,
      publishedAt: item.attributes.publishedAt,
      locale: item.attributes.locale,
      slug: item.attributes.slug,
      imagemulti: item.attributes.imagemulti?.data || null,
      imagesingle: {
        id: item.attributes.imagesingle?.data?.id || null,
        name: item.attributes.imagesingle?.data?.attributes?.name || null,
        url: API_URL + item.attributes.imagesingle?.data?.attributes?.url || null,
        width: item.attributes.imagesingle?.data?.attributes?.width || null,
        height: item.attributes.imagesingle?.data?.attributes?.height || null,
        formats: item.attributes.imagesingle?.data?.attributes?.formats || null,
      },
      category: item.attributes.category?.data || null,
      type: {
        id: item.attributes.type?.data?.id || null,
        name: item.attributes.type?.data?.attributes?.name || null,
        description: item.attributes.type?.data?.attributes?.description || null,
        active: item.attributes.type?.data?.attributes?.active || null,
      },
      status: {
        id: item.attributes.status?.data?.id || null,
        name: item.attributes.status?.data?.attributes?.name || null,
        description: item.attributes.status?.data?.attributes?.description || null,
      },
      localizations: item.attributes.localizations?.data || [],
    }));

  } else {
    // Return null or throw an error if no article is found
    return null;
  }
};

// Get category list
export const getCategoryList = async () => {
  const endpoint = '/categories?populate=*';
  const msgOut = 'Fetching category list';
  return await readStrapiData100(endpoint, msgOut);
};

// Get one category
export const getCategoryItem = async (slug) => {
  const endpoint = `/categories?filters[slug][$eq]=${slug}&populate=*`;
  const msgOut = `Fetching category with slug: ${slug}`;
  return await readStrapiData100(endpoint, msgOut);
};
/* https://be2.timebars.com/api/orders/157?populate=*
{"data":{"id":157,"attributes":{"total":60,"checkout_session":"agilebars session","status":"paid","owner":"jcox@agilebars.com","expires_on":"08-Jul-2024","active_status":true,"notes":"manual entery","total_monthly":20,"qty_months":3,"createdAt":"2022-12-11T16:41:00.682Z","updatedAt":"2023-08-01T21:23:18.834Z","product":{"data":{"id":7,"attributes":{"name":"Agilebars Tier 2","content":"Timebars Ltd. product with increased limits as as follows:\n- SUBSCRIPTION - Monthly\n- BARS - 600\n- PROJECTS/RESOURCES  - 10/100\n- CLOUD PUBSETS - 2\n- SPREADSHEET - 2 (1 - Excel, 1 LO Calc)\n- TRAINING - Not Included","meta_description":"Agilebars Tier 2 includes Tier 1 plus Cloud publishing/sharing, increased backlog and bar limits.","meta_title":"AB Tier 2","price":10,"slug":"agilebars-tier-2","stripe_id":"na","product_code":"ABT02","subscription_description":"Agilebars Tier 2 monthly subscription.","qty_backlogs":"Projects: 10, Resources: 100","qty_pubsets":"Two","qty_training":"Not Included","notes":"","qty_bars":"Six Hundred","sort_by":2,"qty_spreadsheets":"Two","featured":true,"description":null,"published":null,"brand":null,"color":null,"size":null,"quantity":null,"discount_price":8,"discount_start_date":null,"discount_end_date":null,"category":null,"currency":null,"bestseller":null,"createdAt":"2022-11-25T20:05:45.283Z","updatedAt":"2024-09-22T17:04:03.542Z","publishedAt":"2022-11-25T20:05:45.109Z"}}},"user":{"data":{"id":5,"attributes":{"username":"Jim Coxab","email":"jcox@agilebars.com","provider":"local","confirmed":true,"blocked":false,"createdAt":"2022-11-26T19:43:07.011Z","updatedAt":"2024-05-14T19:09:26.288Z"}}}}},"meta":{}}
*/

/* ORDERS CRUd */

// get order by email
export const getMyOrders = async (email, jwt) => {
  try {
    const endpoint = `${API_URL}/orders?populate[0]=product&populate[1]=user&[filters][owner][$eq]=${email}`;
    const msgOut = "Fetching user orders";
    const data = await readStrapiData100(endpoint, msgOut, jwt);

    if (!data) {
      throw new Error('No data received from readStrapiData100');
    }

    const orderList = data.map(item => ({
      id: item.id,
      total: item.attributes.total,
      checkout_session: item.attributes.checkout_session,
      status: item.attributes.status,
      owner: item.attributes.owner,

      name: item.attributes.name,

      expires_on: item.attributes.expires_on,
      active_status: item.attributes.active_status,
      notes: item.attributes.notes,
      total_monthly: item.attributes.total_monthly,
      qty_months: item.attributes.qty_months,
      createdAt: item.attributes.createdAt,
      updatedAt: item.attributes.updatedAt,
      subtotal: item.attributes.subtotal,
      postalcode: item.attributes.postalcode,
      tax: item.attributes.tax,
      description: item.attributes.description,
      product: {
        id: item.attributes.product?.data?.id,
        name: item.attributes.product?.data?.attributes?.name,
        content: item.attributes.product?.data?.attributes?.content,
        meta_description: item.attributes.product?.data?.attributes?.meta_description,
        meta_title: item.attributes.product?.data?.attributes?.meta_title,
        price: item.attributes.product?.data?.attributes?.price,
        slug: item.attributes.product?.data?.attributes?.slug,
        stripe_id: item.attributes.product?.data?.attributes?.stripe_id,
        product_code: item.attributes.product?.data?.attributes?.product_code,
        subscription_description: item.attributes.product?.data?.attributes?.subscription_description,
        qty_backlogs: item.attributes.product?.data?.attributes?.qty_backlogs,
        qty_pubsets: item.attributes.product?.data?.attributes?.qty_pubsets,
        qty_training: item.attributes.product?.data?.attributes?.qty_training,
        qty_bars: item.attributes.product?.data?.attributes?.qty_bars,
        sort_by: item.attributes.product?.data?.attributes?.sort_by,
        qty_spreadsheets: item.attributes.product?.data?.attributes?.qty_spreadsheets,
        featured: item.attributes.product?.data?.attributes?.featured,
        description: item.attributes.product?.data?.attributes?.description,
        published: item.attributes.product?.data?.attributes?.published,
        brand: item.attributes.product?.data?.attributes?.brand,
        color: item.attributes.product?.data?.attributes?.color,
        size: item.attributes.product?.data?.attributes?.size,
        quantity: item.attributes.product?.data?.attributes?.quantity,
        discount_price: item.attributes.product?.data?.attributes?.discount_price,
        discount_start_date: item.attributes.product?.data?.attributes?.discount_start_date,
        discount_end_date: item.attributes.product?.data?.attributes?.discount_end_date,
        category: item.attributes.product?.data?.attributes?.category,
        currency: item.attributes.product?.data?.attributes?.currency,
        bestseller: item.attributes.product?.data?.attributes?.bestseller,
        createdAt: item.attributes.product?.data?.attributes?.createdAt,
        updatedAt: item.attributes.product?.data?.attributes?.updatedAt,
        publishedAt: item.attributes.product?.data?.attributes?.publishedAt,
      },
      user: {
        id: item.attributes.user?.data?.id,
        username: item.attributes.user?.data?.attributes?.username,
        email: item.attributes.user?.data?.attributes?.email,
        provider: item.attributes.user?.data?.attributes?.provider,
        confirmed: item.attributes.user?.data?.attributes?.confirmed,
        blocked: item.attributes.user?.data?.attributes?.blocked,
        createdAt: item.attributes.user?.data?.attributes?.createdAt,
        updatedAt: item.attributes.user?.data?.attributes?.updatedAt,
        postal_code: item.attributes.user?.data?.attributes?.postal_code,
        city: item.attributes.user?.data?.attributes?.city,
        country: item.attributes.user?.data?.attributes?.country,
        provstate: item.attributes.user?.data?.attributes?.provstate,
        phone: item.attributes.user?.data?.attributes?.phone,
        weburl: item.attributes.user?.data?.attributes?.weburl,
        address: item.attributes.user?.data?.attributes?.address,
      }
    }));

    return orderList;
  } catch (error) {
    console.error('Error in getMyOrders:', error);
    throw error;
  }
};
// Create order in Strapi
export const createOrder = async (orderData, token) => {
  const messageOutput = "creating an order"
  const orderEndpoint = `${API_URL}/orders`;
  try {
    const newOrder = await createStrapiData(orderEndpoint, messageOutput, orderData, token);
    return newOrder
  } catch (err) {

    console.error(err);
    return "OrderNotCreated"
  }
};

// update order
export const updateOrder = async (jwt, data, orderId) => {
  // console.log(" ---updateOrder ")
  let endpoint = `${API_URL}/orders/${orderId}`
  const msgOut = "Updating an order"
  try {
    await updateStrapiData(endpoint, msgOut, data, jwt)

  } catch (err) {
    console.error(err);
  }
};


// update Article
export const updateArticle = async (jwt, data, articleID) => {
  //console.log(" ---updateArticle ")
  let endpoint = `${API_URL}/articles/${articleID}`
  const msgOut = "Updating an article"
  try {
    await updateStrapiData(endpoint, msgOut, data, jwt)

  } catch (err) {
    console.error(err);
  }
};

// delete order
const deleteOrder = async (id) => {
  try {
    await fetch(`${API_URL}/orders?filters[owner][$eq]=${useremail}`, {
      method: 'Delete',
      body: JSON.stringify({ id }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
  } catch (err) {
    console.error(err);
  }
};

// set all orders for an email to inactive (the new order will become active)

export const updateOrdersToInActive = async (email, jwt) => {
  //console.log("---updateOrdersToInActive");

  try {
    let orderData = await getMyOrders(email, jwt);

    //console.log("---updateOrdersToInActive orderData:", orderData);

    // Check if orderData is an array and has items
    if (Array.isArray(orderData) && orderData.length > 0) {
      // Use Promise.all to handle multiple async operations
      await Promise.all(orderData.map(async (order) => {
        // console.log("Updating order:", order.id);

        const updateData = { data: { active_status: false } };

        await updateOrder(jwt, updateData, order.id);
      }));

      // console.log("All orders updated successfully");
    } else {
      console.log("No orders found to update");
    }
  } catch (err) {
    console.error("Error updating orders to inactive:", err);
  }
};


export const getUserProfile = async (jwt) => {
  try {
    const response = await fetch(`${API_URL}/users/me?populate=profilephoto`, {
      headers: {
        'Authorization': `Bearer ${jwt}`
      }
    });
    const userData = await response.json();

    //console.log(userData);

    const flattenedData = {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      provider: userData.provider,
      confirmed: userData.confirmed,
      blocked: userData.blocked,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
      postal_code: userData.postal_code,
      city: userData.city,
      country: userData.country,
      provstate: userData.provstate,
      phone: userData.phone,
      weburl: userData.weburl,
      address: userData.address,
      customer_id: userData.customer_id,
      primary_role: userData.primary_role,

      profilePhotoUrl: userData.profilephoto && userData.profilephoto.length > 0
        ? `${API_URL_GQL}${userData.profilephoto[0].url}`
        : null
    };

    // console.log(flattenedData);

    return flattenedData;
  } catch (error) {
    console.error(`Error fetching user profile:`, error);
    throw error;
  }
}


export const forgotPwd = async ({ email }) => {
  const res = await fetch(`${API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  })

  const data = await res.json()

  if (res.ok) {
    return data
  } else {
    throw new Error(data.message || 'An error occurred')
  }
}

export const resetPwd = async ({ code, password, passwordConfirmation }) => {
  const res = await fetch(`${API_URL}/auth/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code, password, passwordConfirmation }),
  })

  const data = await res.json()

  if (res.ok) {
    return data
  } else {
    throw new Error(data.message || 'An error occurred')
  }
}


// HELP ARTICLES MAR 10 2025
export const getAllHelpArticles = async () => {
  const endpoint = API_URL + '/help-articles?populate=*';
  const msgOut = 'Fetching all help articles';
  const response = await readStrapiData100(endpoint, msgOut);

  // Flatten the response data
  return response.map(item => ({
    id: item.id,
    title: item.attributes.title,
    slug: item.attributes.slug,
    type: item.attributes.type,
    description: item.attributes.description,
    subtitle: item.attributes.subtitle,
    content: item.attributes.content,
    createdAt: item.attributes.createdAt,
    updatedAt: item.attributes.updatedAt,
    publishedAt: item.attributes.publishedAt,
    tags: item.attributes.tags,
    seoTitle: item.attributes.seo_title,
    seoKeywords: item.attributes.seo_keywords,
    status: item.attributes.status,
    author: item.attributes.author,
    categoryName: item.attributes.category?.data?.attributes?.name || null,
    categorySlug: item.attributes.category?.data?.attributes?.slug || null,
    productTags: item.attributes.product_tags?.data?.map(tag => ({
      id: tag.id,
      name: tag.attributes.name,
      description: tag.attributes.description,
      order: tag.attributes.order
    })) || []
  }));
};

export const getOneHelpArticle = async (articleSlug) => {
  const endpoint = API_URL + `/help-articles?filters[slug][$eq]=${articleSlug}&populate=*`;
  const msgOut = `Fetching one help article by slug: ${articleSlug}`;
  const response = await readStrapiData100(endpoint, msgOut);

  // Check if an article was found
  if (response && response.length > 0) {
    const item = response[0];

    return {
      id: item.id,
      title: item.attributes.title,
      slug: item.attributes.slug,
      type: item.attributes.type,
      description: item.attributes.description,
      subtitle: item.attributes.subtitle,
      content: item.attributes.content,
      createdAt: item.attributes.createdAt,
      updatedAt: item.attributes.updatedAt,
      publishedAt: item.attributes.publishedAt,
      tags: item.attributes.tags,
      seoTitle: item.attributes.seo_title,
      seoKeywords: item.attributes.seo_keywords,
      status: item.attributes.status,
      author: item.attributes.author,
      categoryName: item.attributes.category?.data?.attributes?.name || null,
      categorySlug: item.attributes.category?.data?.attributes?.slug || null,
      productTags: item.attributes.product_tags?.data?.map(tag => ({
        id: tag.id,
        name: tag.attributes.name,
        description: tag.attributes.description,
        order: tag.attributes.order
      })) || []
    };
  } else {
    // Return null if no article is found
    return null;
  }
};

// Function to get articles by product
export const getHelpArticlesByProduct = async (productName) => {
  const endpoint = API_URL + `/help-articles?populate=*&filters[product_tags][name][$eq]=${productName}`;
  const msgOut = `Fetching help articles for product: ${productName}`;
  const response = await readStrapiData100(endpoint, msgOut);

  // Flatten the response data
  return response.map(item => ({
    id: item.id,
    title: item.attributes.title,
    slug: item.attributes.slug,
    type: item.attributes.type,
    description: item.attributes.description,
    subtitle: item.attributes.subtitle,
    content: item.attributes.content,
    createdAt: item.attributes.createdAt,
    updatedAt: item.attributes.updatedAt,
    publishedAt: item.attributes.publishedAt,
    tags: item.attributes.tags,
    seoTitle: item.attributes.seo_title,
    seoKeywords: item.attributes.seo_keywords,
    status: item.attributes.status,
    author: item.attributes.author,
    categoryName: item.attributes.category?.data?.attributes?.name || null,
    categorySlug: item.attributes.category?.data?.attributes?.slug || null,
    productTags: item.attributes.product_tags?.data?.map(tag => ({
      id: tag.id,
      name: tag.attributes.name,
      description: tag.attributes.description,
      order: tag.attributes.order
    })) || []
  }));
};

/* START My base set of Generic  api call functions */


// get or read strapi data
export const readStrapiData100 = async (endpoint, msgOut, jwt = null, page = 1, pageSize = 100) => {
  try {
    const config = jwt ? { headers: { Authorization: `Bearer ${jwt}` } } : {};

    // Add pagination parameters to the URL
    const paginatedEndpoint = `${endpoint}${endpoint.includes('?') ? '&' : '?'}pagination[page]=${page}&pagination[pageSize]=${pageSize}`;

    const response = await axiosClient.get(paginatedEndpoint, config);
    return response.data.data;
  } catch (error) {
    handleError(error, `Error reading data from ${endpoint}:`);
  }
};



// Update
export const updateStrapiData = async (endpoint, msgOut, data, jwt = null) => {
  try {
    //console.log("updating strapi data message: ", msgOut);
    const config = jwt ? { headers: { Authorization: `Bearer ${jwt}` } } : {};
    const response = await axiosClient.put(endpoint, data, config);
    return response.data;
  } catch (error) {
    handleError(error, `Error updating data at ${endpoint}:`);
  }
};

// delete Strapi Data function
export const deleteStrapiData = async (endpoint, msgOut, jwt = null) => {
  try {
    //console.log(msgOut);
    const config = jwt ? { headers: { Authorization: `Bearer ${jwt}` } } : {};
    // console.log("config ", config);
    const response = await axiosClient.delete(endpoint, config);
    return response.data;
  } catch (error) {
    console.error(`Error deleting data at ${endpoint}:`, error);
    throw error; // Re-throw the error so it can be caught in the calling function
  }
};

// create axios client
const axiosClient = axios.create({
  baseURL: API_URL
})

// Generic error handler
const handleError = (error, errorText) => {
  console.error(errorText, error);
  if (error.response) {
    console.error('Server responded with error:', error.response.status);
    console.error('Error data:', error.response.data);
  } else if (error.request) {
    console.error('No response received:', error.request);
  } else {
    console.error('Error setting up request:', error.message);
  }
  throw error;
};


/* END My base set of api call functions */

/* START Dashboard Sources CRUD Operations */

/**
 * Create a new dashboard source
 * @param {Object} data - Dashboard source data
 * @param {string} jwt - Auth token (admin token recommended)
 * @returns {Promise<Object>} Created dashboard source
 */
export const createDashboardSource = async (data, jwt) => {
  const endpoint = `${API_URL}/dashboard-sources`;
  const msgOut = "Creating dashboard source";

  try {
    const response = await createStrapiData(endpoint, msgOut, { data }, jwt);
    return response.data;
  } catch (error) {
    console.error('Error in createDashboardSource:', error);
    throw error;
  }
};

/**
 * Get all dashboard sources for a user
 * Includes sources they own AND sources shared with them via grant_tm_access_to
 * @param {string} email - User email to filter by
 * @param {string} jwt - Auth token
 * @returns {Promise<Array>} List of dashboard sources with isOwner flag
 */
export const getAllDashboardSources = async (email, jwt) => {
  try {
    // Fetch ALL dashboard sources (we'll filter client-side for shared)
    const endpoint = `${API_URL}/dashboard-sources?sort=createdAt:desc`;
    const msgOut = "Fetching dashboard sources";
    const data = await readStrapiData100(endpoint, msgOut, jwt);

    if (!data) {
      return [];
    }

    // Transform and filter: owner OR grant_tm_access_to contains email
    const dashboardSources = data
      .map(item => ({
        id: item.id,
        name: item.attributes.name,
        owner: item.attributes.owner,
        Customer_id: item.attributes.Customer_id,
        tbmdjoined: item.attributes.tbmdjoined,
        tbresources: item.attributes.tbresources,
        tbrescalcs2: item.attributes.tbrescalcs2 || null,
        tbcharts: item.attributes.tbcharts || null,
        tbtags: item.attributes.tbtags,
        tbdocuments: item.attributes.tbdocuments || null, // Pubset catalog
        tb: item.attributes.tb || null, // Reserved for summarized data
        tbmd: item.attributes.tbmd || null, // Reserved for summarized data
        source_product: item.attributes.source_product,
        publish_status: item.attributes.publish_status,
        aggregation_level: item.attributes.aggregation_level,
        division: item.attributes.division,
        cost_center: item.attributes.cost_center,
        geographic_region: item.attributes.geographic_region,
        isActive: item.attributes.isActive,
        published_date: item.attributes.published_date,
        createdAt: item.attributes.createdAt,
        updatedAt: item.attributes.updatedAt,
        sourcePubsetIds: item.attributes.uid, // Hyphen-separated pubset IDs
        grant_tm_access_to: item.attributes.grant_tm_access_to || '',
        isOwner: item.attributes.owner === email,
      }))
      .filter(item => {
        // Include if user is owner OR if grant_tm_access_to contains their email
        const isOwner = item.owner === email;
        const isShared = item.grant_tm_access_to &&
                        item.grant_tm_access_to.split(',').map(e => e.trim()).includes(email);
        return isOwner || isShared;
      });

    return dashboardSources;
  } catch (error) {
    console.error('Error in getAllDashboardSources:', error);
    throw error;
  }
};

/**
 * Get a single dashboard source by ID
 * @param {string|number} id - Dashboard source ID
 * @param {string} jwt - Auth token
 * @returns {Promise<Object>} Dashboard source data
 */
export const getOneDashboardSource = async (id, jwt) => {
  try {
    const endpoint = `${API_URL}/dashboard-sources/${id}`;
    const msgOut = "Fetching dashboard source";

    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${jwt}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch dashboard source: ${response.status}`);
    }

    const data = await response.json();
    const item = data.data;

    return {
      id: item.id,
      name: item.attributes.name,
      owner: item.attributes.owner,
      Customer_id: item.attributes.Customer_id,
      tbmdjoined: item.attributes.tbmdjoined,
      tbresources: item.attributes.tbresources,
      tbrescalcs2: item.attributes.tbrescalcs2 || null,
      tbcharts: item.attributes.tbcharts || null,
      tbtags: item.attributes.tbtags,
      tbdocuments: item.attributes.tbdocuments || null, // Pubset catalog
      tb: item.attributes.tb || null, // Reserved for summarized data
      tbmd: item.attributes.tbmd || null, // Reserved for summarized data
      source_product: item.attributes.source_product,
      publish_status: item.attributes.publish_status,
      aggregation_level: item.attributes.aggregation_level,
      division: item.attributes.division,
      cost_center: item.attributes.cost_center,
      geographic_region: item.attributes.geographic_region,
      isActive: item.attributes.isActive,
      published_date: item.attributes.published_date,
      createdAt: item.attributes.createdAt,
      updatedAt: item.attributes.updatedAt,
      sourcePubsetIds: item.attributes.uid,
      grant_tm_access_to: item.attributes.grant_tm_access_to || '',
    };
  } catch (error) {
    console.error('Error in getOneDashboardSource:', error);
    throw error;
  }
};

/**
 * Update a dashboard source
 * @param {string|number} id - Dashboard source ID
 * @param {Object} data - Updated data
 * @param {string} jwt - Auth token
 * @returns {Promise<Object>} Updated dashboard source
 */
export const updateDashboardSource = async (id, data, jwt) => {
  const endpoint = `${API_URL}/dashboard-sources/${id}`;
  const msgOut = "Updating dashboard source";

  try {
    await updateStrapiData(endpoint, msgOut, { data }, jwt);
  } catch (error) {
    console.error('Error in updateDashboardSource:', error);
    throw error;
  }
};

/**
 * Set a dashboard source as active and deactivate all others for the same customer
 * Only one source can be active per organization (Customer_id)
 * @param {string|number} sourceId - Dashboard source ID to activate
 * @param {string} customerId - Customer ID to scope the activation
 * @param {string} jwt - Auth token
 * @returns {Promise<void>}
 */
export const setActiveDashboardSource = async (sourceId, customerId, jwt) => {
  try {
    // First, get all sources for this customer
    const allSourcesEndpoint = `${API_URL}/dashboard-sources?filters[Customer_id][$eq]=${customerId}`;
    const msgOut = "Fetching customer dashboard sources";
    const response = await fetch(allSourcesEndpoint, {
      headers: { 'Authorization': `Bearer ${jwt}` }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch customer sources: ${response.status}`);
    }

    const data = await response.json();
    const sources = data.data || [];

    // Update each source: set isActive based on whether it's the selected one
    const updatePromises = sources.map(source => {
      const isActive = source.id.toString() === sourceId.toString();
      return updateDashboardSource(source.id, { isActive }, jwt);
    });

    await Promise.all(updatePromises);

    console.log(`Dashboard source ${sourceId} set as active for customer ${customerId}`);
  } catch (error) {
    console.error('Error in setActiveDashboardSource:', error);
    throw error;
  }
};

/**
 * Get the active dashboard source for a customer
 * @param {string} customerId - Customer ID
 * @param {string} jwt - Auth token
 * @returns {Promise<Object|null>} Active dashboard source or null if none active
 */
export const getActiveDashboardSource = async (customerId, jwt) => {
  try {
    const endpoint = `${API_URL}/dashboard-sources?filters[Customer_id][$eq]=${customerId}&filters[isActive][$eq]=true`;
    const msgOut = "Fetching active dashboard source";

    const response = await fetch(endpoint, {
      headers: { 'Authorization': `Bearer ${jwt}` }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch active source: ${response.status}`);
    }

    const data = await response.json();
    const sources = data.data || [];

    if (sources.length === 0) {
      return null;
    }

    // Return the first active source (should only be one)
    const item = sources[0];
    return {
      id: item.id,
      name: item.attributes.name,
      owner: item.attributes.owner,
      Customer_id: item.attributes.Customer_id,
      tbmdjoined: item.attributes.tbmdjoined,
      tbresources: item.attributes.tbresources,
      tbrescalcs2: item.attributes.tbrescalcs2 || null,
      tbcharts: item.attributes.tbcharts || null,
      tbtags: item.attributes.tbtags,
      tbdocuments: item.attributes.tbdocuments || null, // Pubset catalog
      tb: item.attributes.tb || null, // Reserved for summarized data
      tbmd: item.attributes.tbmd || null, // Reserved for summarized data
      source_product: item.attributes.source_product,
      publish_status: item.attributes.publish_status,
      aggregation_level: item.attributes.aggregation_level,
      division: item.attributes.division,
      cost_center: item.attributes.cost_center,
      geographic_region: item.attributes.geographic_region,
      isActive: item.attributes.isActive,
      published_date: item.attributes.published_date,
      createdAt: item.attributes.createdAt,
      updatedAt: item.attributes.updatedAt,
      grant_tm_access_to: item.attributes.grant_tm_access_to,
    };
  } catch (error) {
    console.error('Error in getActiveDashboardSource:', error);
    throw error;
  }
};

/**
 * Delete a dashboard source
 * @param {string|number} id - Dashboard source ID
 * @param {string} jwt - Auth token
 * @returns {Promise<void>}
 */
export const deleteDashboardSource = async (id, jwt) => {
  const endpoint = `${API_URL}/dashboard-sources/${id}`;
  const msgOut = "Deleting dashboard source";

  try {
    await deleteStrapiData(endpoint, msgOut, jwt);
  } catch (error) {
    console.error('Error in deleteDashboardSource:', error);
    throw error;
  }
};

/**
 * Get users by Customer ID for sharing
 * @param {string} customerId - Customer ID to filter by
 * @param {string} jwt - Auth token
 * @returns {Promise<Array>} List of users with id, name, email, role
 */
export const getUsersByCustomerId = async (customerId, jwt) => {
  try {
    const endpoint = `${API_URL}/users?filters[customer_id][$eq]=${customerId}&sort=username:asc`;
    const msgOut = "Fetching users by Customer ID";

    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${jwt}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.status}`);
    }

    const data = await response.json();

    // Transform to simpler format
    const users = data.map(user => ({
      id: user.id,
      name: user.username || user.email,
      email: user.email,
      role: user.primary_role || 'User',
      customerId: user.customer_id || user.Customer_id, // Try lowercase first
    }));

    return users;
  } catch (error) {
    console.error('Error in getUsersByCustomerId:', error);
    throw error;
  }
};

/**
 * Get user role by email
 * @param {string} email - User email
 * @param {string} jwt - Auth token
 * @returns {Promise<string>} User's primary_role
 */
export const getUserRole = async (email, jwt) => {
  try {
    const endpoint = `${API_URL}/users?filters[email][$eq]=${email}`;
    const msgOut = "Fetching user role";

    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${jwt}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.status}`);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return null;
    }

    return data[0].primary_role || null;
  } catch (error) {
    console.error('Error in getUserRole:', error);
    throw error;
  }
};

/**
 * Get user by email - returns full user object with Customer_id
 * @param {string} email - User email
 * @param {string} jwt - Auth token
 * @returns {Promise<object>} User object with id, email, Customer_id, primary_role
 */
export const getUserByEmail = async (email, jwt) => {
  try {
    const endpoint = `${API_URL}/users?filters[email][$eq]=${email}`;

    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${jwt}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.status}`);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return null;
    }

    const user = data[0];
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      Customer_id: user.customer_id || user.Customer_id, // Try lowercase first, then uppercase
      primary_role: user.primary_role || null,
    };
  } catch (error) {
    console.error('Error in getUserByEmail:', error);
    throw error;
  }
};

/**
 * Preprocess resource data for a dashboard source.
 * Extracts Allocation rows from tbmdjoined and reshapes them into
 * the tbrescalcs2 format for use by resource visualization charts.
 * No need to go back to the original pubsets — all data is already
 * in the dashboard source's tbmdjoined after consolidation.
 *
 * @param {Object} dashboardSource - Dashboard source object (must have id and tbmdjoined)
 * @param {string} jwt - Auth token
 * @returns {Promise<Object>} Result with { success, resCalcsCount, message }
 */
export const preprocessDashboardSourceData = async (dashboardSource, jwt) => {
  try {
    const tbmdjoined = dashboardSource.tbmdjoined;

    if (!tbmdjoined || !Array.isArray(tbmdjoined)) {
      return {
        success: false,
        resCalcsCount: 0,
        message: 'No tbmdjoined data found on this dashboard source',
      };
    }

    // Filter for Allocation rows — these contain the resource assignment data
    const allocationRows = tbmdjoined.filter(row => row.tbType === 'Allocation');

    if (allocationRows.length === 0) {
      return {
        success: false,
        resCalcsCount: 0,
        message: 'No Allocation rows found in tbmdjoined. Ensure the dashboard source was created with all 5 hierarchy levels.',
      };
    }

    // Reshape Allocation rows into tbrescalcs2 format
    // Allocation rows may already have tbResCalc* fields from the source application;
    // where present we use them directly, otherwise we map from standard fields.
    const resCalcs = allocationRows.map((row, index) => {
      const tbResCalcTbID = row.tbResCalcTbID || row.tbID || '';
      const tbResCalcResID = row.tbResCalcResID || row.tbResID || '';
      const weekNo = row.tbResCalcWeekNo || (index + 1);

      return {
        id: row.id || index,
        // Hierarchy
        tbL1: row.tbL1 || '',
        tbL2: row.tbL2 || '',
        tbL3: row.tbL3 || 'NA',
        tbL4: row.tbL4 || '',
        tbL5: row.tbL5 || '',
        // Identity
        tbName: row.tbName || '',
        tbType: 'Allocation',
        tbOwner: row.tbOwner || '',
        tbResCalcID: row.tbResCalcID || `${tbResCalcTbID}:${tbResCalcResID}:${weekNo}`,
        tbResCalcTbID,
        tbResCalcResID,
        // Hours & Cost
        tbResCalcHours: row.tbResCalcHours || String(row.tbWork || '0'),
        tbResCalcCost: row.tbResCalcCost || String(row.tbCost || '0'),
        tbResCalcWdays: row.tbResCalcWdays || '5',
        tbResCalcName: row.tbResCalcName || 'weekly',
        // Time period
        tbResCalcWeek: row.tbResCalcWeek || row.tbStart || '',
        tbResCalcMonday: row.tbResCalcMonday || row.tbStart || '',
        tbResCalcFriday: row.tbResCalcFriday || row.tbFinish || '',
        tbResCalcWeekNo: row.tbResCalcWeekNo || weekNo,
        apStatusDate: row.apStatusDate || '',
        // Resource metadata
        tbMDLocation: row.tbMDLocation || '',
        tbMDNameShort: row.tbMDNameShort || '',
        tbMDDepartment: row.tbMDDepartment || '',
        tbMDPrimaryRole: row.tbMDPrimaryRole || '',
        tbMDPrimarySkill: row.tbMDPrimarySkill || '',
        tbResCalcCustomerID: row.tbResCalcCustomerID || '',
      };
    });

    // Store the preprocessed tbrescalcs2 on the dashboard source
    await updateDashboardSource(dashboardSource.id, { tbrescalcs2: resCalcs }, jwt);

    return {
      success: true,
      resCalcsCount: resCalcs.length,
      message: `Preprocessed ${resCalcs.length} resource calculations from ${allocationRows.length} Allocation rows in tbmdjoined`,
    };
  } catch (error) {
    console.error('Error preprocessing dashboard source data:', error);
    return {
      success: false,
      resCalcsCount: 0,
      message: `Preprocessing failed: ${error.message}`,
    };
  }
};

/* END Dashboard Sources CRUD Operations */

export default {
  getAllArticles,
  getCategoryList,
  getAllProducts,
  getProductsByCategory,
  getCategoryItem
}