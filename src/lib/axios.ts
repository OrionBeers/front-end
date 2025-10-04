import axios from 'axios';
import { auth } from '@/assets/scripts/firebase';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const axiosInstance = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  async (config) => {
    // Add Firebase authentication token if available
    const user = auth.currentUser;
    if (user) {
      try {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.error('Error getting Firebase token:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
      
      if (error.response.status === 401) {
        // Try to refresh the token
        const user = auth.currentUser;
        if (user) {
          try {
            await user.getIdToken(true); // Force refresh
            // Retry the original request
            const originalRequest = error.config;
            const token = await user.getIdToken();
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            // Redirect to login page if needed
            // window.location.href = '/';
          }
        }
      }
    } else if (error.request) {
      // Request was sent but no response received
      console.error('No response received:', error.request);
    } else {
      // Error occurred while setting up the request
      console.error('Request error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
