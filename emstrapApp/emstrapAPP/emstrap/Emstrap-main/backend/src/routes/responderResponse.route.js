import express from "express";
import optionalAuth from "../middlewares/optionalAuth.middleware.js";

import {
    updateResponderStatus
} from "../controllers/responderResponse.controller.js";

const router = express.Router();

router.put(
    "/status",
    optionalAuth,
    updateResponderStatus
);

export default router;