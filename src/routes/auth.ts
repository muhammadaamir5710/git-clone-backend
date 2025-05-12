import express from "express";
import {
  register,
  login,
  logout,
  getCurrentUser,
} from "../controllers/authController";
import { authenticate } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";

const router = express.Router();

router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.post("/logout", asyncHandler(logout));
router.get("/me", authenticate, asyncHandler(getCurrentUser));

export default router;
