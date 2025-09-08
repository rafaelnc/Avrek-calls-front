import axios from 'axios';
import { AuthResponse, Call, CreateCallRequest, LoginRequest } from '../types';
import { API_BASE_URL } from '../../src/config/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
};

export const callsService = {
  createCall: async (callData: CreateCallRequest): Promise<Call> => {
    const response = await api.post('/calls', callData);
    return response.data;
  },

  getCalls: async (): Promise<Call[]> => {
    const response = await api.get('/calls');
    return response.data;
  },

  downloadPdf: async (callId: number): Promise<Blob> => {
    const response = await api.get(`/calls/${callId}/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default api;
