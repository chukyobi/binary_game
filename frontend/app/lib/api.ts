import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Enable sending cookies with requests
});

export const gameApi = {
  getLevels: async () => {
    const response = await api.get('/game/levels');
    return response.data;
  },
  getQuestion: async (level: number) => {
    const response = await api.get(`/game/question/${level}`);
    return response.data;
  },

  answerQuestion: async (questionId: string, answer: string) => {
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
}; 