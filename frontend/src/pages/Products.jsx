import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import useStore from '../store';
import ProductList from '../components/products/ProductList';
import ProductForm from '../components/products/ProductForm';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '../hooks/useProducts';

const Products = () => {
  const [page, setPage] = useState(0);
  const limit = 10;
  
  const { data: products, isLoading } = useProducts({ skip: page * limit, limit });
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  
  const { 
    isProductModalOpen, setProductModalOpen, 
    selectedProduct, setSelectedProduct,
    confirmDialog, openConfirmDialog, closeConfirmDialog
  } = useStore();

  const handleAdd = () => {
    setSelectedProduct(null);
    setProductModalOpen(true);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setProductModalOpen(true);
  };

  const handleDelete = (product) => {
    openConfirmDialog(
      'Delete Product',
      `Are you sure you want to delete ${product.name}? This action cannot be undone.`,
      async () => {
        await deleteProduct.mutateAsync(product.uid);
      }
    );
  };

  const onSubmit = async (data) => {
    if (selectedProduct) {
      await updateProduct.mutateAsync({ uid: selectedProduct.uid, data });
    } else {
      await createProduct.mutateAsync(data);
    }
    setProductModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Products</h1>
        <button
          onClick={handleAdd}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Product
        </button>
      </div>

      <ProductList 
        data={products} 
        loading={isLoading} 
        onEdit={handleEdit} 
        onDelete={handleDelete}
        pagination={{
          page,
          hasNext: products?.length === limit,
          onNext: () => setPage(p => p + 1),
          onPrev: () => setPage(p => Math.max(0, p - 1))
        }}
      />

      <Modal 
        isOpen={isProductModalOpen} 
        onClose={() => setProductModalOpen(false)}
        title={selectedProduct ? 'Edit Product' : 'Add Product'}
      >
        <ProductForm 
          defaultValues={selectedProduct} 
          onSubmit={onSubmit}
          isSubmitting={createProduct.isPending || updateProduct.isPending}
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

export default Products;
