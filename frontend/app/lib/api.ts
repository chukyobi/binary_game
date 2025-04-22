import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// Helper to simplify API calls
const extractData = <T>(response: { data: T }) => response.data;

// --------- Auth API ---------
export const authApi = {
  login: (username: string) => api.post('/auth/login', { username }).then(extractData),
  register: (username: string) => api.post('/auth/register', { username }).then(extractData),
  logout: () => api.post('/auth/logout').then(extractData),
  checkAuth: () => api.get('/auth/me').then(extractData),
};

// --------- Game API ---------
export const gameApi = {
  getLevels: () => api.get('/game/levels').then(extractData),

  getQuestion: async (level: number) => {
    try {
      const response = await api.get(`/game/question/${level}`);
      return response.data;
    } catch (error: any) {
      console.error('Error in getQuestion:', error);
      throw error;
    }
  },

  submitAnswer: (questionId: string, answer: string) =>
    api.post('/game/answer', { questionId, answer }).then(extractData),

  updateScore: (score: number, level: number) =>
    api.post('/game/score', { score, level }).then(extractData),

  getAssets: () => api.get('/game/assets').then(extractData),

  getTip: (questionId: string) =>
    api.get(`/game/tip/${questionId}`).then(extractData),
};

// --------- User API ---------
export const userApi = {
  getProfile: (userId: string) => api.get(`/user/${userId}`).then(extractData),

  updateProfile: (userId: string, data: { username?: string; email?: string }) =>
    api.put(`/user/${userId}`, data).then(extractData),

  getLeaderboard: () => api.get('/user/leaderboard').then(extractData),
};

export default api;
