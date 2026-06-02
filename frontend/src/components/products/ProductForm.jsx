import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema } from '../../utils/validators';

const ProductForm = ({ defaultValues, onSubmit, isSubmitting }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: defaultValues || {
      name: '',
      sku: '',
      description: '',
      price: 0,
      quantity: 0,
    }
  });

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Name *</label>
        <input
          type="text"
          {...register('name')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">SKU *</label>
        <input
          type="text"
          {...register('sku')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 uppercase"
        />
        {errors.sku && <p className="mt-1 text-sm text-red-600">{errors.sku.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          {...register('description')}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
        />
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Price *</label>
          <div className="relative mt-1 rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              step="0.01"
              {...register('price')}
              className="block w-full rounded-md border-gray-300 pl-7 focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
            />
          </div>
          {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Quantity *</label>
          <input
            type="number"
            {...register('quantity')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
          />
          {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>}
        </div>
      </div>

      <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none sm:col-start-2 sm:text-sm disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Product'}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
