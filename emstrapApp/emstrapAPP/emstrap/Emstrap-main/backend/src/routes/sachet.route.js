import express from "express";

import {
    syncSachetKarnataka,
    testSachetTargeting
} from "../controllers/sachet.controller.js";

const router = express.Router();

router.post(
    "/sync/karnataka",
    syncSachetKarnataka
);

router.get(
    "/target-test",
    testSachetTargeting
);

export default router;