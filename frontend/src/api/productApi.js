import axiosClient from './axiosClient';

export const productApi = {
  getProducts: async (params) => {
    return await axiosClient.get('/products/', { params });
  },
  getProduct: async (uid) => {
    return await axiosClient.get(`/products/${ uid }`);
  },
  createProduct: async (data) => {
    return await axiosClient.post('/products/', data);
  },
  updateProduct: async ({ uid, data }) => {
    return await axiosClient.put(`/products/${ uid }`, data);
  },
  deleteProduct: async (uid) => {
    return await axiosClient.delete(`/products/${ uid }`);
  }
};
