import api from '../../../core/api/axiosInstance';

export const createSettlement = (data) => api.post('/expenses/settle', data);
export const fetchMySettlements = () => api.get('/expenses/settlements/my');
