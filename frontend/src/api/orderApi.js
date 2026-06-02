import axiosClient from './axiosClient';

export const orderApi = {
  getOrders: async (params) => {
    return await axiosClient.get('/orders/', { params });
  },
  getOrder: async (uid) => {
    return await axiosClient.get(`/orders/${ uid }`);
  },
  createOrder: async (data) => {
    return await axiosClient.post('/orders/', data);
  },
  deleteOrder: async (uid) => {
    return await axiosClient.delete(`/orders/${ uid }`);
  }
};
