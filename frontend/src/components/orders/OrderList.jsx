import React from 'react';
import DataTable from '../common/DataTable';
import { Eye, Trash2 } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { clsx } from 'clsx';

const OrderList = ({ data, loading, onView, onDelete, pagination }) => {
  const columns = [
    { header: 'Order ID', accessor: 'uid', cell: (row) => `#${row.uid}` },
    { header: 'Customer', accessor: 'customer', cell: (row) => row.customer?.full_name || 'Unknown' },
    { 
      header: 'Total', 
      accessor: 'total_amount',
      cell: (row) => formatCurrency(row.total_amount)
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => {
        const colors = {
          pending: 'bg-yellow-100 text-yellow-800',
          confirmed: 'bg-blue-100 text-blue-800',
          shipped: 'bg-indigo-100 text-indigo-800',
          delivered: 'bg-green-100 text-green-800',
          cancelled: 'bg-red-100 text-red-800',
        };
        return (
          <span className={clsx("px-2 py-1 text-xs font-semibold rounded-full capitalize", colors[row.status] || 'bg-gray-100 text-gray-800')}>
            {row.status}
          </span>
        );
      }
    },
    { 
      header: 'Created', 
      accessor: 'created_at',
      cell: (row) => formatDate(row.created_at)
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => onView(row)}
            className="text-blue-600 hover:text-blue-900"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          {(row.status === 'pending' || row.status === 'cancelled') && (
            <button
              onClick={() => onDelete(row)}
              className="text-red-600 hover:text-red-900"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <DataTable 
      columns={columns} 
      data={data} 
      loading={loading} 
      pagination={pagination}
      emptyMessage="No orders found. Create one to get started."
    />
  );
};

export default OrderList;
