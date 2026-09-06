import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { updateDriverLocation } from "../controllers/privateDriver.controller.js";

const router = express.Router();

router.put("/location", authMiddleware, updateDriverLocation);

export default router;