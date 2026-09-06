import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import adminMiddleware from "../middlewares/admin.middleware.js";
import {
    createPrivateDriver,
    getPrivateDrivers,
    updatePrivateDriver,
    deletePrivateDriver,
    updateDriverLocation,
    updatePrivateDriverStatus,
    getCurrentBooking,
    updateMyProfile,
    getPendingBookings,
} from "../controllers/privateDriver.controller.js";
const router = express.Router();

// =========================
// Private Driver Mobile APIs
// =========================

router.put(
    "/status",
    authMiddleware,
    updatePrivateDriverStatus
);

router.put(
    "/location",
    authMiddleware,
    updateDriverLocation
);

router.get(
    "/current-booking",
    authMiddleware,
    getCurrentBooking
);

router.get(
    "/pending",
    authMiddleware,
    getPendingBookings
);

router.put(
    "/profile",
    authMiddleware,
    updateMyProfile
);

// =========================
// Admin APIs
// =========================

router.use(authMiddleware, adminMiddleware);

router.post("/", createPrivateDriver);

router.get("/", getPrivateDrivers);

router.put("/:id", updatePrivateDriver);

router.delete("/:id", deletePrivateDriver);

export default router;



