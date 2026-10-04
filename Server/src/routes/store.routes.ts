import { Router } from "express";
import { getStores, getStoreById } from "../controllers/store.controller";
import { validateRequest } from "../middleware/validate";
import { queryStoresSchema } from "../validators/store.validator";
import ratingRoutes from "./rating.routes";

const router = Router();

router.get("/", validateRequest(queryStoresSchema), getStores);
router.get("/:id", getStoreById);

router.use("/", ratingRoutes);

export default router;
