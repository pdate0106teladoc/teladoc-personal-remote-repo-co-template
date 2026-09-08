import axios from 'axios';
 
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('accessToken');
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);
 
// Optional: Add interceptors here
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Global error logging
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);
 
export default axiosInstance;
