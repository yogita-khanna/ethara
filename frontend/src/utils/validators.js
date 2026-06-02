import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(200, "Name cannot exceed 200 characters"),
  sku: z.string().min(3, "SKU must be at least 3 characters").max(100, "SKU cannot exceed 100 characters").regex(/^[A-Za-z0-9\-]+$/, "SKU must only contain alphanumeric characters and hyphens").transform(v => v.toUpperCase()),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  quantity: z.coerce.number().int().min(0, "Quantity cannot be negative")
});

export const customerSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters").max(200),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Phone number must be in E.164 format (e.g. +1234567890)").optional().or(z.literal(''))
});

export const orderItemSchema = z.object({
  product_uid: z.string().min(1, "Product is required"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1")
});

export const orderSchema = z.object({
  customer_uid: z.string().min(1, "Customer is required"),
  notes: z.string().optional(),
  items: z.array(orderItemSchema).min(1, "At least one item is required")
});
