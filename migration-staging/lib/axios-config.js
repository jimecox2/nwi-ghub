import axios from 'axios';

// Create an Axios instance with default config
const axiosClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor
axiosClient.interceptors.request.use(
  (config) => {
    // You can add tokens or other headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle specific error cases if needed
    return Promise.reject(error);
  }
);

export default axiosClient;