import { Router } from "express";
import { body } from "express-validator";
import {
  register,
  login,
  logout,
  checkAuth,
} from "../controllers/authController";

const router = Router();

// Validation middleware
const registerValidation = [
  body("email").isEmail().withMessage("Invalid email format").normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

const loginValidation = [
  body("email").isEmail().withMessage("Invalid email format").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

//auth routes
router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.post("/logout", logout);
router.get("/check", checkAuth);

export default router;
