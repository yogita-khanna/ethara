import { create } from 'zustand';

const useStore = create((set) => ({
  isSidebarOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  
  isProductModalOpen: false,
  setProductModalOpen: (isOpen) => set({ isProductModalOpen: isOpen }),
  selectedProduct: null,
  setSelectedProduct: (product) => set({ selectedProduct: product }),
  
  isCustomerModalOpen: false,
  setCustomerModalOpen: (isOpen) => set({ isCustomerModalOpen: isOpen }),
  selectedCustomer: null,
  setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),

  isOrderModalOpen: false,
  setOrderModalOpen: (isOpen) => set({ isOrderModalOpen: isOpen }),
  
  confirmDialog: {
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  },
  openConfirmDialog: (title, message, onConfirm) => set({ 
    confirmDialog: { isOpen: true, title, message, onConfirm } 
  }),
  closeConfirmDialog: () => set((state) => ({ 
    confirmDialog: { ...state.confirmDialog, isOpen: false } 
  })),
}));

export default useStore;
