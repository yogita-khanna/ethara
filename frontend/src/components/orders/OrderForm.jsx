import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { orderSchema } from '../../utils/validators';
import { useProducts } from '../../hooks/useProducts';
import { useCustomers } from '../../hooks/useCustomers';
import { formatCurrency } from '../../utils/formatters';
import { Plus, Trash2 } from 'lucide-react';

const OrderForm = ({ onSubmit, isSubmitting }) => {
  const [step, setStep] = useState(1);
  
  const { data: products = [] } = useProducts({ limit: 1000 });
  const { data: customers = [] } = useCustomers({ limit: 1000 });

  const { register, control, handleSubmit, watch, formState: { errors }, trigger } = useForm({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customer_uid: '',
      notes: '',
      items: [{ product_uid: '', quantity: 1 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  const watchItems = watch("items");

  const calculateTotal = () => {
    return watchItems.reduce((total, item) => {
      const product = products.find(p => p.uid === item.product_uid);
      if (product && item.quantity) {
        return total + (product.price * parseInt(item.quantity));
      }
      return total;
    }, 0);
  };

  const nextStep = async () => {
    if (step === 1) {
      const isValid = await trigger('customer_uid');
      if (isValid) setStep(2);
    } else if (step === 2) {
      const isValid = await trigger('items');
      if (isValid) setStep(3);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <div className="flex items-center justify-center space-x-4 mb-6">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>1</div>
        <div className={`h-1 w-12 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>2</div>
        <div className={`h-1 w-12 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>3</div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1: Customer Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <h4 className="font-medium text-lg">Select Customer</h4>
            <div>
              <label className="block text-sm font-medium text-gray-700">Customer *</label>
              <select
                {...register('customer_uid')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 bg-white"
              >
                <option value="">Select a customer...</option>
                {customers.map(c => (
                  <option key={c.uid} value={c.uid}>{c.full_name} ({c.email})</option>
                ))}
              </select>
              {errors.customer_uid && <p className="mt-1 text-sm text-red-600">{errors.customer_uid.message}</p>}
            </div>
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={nextStep}
                className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Order Items */}
        {step === 2 && (
          <div className="space-y-4">
            <h4 className="font-medium text-lg">Add Products</h4>
            
            {fields.map((field, index) => (
              <div key={field.uid} className="flex gap-4 items-start border p-4 rounded bg-gray-50">
                <div className="flex-grow">
                  <label className="block text-xs font-medium text-gray-700">Product</label>
                  <select
                    {...register(`items.${index}.product_uid`)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 bg-white"
                  >
                    <option value="">Select product...</option>
                    {products.map(p => (
                      <option key={p.uid} value={p.uid} disabled={p.quantity <= 0}>
                        {p.name} - {formatCurrency(p.price)} (Stock: {p.quantity})
                      </option>
                    ))}
                  </select>
                  {errors?.items?.[index]?.product_uid && <p className="mt-1 text-xs text-red-600">{errors.items[index].product_uid.message}</p>}
                </div>
                
                <div className="w-24">
                  <label className="block text-xs font-medium text-gray-700">Qty</label>
                  <input
                    type="number"
                    min="1"
                    {...register(`items.${index}.quantity`)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                  />
                  {errors?.items?.[index]?.quantity && <p className="mt-1 text-xs text-red-600">{errors.items[index].quantity.message}</p>}
                </div>
                
                <div className="pt-6">
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-red-500 hover:text-red-700 p-1"
                    disabled={fields.length === 1}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
            
            {errors.items && !Array.isArray(errors.items) && <p className="text-sm text-red-600">{errors.items.message}</p>}

            <button
              type="button"
              onClick={() => append({ product_uid: '', quantity: 1 })}
              className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Another Product
            </button>
            
            <div className="text-right font-bold text-lg pt-4">
              Estimated Total: {formatCurrency(calculateTotal())}
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={prevStep}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded shadow hover:bg-gray-300"
              >
                Back
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
              >
                Review Order
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-4">
            <h4 className="font-medium text-lg">Review & Submit</h4>
            
            <div className="bg-gray-50 p-4 rounded border space-y-2">
              <p><strong>Customer:</strong> {customers.find(c => c.uid === watch("customer_uid"))?.full_name}</p>
              
              <div className="mt-4">
                <strong>Items:</strong>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  {watchItems.map((item, idx) => {
                    const p = products.find(prod => prod.uid === item.product_uid);
                    return p ? (
                      <li key={idx}>
                        {p.name} (x{item.quantity}) - {formatCurrency(p.price * item.quantity)}
                      </li>
                    ) : null;
                  })}
                </ul>
              </div>
              
              <div className="mt-4 pt-4 border-t text-xl font-bold">
                Total Amount: {formatCurrency(calculateTotal())}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Order Notes (Optional)</label>
              <textarea
                {...register('notes')}
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                placeholder="Any special instructions..."
              />
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={prevStep}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded shadow hover:bg-gray-300"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-green-600 text-white px-6 py-2 rounded shadow hover:bg-green-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Order'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default OrderForm;
