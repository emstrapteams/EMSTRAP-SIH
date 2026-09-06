import express from "express";
import optionalAuth from "../middlewares/optionalAuth.middleware.js";
import authMiddleware from "../middlewares/auth.middleware.js";

import {
    createDisasterEmergency,
    getDisasterEmergency,
    getUserDisasterEmergencies,
    uploadDisasterEvidence
} from "../controllers/disasterEmergency.controller.js";

const router = express.Router();

router.post("/", optionalAuth, createDisasterEmergency);

router.get("/user", authMiddleware, getUserDisasterEmergencies);

router.get("/:id", optionalAuth, getDisasterEmergency);

router.post("/:id/evidence", optionalAuth, uploadDisasterEvidence);

export default router;