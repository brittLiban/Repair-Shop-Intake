import axios from 'axios';

const api = axios.create({ baseURL: '/api', withCredentials: true });

// Auto-logout on expired or invalid session
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('grc-user');
      if (window.location.pathname.startsWith('/staff') && !window.location.pathname.includes('login')) {
        window.location.replace('/staff/login');
      }
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  login:  (data) => api.post('/auth/login', data),
  logout: ()     => api.post('/auth/logout'),
  me:     ()     => api.get('/auth/me'),
};

export const ticketsApi = {
  intake:           (data)         => api.post('/tickets/intake', data),
  lookupByNumber:   (ticketNumber) => api.get(`/tickets/status/${ticketNumber}`),
  lookupByEmail:    (email)        => api.post('/tickets/find-by-email', { email }),
  lookupByNamePhone:(name, phone)  => api.post('/tickets/find-by-name-phone', { name, phone }),
};

export const staffApi = {
  listTickets: (params) => api.get('/staff/tickets', { params }),
  getTicket:   (id)     => api.get(`/staff/tickets/${id}`),
  updateTicket:(id, data) => api.patch(`/staff/tickets/${id}`, data),
  submitForm:  (id, data) => api.post(`/staff/tickets/${id}/forms`, data),
};
