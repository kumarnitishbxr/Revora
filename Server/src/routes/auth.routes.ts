import { Router } from "express";
import { register, login, logout, getMe, changePassword } from "../controllers/auth.controller";
import { validateRequest } from "../middleware/validate";
import { requireAuth } from "../middleware/auth";
import { registerSchema, loginSchema, changePasswordSchema } from "../validators/auth.validator";

const router = Router();

router.post("/register", validateRequest(registerSchema), register);
router.post("/login", validateRequest(loginSchema), login);
router.post("/logout", logout);
router.get("/me", requireAuth, getMe);
router.patch("/password", requireAuth, validateRequest(changePasswordSchema), changePassword);

export default router;
