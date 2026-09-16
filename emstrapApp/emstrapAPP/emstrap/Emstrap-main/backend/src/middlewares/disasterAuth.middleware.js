import jwt from "jsonwebtoken";

import Firefighter from "../models/firefighter.model.js";
import RescueTeam from "../models/rescueTeam.model.js";
import DisasterPolice from "../models/disasterPolice.model.js";
import DisasterHospital from "../models/disasterHospital.model.js";
import DisasterAdmin from "../models/disasterAdmin.model.js";

const ROLE_MODELS = {
    FIREFIGHTER: Firefighter,
    RESCUE_TEAM: RescueTeam,
    POLICE: DisasterPolice,
    HOSPITAL: DisasterHospital,
    ADMIN: DisasterAdmin,
};

const disasterAuth = async (req, res, next) => {
    try {
        let token = req.cookies?.token;

        if (!token && req.headers.authorization?.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Not authorized. Authentication token required.",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const { id, role } = decoded;

        if (!id || !role || !ROLE_MODELS[role]) {
            return res.status(401).json({
                success: false,
                message: "Invalid disaster authentication token.",
            });
        }

        const Model = ROLE_MODELS[role];

        const user = await Model.findById(id).select("-password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Disaster user not found.",
            });
        }

        user.role = role;
        req.user = user;

        next();
    } catch (error) {
        if (
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError"
        ) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired authentication token.",
            });
        }

        console.error("Disaster authentication error:", error);

        return res.status(500).json({
            success: false,
            message: "Authentication server error.",
        });
    }
};

export default disasterAuth;