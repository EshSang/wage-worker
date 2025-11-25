import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Only redirect on 401 if user is already logged in (has a token)
    // Don't redirect on login/signup failures
    const isAuthRoute = error.config?.url === '/signin' || error.config?.url === '/signup';

    if (error.response?.status === 401 && !isAuthRoute) {
      // Token expired or invalid - only redirect if already authenticated
      const hasToken = localStorage.getItem('token');
      if (hasToken) {
        console.log('🔴 Token expired or invalid, redirecting to signin...');
        localStorage.removeItem('token');
        sessionStorage.removeItem('selectedType');
        window.location.href = '/signin';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
