import React from 'react';
import DataTable from '../common/DataTable';
import { Edit, Trash2 } from 'lucide-react';
import { formatCurrency, formatStock } from '../../utils/formatters';
import { clsx } from 'clsx';

const ProductList = ({ data, loading, onEdit, onDelete, pagination }) => {
  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'SKU', accessor: 'sku' },
    { 
      header: 'Price', 
      accessor: 'price',
      cell: (row) => formatCurrency(row.price)
    },
    { header: 'Quantity', accessor: 'quantity' },
    {
      header: 'Stock Status',
      cell: (row) => {
        const status = formatStock(row.quantity);
        return (
          <span className={clsx(
            "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
            status === 'In Stock' ? "bg-green-100 text-green-800" : 
            status === 'Low Stock' ? "bg-yellow-100 text-yellow-800" : 
            "bg-red-100 text-red-800"
          )}>
            {status}
          </span>
        );
      }
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(row)}
            className="text-blue-600 hover:text-blue-900"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(row)}
            className="text-red-600 hover:text-red-900"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
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
      emptyMessage="No products found. Add one to get started."
    />
  );
};

export default ProductList;
