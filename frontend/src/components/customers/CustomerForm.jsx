import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { customerSchema } from '../../utils/validators';

const CustomerForm = ({ defaultValues, onSubmit, isSubmitting }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(customerSchema),
    defaultValues: defaultValues || {
      full_name: '',
      email: '',
      phone: '',
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
        <label className="block text-sm font-medium text-gray-700">Full Name *</label>
        <input
          type="text"
          {...register('full_name')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
        />
        {errors.full_name && <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Email *</label>
        <input
          type="email"
          {...register('email')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Phone</label>
        <input
          type="text"
          placeholder="+1234567890"
          {...register('phone')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
        />
        {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
      </div>

      <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none sm:col-start-2 sm:text-sm disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Customer'}
        </button>
      </div>
    </form>
  );
};

export default CustomerForm;
