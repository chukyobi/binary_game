import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const useApi = () => {
  const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const get = async <T>(url: string): Promise<T> => {
    try {
      const response = await api.get<T>(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const post = async <T>(url: string, data?: any): Promise<T> => {
    try {
      const response = await api.post<T>(url, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const put = async <T>(url: string, data?: any): Promise<T> => {
    try {
      const response = await api.put<T>(url, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const del = async <T>(url: string): Promise<T> => {
    try {
      const response = await api.delete<T>(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  return { get, post, put, del };
}; 