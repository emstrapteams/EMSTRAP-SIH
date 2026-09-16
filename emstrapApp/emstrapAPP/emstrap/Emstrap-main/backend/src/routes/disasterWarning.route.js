import express from "express";
import {
    ingestSachetWarning,
    listWarnings,
    getWarningById,
    notifyWarningTargetsTest
} from "../controllers/disasterWarning.controller.js";

const router = express.Router();

router.post("/ingest", ingestSachetWarning);
router.get("/", listWarnings);
router.get("/:id", getWarningById);
router.post("/:id/notify-test", notifyWarningTargetsTest);
export default router;