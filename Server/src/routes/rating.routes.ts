import { Router } from "express";
import { Role } from "@prisma/client";
import { getStoreRating, submitRating, updateRating } from "../controllers/rating.controller";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/role";
import { validateRequest } from "../middleware/validate";
import { ratingInputSchema } from "../validators/rating.validator";

// mergeParams: true allows accessing :storeId from parent router if nested
const router = Router({ mergeParams: true });

router.get("/:storeId/rating", getStoreRating);

router.post(
  "/:storeId/rating",
  requireAuth,
  requireRole(Role.NORMAL_USER),
  validateRequest(ratingInputSchema),
  submitRating
);

router.patch(
  "/:storeId/rating",
  requireAuth,
  requireRole(Role.NORMAL_USER),
  validateRequest(ratingInputSchema),
  updateRating
);

export default router;
