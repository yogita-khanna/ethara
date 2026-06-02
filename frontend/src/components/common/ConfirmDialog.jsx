import React, { useState } from 'react';
import Modal from './Modal';

const ConfirmDialog = ({ isOpen, onClose, title, message, onConfirm }) => {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm();
    } finally {
      setIsConfirming(false);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="text-gray-700 mb-6">
        {message}
      </div>
      <div className="flex justify-end space-x-3 border-t pt-4">
        <button
          onClick={onClose}
          disabled={isConfirming}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={isConfirming}
          className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none flex items-center"
        >
          {isConfirming ? (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : 'Confirm'}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
