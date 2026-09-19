import api from '../../../core/api/axiosInstance';

export const fetchBalances = (groupId) => api.get(`/balances/${groupId}`);
