import express from "express";
import { verifyToken } from "../middlewares/auth.js";
import {
    signUp,
    signIn,
    forgotPassword,
    checkResetCode,
    resetPassword,
    refreshToken,
    updateProfile,
    getMe,
    logout,
    deleteUser
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/sign-up", signUp);
router.post("/sign-in", signIn);
router.post("/forgot-password", forgotPassword);
router.post("/check-reset-code", checkResetCode);
router.post("/reset-password", resetPassword);
router.post("/refresh-token", refreshToken);

router.put("/update-profile", verifyToken, updateProfile);
router.post("/logout", verifyToken, logout);
router.get("/me", verifyToken, getMe);
router.delete("/delete", verifyToken, deleteUser);

export default router;
