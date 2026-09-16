import bcrypt from "bcryptjs";
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

const findAccount = async (role, identifier) => {
    const Model = ROLE_MODELS[role];

    if (!Model) return null;

    const query = {};

    switch (role) {
        case "FIREFIGHTER":
            query.email = identifier.toLowerCase();
            break;

        case "RESCUE_TEAM":
            query.teamCode = identifier;
            break;

        case "POLICE":
            query.email = identifier.toLowerCase();
            break;

        case "HOSPITAL":
            query.hospitalCode = identifier;
            break;

        case "ADMIN":
            query.email = identifier.toLowerCase();
            break;

        default:
            return null;
    }

    return Model.findOne(query).select("+password");
};

export const disasterLogin = async (req, res) => {
    try {
        const { role, identifier, password } = req.body;

        if (!role || !identifier || !password) {
            return res.status(400).json({
                success: false,
                message: "Role, identifier and password are required.",
            });
        }

        const normalizedRole = role.toUpperCase();

        if (!ROLE_MODELS[normalizedRole]) {
            return res.status(400).json({
                success: false,
                message: "Invalid disaster role.",
            });
        }

        const account = await findAccount(normalizedRole, identifier);

        if (!account) {
            return res.status(401).json({
                success: false,
                message: "Invalid login credentials.",
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            account.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid login credentials.",
            });
        }

        const token = jwt.sign(
            {
                id: account._id,
                role: normalizedRole,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            }
        );

        return res.status(200).json({
            success: true,
            message: "Disaster login successful.",
            token,
            user: {
                id: account._id,
                role: normalizedRole,
                name: account.name || account.teamName,
            },
        });
    } catch (error) {
        console.error("Disaster login error:", error);

        return res.status(500).json({
            success: false,
            message: "Disaster login failed.",
        });
    }
};