import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('grc-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

export const ticketsApi = {
  intake: (data) => api.post('/tickets/intake', data),
  list: () => api.get('/tickets'),
  get: (id) => api.get(`/tickets/${id}`),
};

export const staffApi = {
  listTickets: (params) => api.get('/staff/tickets', { params }),
  getTicket: (id) => api.get(`/staff/tickets/${id}`),
  updateTicket: (id, data) => api.patch(`/staff/tickets/${id}`, data),
  submitForm: (id, data) => api.post(`/staff/tickets/${id}/forms`, data),
};
