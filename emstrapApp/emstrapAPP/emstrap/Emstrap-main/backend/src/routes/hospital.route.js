import { Router } from "express";
import {
  getHospitals,
  getAvailableHospitals,
  getHospitalById,
  getPatientRecords,
  createHospital,
  updateHospital,
  updateMyHospitalProfile,
  updateEmergencyBeds,
  deleteHospital,
  resolvePatientCase,
} from "../controllers/hospital.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import adminMiddleware from "../middlewares/admin.middleware.js";
import requireRoles from "../middlewares/role.middleware.js";
const router = Router();
console.log("HOSPITAL ROUTE FILE LOADED");
router.get("/", getHospitals);
router.get("/available", getAvailableHospitals);
router.get(
  "/patients",
  authMiddleware,
  getPatientRecords
);
router.put(
  "/profile",
  authMiddleware,
  updateMyHospitalProfile
);
router.get(
  "/profile",
  authMiddleware,
  (req, res) => {
    res.json({
      success: true,
      user: req.user,
      message: "Profile route works!"
    });
  }
);
router.get("/:id", getHospitalById);

router.patch(
  "/update-beds",
  authMiddleware,
  updateEmergencyBeds
);
router.post("/", authMiddleware, adminMiddleware, createHospital);
router.put("/:id", authMiddleware, adminMiddleware, updateHospital);
router.delete("/:id", authMiddleware, adminMiddleware, deleteHospital);
router.put(
  "/patients/:id/resolve",
  authMiddleware,
  requireRoles("hospital"),
  resolvePatientCase
);
export default router;
