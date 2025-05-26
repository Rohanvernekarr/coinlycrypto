import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
};

export const cryptoAPI = {
  getTrending: () => api.get('/crypto/trending'),
  getTopCoins: () => api.get('/crypto/top-coins'),
  getCoin: (id) => api.get(`/crypto/coin/${id}`),
  getCoinHistory: (id, days = '7') => api.get(`/crypto/coin/${id}/history?days=${days}`),
};

export const portfolioAPI = {
  getPortfolio: () => api.get('/portfolio'),
  addCoin: (coinData) => api.post('/portfolio/add', coinData),
  updateCoin: (id, coinData) => api.put(`/portfolio/${id}`, coinData),
  deleteCoin: (id) => api.delete(`/portfolio/${id}`),
};

export default api;