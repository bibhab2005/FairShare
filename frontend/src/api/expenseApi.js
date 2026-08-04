import api from './axiosInstance';

export const fetchExpenses = (groupId) => api.get(`/expenses/group/${groupId}`);
export const createExpense = (data) => api.post('/expenses', data);
export const deleteExpense = (id) => api.delete(`/expenses/${id}`);
export const createSettlement = (data) => api.post('/expenses/settle', data);
export const fetchBalances = (groupId) => api.get(`/balances/${groupId}`);
