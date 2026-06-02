import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const DataTable = ({ columns, data, loading, emptyMessage = "No data available", pagination }) => {
  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 bg-white rounded-lg shadow">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, rowIdx) => (
              <tr key={row.uid || rowIdx} className="hover:bg-gray-50">
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {col.cell ? col.cell(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {pagination && (
        <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 bg-white">
          <div className="text-sm text-gray-700">
            Page <span className="font-medium">{pagination.page + 1}</span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={pagination.onPrev}
              disabled={pagination.page === 0}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={pagination.onNext}
              disabled={!pagination.hasNext}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 hover:bg-gray-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
