import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi } from '../api/productApi';
import toast from 'react-hot-toast';

export const useProducts = (params) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productApi.getProducts(params),
    keepPreviousData: true,
  });
};

export const useProduct = (uid) => {
  return useQuery({
    queryKey: ['product', uid],
    queryFn: () => productApi.getProduct(uid),
    enabled: !!uid,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: productApi.createProduct,
    onSuccess: () => {
      toast.success('Product created successfully');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create product');
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: productApi.updateProduct,
    onSuccess: () => {
      toast.success('Product updated successfully');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update product');
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: productApi.deleteProduct,
    onSuccess: () => {
      toast.success('Product deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete product');
    },
  });
};
