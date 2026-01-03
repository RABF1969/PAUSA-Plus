
import axios from 'axios';

// Create a dedicated Axios instance for Master Layer
const masterApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Inject Master Token
masterApi.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('alfabiz_master_token');
  if (token) {
    config.headers['x-master-token'] = token;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response Interceptor: Handle Unauthorized (401)
masterApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response &&(error.response.status === 401 || error.response.status === 403)) {
      // Clear token and redirect to login
      sessionStorage.removeItem('alfabiz_master_token');
      // Using HashRouter, we must redirect to the hash path
      window.location.href = '/#/alfabiz/login';
    }
    return Promise.reject(error);
  }
);

export default masterApi;
