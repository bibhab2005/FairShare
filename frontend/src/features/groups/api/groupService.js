import api from '../../../core/api/axiosInstance';

export const fetchGroups = () => api.get('/groups');
export const fetchGroupById = (id) => api.get(`/groups/${id}`);
export const createGroup = (data) => api.post('/groups', data);
export const addMemberToGroup = (id, email) => api.post(`/groups/${id}/members`, { email });
export const removeMemberFromGroup = (id, memberId) => api.delete(`/groups/${id}/members/${memberId}`);
export const updateGroup = (id, data) => api.put(`/groups/${id}`, data);
export const deleteGroup = (id) => api.delete(`/groups/${id}`);
export const getGroupInviteInfo = (id) => api.get(`/groups/${id}/invite-info`);
export const joinGroupViaLink = (id) => api.post(`/groups/${id}/join`);
