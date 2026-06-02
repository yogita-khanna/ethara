import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import useStore from '../store';
import OrderList from '../components/orders/OrderList';
import OrderForm from '../components/orders/OrderForm';
import OrderDetail from '../components/orders/OrderDetail';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useOrders, useCreateOrder, useDeleteOrder } from '../hooks/useOrders';

const Orders = () => {
  const [page, setPage] = useState(0);
  const limit = 10;
  const [viewOrderId, setViewOrderId] = useState(null);
  
  const { data: orders, isLoading } = useOrders({ skip: page * limit, limit });
  const createOrder = useCreateOrder();
  const deleteOrder = useDeleteOrder();
  
  const { 
    isOrderModalOpen, setOrderModalOpen, 
    confirmDialog, openConfirmDialog, closeConfirmDialog
  } = useStore();

  const handleAdd = () => {
    setOrderModalOpen(true);
  };

  const handleView = (order) => {
    setViewOrderId(order.uid);
  };

  const handleDelete = (order) => {
    openConfirmDialog(
      'Delete Order',
      `Are you sure you want to delete order #${order.uid}? This will restore the inventory stock.`,
      async () => {
        await deleteOrder.mutateAsync(order.uid);
      }
    );
  };

  const onSubmit = async (data) => {
    await createOrder.mutateAsync(data);
    setOrderModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
        <button
          onClick={handleAdd}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Order
        </button>
      </div>

      <OrderList 
        data={orders} 
        loading={isLoading} 
        onView={handleView} 
        onDelete={handleDelete}
        pagination={{
          page,
          hasNext: orders?.length === limit,
          onNext: () => setPage(p => p + 1),
          onPrev: () => setPage(p => Math.max(0, p - 1))
        }}
      />

      {/* Create Order Modal */}
      <Modal 
        isOpen={isOrderModalOpen} 
        onClose={() => setOrderModalOpen(false)}
        title="Create New Order"
      >
        <OrderForm 
          onSubmit={onSubmit}
          isSubmitting={createOrder.isPending}
        />
      </Modal>

      {/* View Order Detail Modal */}
      <Modal 
        isOpen={!!viewOrderId} 
        onClose={() => setViewOrderId(null)}
        title="Order Details"
      >
        {viewOrderId && <OrderDetail orderId={viewOrderId} />}
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

export default Orders;
