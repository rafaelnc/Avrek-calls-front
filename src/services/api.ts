import axios from 'axios';
import { AuthResponse, Call, CreateCallRequest, LoginRequest } from '../types';
import { API_BASE_URL } from '../config/api';

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
    // Validate required fields
    const phoneNumber = callData.phone_number || callData.phoneNumber;
    const task = callData.task || callData.baseScript;
    
    if (!phoneNumber || !task) {
      throw new Error('Phone number and task/script are required');
    }

    // Convert legacy format to new format
    const payload = {
      phone_number: phoneNumber,
      task: task,
      voice: callData.voice || 'June',
      wait_for_greeting: callData.wait_for_greeting ?? false,
      record: callData.record ?? true,
      answered_by_enabled: callData.answered_by_enabled ?? true,
      noise_cancellation: callData.noise_cancellation ?? false,
      interruption_threshold: callData.interruption_threshold || 100,
      block_interruptions: callData.block_interruptions ?? false,
      max_duration: callData.max_duration || 12,
      model: callData.model || 'base',
      language: callData.language || 'en',
      background_track: callData.background_track || 'none',
      endpoint: callData.endpoint || 'https://api.bland.ai',
      voicemail_action: callData.voicemail_action || 'hangup',
      // Legacy fields for backward compatibility
      fromNumber: callData.fromNumber,
    };

    const response = await api.post('/calls', payload);
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

  getCallDetails: async (callId: number): Promise<any> => {
    const response = await api.get(`/calls/${callId}/details`);
    return response.data;
  },

  clearAllCalls: async (): Promise<{ message: string; deletedCount: number }> => {
    const response = await api.post('/calls/clear');
    return response.data;
  },

  syncWithBlandAi: async (): Promise<{ message: string; syncedCount: number; createdCount: number; updatedCount: number }> => {
    const response = await api.post('/calls/sync');
    return response.data;
  },
};

export default api;
