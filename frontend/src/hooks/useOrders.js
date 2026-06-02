import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi } from '../api/orderApi';
import toast from 'react-hot-toast';

export const useOrders = (params) => {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => orderApi.getOrders(params),
    keepPreviousData: true,
  });
};

export const useOrder = (uid) => {
  return useQuery({
    queryKey: ['order', uid],
    queryFn: () => orderApi.getOrder(uid),
    enabled: !!uid,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: orderApi.createOrder,
    onSuccess: () => {
      toast.success('Order created successfully');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create order');
    },
  });
};

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: orderApi.deleteOrder,
    onSuccess: () => {
      toast.success('Order deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete order');
    },
  });
};
