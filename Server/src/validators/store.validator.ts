import { z } from "zod";

export const createStoreSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, "Store name must be at least 2 characters").max(100),
    email: z.string().trim().toLowerCase().email("Invalid store email address"),
    address: z.string().trim().min(1, "Address is required").max(400),
    ownerId: z.number().int().positive("A valid store owner ID is required").optional(),
  }),
});

export const updateStoreSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, "Store name must be at least 2 characters").max(100).optional(),
    email: z.string().trim().toLowerCase().email("Invalid store email address").optional(),
    address: z.string().trim().min(1).max(400).optional(),
    ownerId: z.number().int().positive().optional(),
  }),
});

export const queryStoresSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    address: z.string().optional(),
    name: z.string().optional(),
    sortBy: z
      .enum(["name", "email", "address", "createdAt", "rating"])
      .optional()
      .default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  }),
});

export type CreateStoreInput = z.infer<typeof createStoreSchema>["body"];
export type UpdateStoreInput = z.infer<typeof updateStoreSchema>["body"];
