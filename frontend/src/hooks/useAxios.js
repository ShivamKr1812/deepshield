import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const useAxios = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const api = axios.create({
    baseURL: API_URL,
  });

  // Request interceptor to attach JWT token
  api.interceptors.request.use(
    (config) => {
      const activeToken = token || localStorage.getItem('token');
      if (activeToken) {
        config.headers.Authorization = `Bearer ${activeToken}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to catch session expiration
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        logout();
        navigate('/login');
      }
      return Promise.reject(error);
    }
  );

  return api;
};
