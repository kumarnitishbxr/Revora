import { z } from "zod";
import { Role } from "@prisma/client";

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(20, "Name must be at least 20 characters")
      .max(60, "Name must not exceed 60 characters"),
    email: z.string().trim().toLowerCase().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(16, "Password must not exceed 16 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),
    address: z
      .string()
      .trim()
      .min(1, "Address is required")
      .max(400, "Address must not exceed 400 characters"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .max(16, "New password must not exceed 16 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),
  }),
});

export const adminCreateUserSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(20, "Name must be at least 20 characters")
      .max(60, "Name must not exceed 60 characters"),
    email: z.string().trim().toLowerCase().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(16, "Password must not exceed 16 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),
    address: z
      .string()
      .trim()
      .min(1, "Address is required")
      .max(400, "Address must not exceed 400 characters"),
    role: z.enum([Role.NORMAL_USER, Role.SYSTEM_ADMIN, Role.STORE_OWNER]).default(Role.NORMAL_USER),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>["body"];
export type AdminCreateUserInput = z.infer<typeof adminCreateUserSchema>["body"];
