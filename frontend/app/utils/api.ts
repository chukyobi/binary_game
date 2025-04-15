import axios from 'axios';
import { API_BASE_URL } from './constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
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

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle specific error status codes
      switch (error.response.status) {
        case 401:
          // Handle unauthorized access
          localStorage.removeItem('token');
          window.location.href = '/auth';
          break;
        case 403:
          // Handle forbidden access
          console.error('Forbidden access');
          break;
        case 404:
          // Handle not found
          console.error('Resource not found');
          break;
        case 500:
          // Handle server error
          console.error('Server error');
          break;
        default:
          console.error('An error occurred');
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (email: string) => {
    const response = await api.post('/auth/login', { email });
    return response.data;
  },
  register: async (email: string, username: string) => {
    const response = await api.post('/auth/register', { email, username });
    return response.data;
  },
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
  checkAuth: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

export const gameApi = {
  getLevels: async () => {
    const response = await api.get('/game/levels');
    return response.data;
  },
  getQuestion: async (level: number) => {
    const response = await api.get(`/game/question?level=${level}`);
    return response.data;
  },
  submitAnswer: async (questionId: string, answer: string) => {
    const response = await api.post('/game/answer', { questionId, answer });
    return response.data;
  },
  updateScore: async (score: number, level: number) => {
    const response = await api.post('/game/score', { score, level });
    return response.data;
  },
  getAssets: async () => {
    const response = await api.get('/game/assets');
    return response.data;
  },
  getTip: async (questionId: string) => {
    const response = await api.get(`/game/tip/${questionId}`);
    return response.data;
  },
};

export const userApi = {
  getProfile: async (userId: string) => {
    const response = await api.get(`/user/${userId}`);
    return response.data;
  },
  updateProfile: async (userId: string, data: { username?: string; email?: string }) => {
    const response = await api.put(`/user/${userId}`, data);
    return response.data;
  },
  getLeaderboard: async () => {
    const response = await api.get('/user/leaderboard');
    return response.data;
  },
};

export default api; 