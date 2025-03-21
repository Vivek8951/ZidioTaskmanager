import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (username, email, password) => {
    const response = await api.post('/auth/register', { username, email, password });
    return response.data;
  },
};

export const tasks = {
  getAll: async () => {
    const response = await api.get('/tasks');
    return response.data;
  },
  create: async (formData) => {
    const response = await api.post('/tasks', formData);
    return response.data;
  },
  update: async (id, formData) => {
    const response = await api.patch(`/tasks/${id}`, formData);
    return response.data;
  },
  delete: async (id) => {
    await api.delete(`/tasks/${id}`);
  },
  toggleComplete: async (id) => {
    const response = await api.patch(`/tasks/${id}/toggle`);
    return response.data;
  },
};

export default api;