import { z } from "zod";

// Backend API Response Schemas
export const BackendCartItemSchema = z.object({
  key: z.string().optional(), // FIXED: Made optional since backend might not always provide it
  product_id: z.string(),
  name: z.string().optional().default("Unknown Product"), // FIXED: Made optional with default
  model: z.string().optional(),
  quantity: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? parseInt(val, 10) : val)),
  price: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? parseFloat(val) : val)),
  total: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? parseFloat(val) : val)),
  // FIXED: Added all possible image field names from backend
  image: z.string().optional(),
  thumb: z.string().optional(),
  product_image: z.string().optional(),
  img: z.string().optional(),
  thumbnail: z.string().optional(),
  option: z.array(z.any()).optional()
});

export const BackendCartResponseSchema = z.object({
  success: z
    .union([z.boolean(), z.number()])
    .transform((val) => (typeof val === "number" ? val === 1 : val)), // FIXED: Handle success as number (1/0) or boolean
  data: z
    .object({
      products: z.array(BackendCartItemSchema).optional().default([]),
      total: z
        .union([z.string(), z.number()])
        .optional()
        .transform((val) => {
          if (!val) return 0;
          return typeof val === "string" ? parseFloat(val) : val;
        }),
      vouchers: z.array(z.any()).optional(),
      totals: z
        .array(
          z.object({
            title: z.string(),
            text: z.string(),
            value: z.union([z.string(), z.number()])
          })
        )
        .optional()
    })
    .optional(),
  error: z.array(z.string()).optional().default([]) // FIXED: Added default empty array
});

// Frontend Cart Item Schema
export const CartItemSchema = z.object({
  id: z.string(),
  key: z.string(), // Backend cart key for updates/removal
  product_id: z.string(),
  name: z.string(),
  price: z.number(),
  image: z.string(), // Always required in frontend (fallback to placeholder)
  quantity: z.number().positive(), // FIXED: Ensure quantity is always positive
  total: z.number(),
  model: z.string().optional()
});

// Add to Cart Request
export const AddToCartRequestSchema = z.object({
  product_id: z.string(),
  quantity: z.string()
});

// Update Cart Request
export const UpdateCartRequestSchema = z.object({
  key: z.string(),
  quantity: z.string()
});

// Remove Cart Item Request
export const RemoveCartItemRequestSchema = z.object({
  key: z.string()
});

// Type Exports
export type BackendCartItem = z.infer<typeof BackendCartItemSchema>;
export type BackendCartResponse = z.infer<typeof BackendCartResponseSchema>;
export type CartItem = z.infer<typeof CartItemSchema>;
export type AddToCartRequest = z.infer<typeof AddToCartRequestSchema>;
export type UpdateCartRequest = z.infer<typeof UpdateCartRequestSchema>;
export type RemoveCartItemRequest = z.infer<typeof RemoveCartItemRequestSchema>;
