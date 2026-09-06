import { Router } from "express";
import {

  createAmbulance,

  deleteAmbulance,

  getAmbulanceById,

  getAmbulances,

  updateAmbulance,

  updateDriverStatus,

  updateDriverLocation,

  getCurrentEmergency,

  getDriverHistory,
  updateMyProfile,
  getPendingEmergencies,

} from "../controllers/ambulance.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import adminMiddleware from "../middlewares/admin.middleware.js";

const router = Router();

router.get("/", authMiddleware, adminMiddleware, getAmbulances);

router.put(
  "/status",
  authMiddleware,
  updateDriverStatus
);

router.put(
  "/location",
  authMiddleware,
  updateDriverLocation
);

router.get(
  "/current-emergency",
  authMiddleware,
  getCurrentEmergency
);

router.get(
  "/history",
  authMiddleware,
  getDriverHistory
);

router.put(
  "/profile",
  authMiddleware,
  updateMyProfile
);
router.get(
  "/pending",
  authMiddleware,
  getPendingEmergencies
);

// KEEP THESE LAST
router.get(
  "/:id",
  authMiddleware,
  adminMiddleware,
  getAmbulanceById
);

router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  updateAmbulance
);

router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  deleteAmbulance
);

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  createAmbulance
);

export default router;
