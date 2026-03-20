import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

export const churchAPI = {
  get: () => api.get('/church/'),
  create: (data) => api.post('/church/', data),
  update: (id, data) => api.put(`/church/${id}`, data),
  addService: (churchId, data) => api.post(`/church/${churchId}/services`, data),
  updateService: (id, data) => api.put(`/church/services/${id}`, data),
  deleteService: (id) => api.delete(`/church/services/${id}`),
}

export const membersAPI = {
  getAll: () => api.get('/members/'),
  get: (id) => api.get(`/members/${id}`),
  create: (data) => api.post('/members/', data),
  update: (id, data) => api.put(`/members/${id}`, data),
  delete: (id) => api.delete(`/members/${id}`),
  getFamilies: () => api.get('/members/families'),
  getFamily: (id) => api.get(`/members/families/${id}`),
  createFamily: (data) => api.post('/members/families', data),
  deleteFamily: (id) => api.delete(`/members/families/${id}`),
}

export const activitiesAPI = {
  getAll: (status) => api.get('/activities/', { params: status ? { status } : {} }),
  get: (id) => api.get(`/activities/${id}`),
  create: (data) => api.post('/activities/', data),
  update: (id, data) => api.put(`/activities/${id}`, data),
  delete: (id) => api.delete(`/activities/${id}`),
}

export const financeAPI = {
  getAll: (type) => api.get('/finance/', { params: type ? { type } : {} }),
  create: (data) => api.post('/finance/', data),
  update: (id, data) => api.put(`/finance/${id}`, data),
  delete: (id) => api.delete(`/finance/${id}`),
  summary: () => api.get('/finance/summary'),
}
