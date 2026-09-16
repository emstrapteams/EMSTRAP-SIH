import express from "express";
import disasterAuth from "../middlewares/disasterAuth.middleware.js";
import {
    getRescueTeamDashboard,
    getFireStationDashboard,
} from "../controllers/disasterDashboard.controller.js";

const router = express.Router();

router.get("/rescue-team", disasterAuth, getRescueTeamDashboard);
router.get("/fire-station", disasterAuth, getFireStationDashboard);

export default router;
