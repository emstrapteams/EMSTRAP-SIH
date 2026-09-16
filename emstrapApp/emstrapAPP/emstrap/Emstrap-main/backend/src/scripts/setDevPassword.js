/**
 * ONE-TIME DEVELOPMENT SCRIPT — NOT PRODUCTION CODE.
 *
 * Purpose: set a bcrypt-hashed password on a single existing RescueTeam
 * test account so disaster login (POST /api/disaster/auth/login) can be
 * tested in Postman.
 *
 * Does NOT create any account. Does NOT touch any other model/collection.
 * Does NOT modify auth middleware, controllers, or routes.
 *
 * Run once from the backend/ directory:
 *   node src/scripts/setDevPassword.js
 *
 * Safe to delete after use. Do not schedule, import, or call this from
 * any route/controller/server startup code.
 */

import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDisasterDB } from "../config/disasterDb.js";
import RescueTeam from "../models/rescueTeam.model.js";

const TARGET_TEAM_CODE = "RT-BLR-001";
const DEV_PASSWORD = "Test@123";

const setDevPassword = async () => {
    try {
        await connectDisasterDB();

        const team = await RescueTeam.findOne({ teamCode: TARGET_TEAM_CODE });

        if (!team) {
            console.log(
                `❌ No RescueTeam found with teamCode "${TARGET_TEAM_CODE}". Nothing changed.`
            );
            process.exit(1);
        }

        const hashedPassword = await bcrypt.hash(DEV_PASSWORD, 10);

        team.password = hashedPassword;
        await team.save();

        console.log(
            `✅ Dev password set for RescueTeam "${team.teamName}" (teamCode: ${team.teamCode}, id: ${team._id}).`
        );
        console.log(`   Login with: { "role": "RESCUE_TEAM", "identifier": "${TARGET_TEAM_CODE}", "password": "${DEV_PASSWORD}" }`);

        process.exit(0);
    } catch (error) {
        console.error("❌ Failed to set dev password:", error.message);
        process.exit(1);
    }
};

setDevPassword();