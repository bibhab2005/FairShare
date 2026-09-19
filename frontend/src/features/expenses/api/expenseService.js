import api from '../../../core/api/axiosInstance';

export const fetchExpenses = (groupId) => api.get(`/expenses/group/${groupId}`);
export const createExpense = (data) => api.post('/expenses', data);
export const deleteExpense = (id) => api.delete(`/expenses/${id}`);
