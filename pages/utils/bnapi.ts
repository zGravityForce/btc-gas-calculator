import axios, { AxiosInstance } from 'axios';

const bnApiInstance: AxiosInstance = axios.create({
  baseURL: 'https://api.binance.com/api/v3', // Use your API base URL
  // Other global settings
});

// Optionally add global request or response interceptors
bnApiInstance.interceptors.request.use(
  config => {
    // Modify or add config settings
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export default bnApiInstance;
