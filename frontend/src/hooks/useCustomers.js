import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerApi } from '../api/customerApi';
import toast from 'react-hot-toast';

export const useCustomers = (params) => {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: () => customerApi.getCustomers(params),
    keepPreviousData: true,
  });
};

export const useCustomer = (uid) => {
  return useQuery({
    queryKey: ['customer', uid],
    queryFn: () => customerApi.getCustomer(uid),
    enabled: !!uid,
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: customerApi.createCustomer,
    onSuccess: () => {
      toast.success('Customer created successfully');
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create customer');
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: customerApi.updateCustomer,
    onSuccess: () => {
      toast.success('Customer updated successfully');
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update customer');
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: customerApi.deleteCustomer,
    onSuccess: () => {
      toast.success('Customer deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete customer');
    },
  });
};
