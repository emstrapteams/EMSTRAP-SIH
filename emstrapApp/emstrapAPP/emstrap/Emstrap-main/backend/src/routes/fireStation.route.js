import express from "express";
import disasterAuth from "../middlewares/disasterAuth.middleware.js";
import { dispatchVehicle, getFireStationVehicle, getFireStationVehicles, updateVehicleStatus } from "../controllers/fireStation.controller.js";

const router = express.Router();
router.use(disasterAuth);
router.get("/vehicles", getFireStationVehicles);
router.get("/vehicles/:vehicleId", getFireStationVehicle);
router.post("/dispatch", dispatchVehicle);
router.put("/vehicles/:vehicleId/status", updateVehicleStatus);

export default router;