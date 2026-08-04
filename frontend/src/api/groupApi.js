import api from './axiosInstance';

export const fetchGroups = () => api.get('/groups');
export const fetchGroupById = (id) => api.get(`/groups/${id}`);
export const createGroup = (data) => api.post('/groups', data);
export const addMemberToGroup = (id, email) => api.post(`/groups/${id}/members`, { email });
