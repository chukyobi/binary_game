import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authApi = {
  login: async (username: string) => {
    const response = await api.post('/auth/login', { username });
    return response.data;
  },
  register: async (username: string) => {
    const response = await api.post('/auth/register', { username });
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

// Game API endpoints
export const gameApi = {
  getLevels: async () => {
    const response = await api.get('/game/levels');
    return response.data;
  },
  getQuestion: async (level: number) => {
    try {
      console.log('Making request to:', `/game/question/${level}`);
      const response = await api.get(`/game/question/${level}`);
      console.log('Response received:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error in getQuestion:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      }
      throw error;
    }
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

// User API endpoints
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