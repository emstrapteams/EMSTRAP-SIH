import express from "express";

import {
    syncSachetKarnataka
} from "../controllers/sachet.controller.js";

const router = express.Router();

router.post(
    "/sync/karnataka",
    syncSachetKarnataka
);

export default router;