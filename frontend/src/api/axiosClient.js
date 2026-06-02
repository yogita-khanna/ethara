import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    const detail = error.response?.data?.detail;
    
    const enhancedError = new Error(message);
    enhancedError.detail = detail;
    enhancedError.status = error.response?.status;
    
    throw enhancedError;
  }
);

export default axiosClient;
