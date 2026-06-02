import React from 'react';
import DataTable from '../common/DataTable';
import { Edit, Trash2 } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

const CustomerList = ({ data, loading, onEdit, onDelete, pagination }) => {
  const columns = [
    { header: 'Full Name', accessor: 'full_name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Phone', accessor: 'phone', cell: (row) => row.phone || '-' },
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
      emptyMessage="No customers found. Add one to get started."
    />
  );
};

export default CustomerList;
