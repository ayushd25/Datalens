import { Router } from "express";
import { signup, login, logout, refreshToken, getMe, updateProfile } from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = Router();

// Strict rate limit ONLY on login and signup (public endpoints that can be brute-forced)
router.post("/signup", authLimiter, signup);
router.post("/login", authLimiter, login);

// These require a valid JWT — no need for strict rate limiting
router.post("/logout", authenticate, logout);
router.post("/refresh-token", refreshToken);
router.get("/me", authenticate, getMe);
router.put("/profile", authenticate, updateProfile);

export default router;