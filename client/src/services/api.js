// client/src/services/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'https://mindspace-backend.loca.lt',
});

// Add token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
});

export default API;