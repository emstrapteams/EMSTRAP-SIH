import express from "express";
import disasterAuth from "../middlewares/disasterAuth.middleware.js";

import {
    updateResponderStatus
} from "../controllers/responderResponse.controller.js";

const router = express.Router();

router.put(
    "/status",
    disasterAuth,
    updateResponderStatus
);

export default router;