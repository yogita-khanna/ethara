import axiosClient from './axiosClient';

export const customerApi = {
  getCustomers: async (params) => {
    return await axiosClient.get('/customers/', { params });
  },
  getCustomer: async (uid) => {
    return await axiosClient.get(`/customers/${ uid }`);
  },
  createCustomer: async (data) => {
    return await axiosClient.post('/customers/', data);
  },
  updateCustomer: async ({ uid, data }) => {
    return await axiosClient.put(`/customers/${ uid }`, data);
  },
  deleteCustomer: async (uid) => {
    return await axiosClient.delete(`/customers/${ uid }`);
  }
};
