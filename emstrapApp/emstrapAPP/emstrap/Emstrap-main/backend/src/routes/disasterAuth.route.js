import express from "express";

import { disasterLogin } from "../controllers/disasterAuth.controller.js";

const router = express.Router();

router.post("/login", disasterLogin);

export default router;