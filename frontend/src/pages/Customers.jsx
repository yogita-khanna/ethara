import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import useStore from '../store';
import CustomerList from '../components/customers/CustomerList';
import CustomerForm from '../components/customers/CustomerForm';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from '../hooks/useCustomers';

const Customers = () => {
  const [page, setPage] = useState(0);
  const limit = 10;
  
  const { data: customers, isLoading } = useCustomers({ skip: page * limit, limit });
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();
  
  const { 
    isCustomerModalOpen, setCustomerModalOpen, 
    selectedCustomer, setSelectedCustomer,
    confirmDialog, openConfirmDialog, closeConfirmDialog
  } = useStore();

  const handleAdd = () => {
    setSelectedCustomer(null);
    setCustomerModalOpen(true);
  };

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setCustomerModalOpen(true);
  };

  const handleDelete = (customer) => {
    openConfirmDialog(
      'Delete Customer',
      `Are you sure you want to delete ${customer.full_name}? This action cannot be undone.`,
      async () => {
        await deleteCustomer.mutateAsync(customer.uid);
      }
    );
  };

  const onSubmit = async (data) => {
    if (selectedCustomer) {
      await updateCustomer.mutateAsync({ uid: selectedCustomer.uid, data });
    } else {
      await createCustomer.mutateAsync(data);
    }
    setCustomerModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
        <button
          onClick={handleAdd}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Customer
        </button>
      </div>

      <CustomerList 
        data={customers} 
        loading={isLoading} 
        onEdit={handleEdit} 
        onDelete={handleDelete}
        pagination={{
          page,
          hasNext: customers?.length === limit,
          onNext: () => setPage(p => p + 1),
          onPrev: () => setPage(p => Math.max(0, p - 1))
        }}
      />

      <Modal 
        isOpen={isCustomerModalOpen} 
        onClose={() => setCustomerModalOpen(false)}
        title={selectedCustomer ? 'Edit Customer' : 'Add Customer'}
      >
        <CustomerForm 
          defaultValues={selectedCustomer} 
          onSubmit={onSubmit}
          isSubmitting={createCustomer.isPending || updateCustomer.isPending}
        />
      </Modal>

      <ConfirmDialog 
        isOpen={confirmDialog.isOpen}
        onClose={closeConfirmDialog}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
      />
    </div>
  );
};

export default Customers;
