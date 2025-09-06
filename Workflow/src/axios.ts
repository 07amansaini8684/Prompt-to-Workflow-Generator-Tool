import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE || '/api';

export const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance; 