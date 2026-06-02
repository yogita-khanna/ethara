import React from 'react';
import { useOrder } from '../../hooks/useOrders';
import LoadingSpinner from '../common/LoadingSpinner';
import { formatCurrency, formatDate } from '../../utils/formatters';

const OrderDetail = ({ orderId }) => {
  const { data: order, isLoading, error } = useOrder(orderId);

  if (isLoading) return <div className="flex justify-center p-8"><LoadingSpinner /></div>;
  if (error) return <div className="text-red-500 p-4 text-center">Failed to load order details.</div>;
  if (!order) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 border-b pb-4">
        <div>
          <h4 className="text-sm text-gray-500 font-medium uppercase tracking-wider">Order Info</h4>
          <p className="mt-1 text-lg font-semibold">#{order.uid}</p>
          <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
          <span className="inline-block mt-2 px-2 py-1 text-xs font-semibold rounded-full capitalize bg-blue-100 text-blue-800">
            {order.status}
          </span>
        </div>
        <div>
          <h4 className="text-sm text-gray-500 font-medium uppercase tracking-wider">Customer</h4>
          <p className="mt-1 font-medium">{order.customer?.full_name}</p>
          <p className="text-sm text-gray-600">{order.customer?.email}</p>
          {order.customer?.phone && <p className="text-sm text-gray-600">{order.customer.phone}</p>}
        </div>
      </div>

      <div>
        <h4 className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-3">Items</h4>
        <div className="bg-gray-50 rounded-lg overflow-hidden border">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Product</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Qty</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Price</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {order.items.map((item) => (
                <tr key={item.uid}>
                  <td className="px-4 py-2 text-sm">
                    <div className="font-medium text-gray-900">{item.product?.name}</div>
                    <div className="text-xs text-gray-500">SKU: {item.product?.sku}</div>
                  </td>
                  <td className="px-4 py-2 text-sm text-right">{item.quantity}</td>
                  <td className="px-4 py-2 text-sm text-right">{formatCurrency(item.unit_price)}</td>
                  <td className="px-4 py-2 text-sm text-right font-medium">{formatCurrency(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan="3" className="px-4 py-3 text-right text-sm font-bold text-gray-900">Total Amount:</td>
                <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">{formatCurrency(order.total_amount)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {order.notes && (
        <div>
          <h4 className="text-sm text-gray-500 font-medium uppercase tracking-wider">Notes</h4>
          <p className="mt-1 text-sm text-gray-700 bg-yellow-50 p-3 rounded border border-yellow-100">
            {order.notes}
          </p>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;
