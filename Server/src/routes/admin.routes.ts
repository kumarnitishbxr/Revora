import { Router } from "express";
import { Role } from "@prisma/client";
import {
  getDashboard,
  getUsers,
  getUserById,
  createUser,
  getStores,
  createStore,
  updateStore,
  deleteStore,
} from "../controllers/admin.controller";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/role";
import { validateRequest } from "../middleware/validate";
import { adminCreateUserSchema } from "../validators/auth.validator";
import {
  createStoreSchema,
  updateStoreSchema,
  queryStoresSchema,
} from "../validators/store.validator";

const router = Router();

// Protect all admin endpoints with SYSTEM_ADMIN role
router.use(requireAuth, requireRole(Role.SYSTEM_ADMIN));

// Admin Dashboard
router.get("/dashboard", getDashboard);

// User Management
router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.post("/users", validateRequest(adminCreateUserSchema), createUser);

// Store Management
router.get("/stores", validateRequest(queryStoresSchema), getStores);
router.post("/stores", validateRequest(createStoreSchema), createStore);
router.patch("/stores/:id", validateRequest(updateStoreSchema), updateStore);
router.delete("/stores/:id", deleteStore);

export default router;
