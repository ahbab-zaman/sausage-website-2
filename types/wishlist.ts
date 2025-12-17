import { z } from "zod";

// Backend API Response Schemas
export const BackendWishlistItemSchema = z.object({
  product_id: z.string(),
  cart_quantity: z.number(),
  quantity: z.string(),
  manufacturer: z.string(),
  manufacturer_id: z.number(),
  thumb: z.string(),
  name: z.string(),
  model: z.string(),
  label: z.string(),
  label_image: z.string(),
  stock: z.string(),
  price: z.string(),
  special: z.string(),
  weight: z.string(),
  weight_class: z.string()
});

export const BackendWishlistResponseSchema = z.object({
  success: z.number(),
  error: z.array(z.string()),
  data: z.array(BackendWishlistItemSchema)
});

// Frontend Wishlist Item Schema
export const WishlistItemSchema = z.object({
  product_id: z.string(),
  name: z.string(),
  price: z.number(),
  image: z.string(),
  model: z.string().optional(),
  description: z.string(),
  quantity: z.string(),
  price_formated: z.string()
});

// Add/Remove Request
export const WishlistRequestSchema = z.object({
  product_id: z.string()
});

// Type Exports
export type BackendWishlistItem = z.infer<typeof BackendWishlistItemSchema>;
export type BackendWishlistResponse = z.infer<typeof BackendWishlistResponseSchema>;
export type WishlistItem = z.infer<typeof WishlistItemSchema>;
export type WishlistRequest = z.infer<typeof WishlistRequestSchema>;
