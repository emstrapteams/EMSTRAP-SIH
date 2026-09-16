import "dotenv/config";
import bcrypt from "bcryptjs";

import { connectDisasterDB } from "../config/disasterDb.js";
import Firefighter from "../models/firefighter.model.js";
import RescueTeam from "../models/rescueTeam.model.js";
import DisasterPolice from "../models/disasterPolice.model.js";
import DisasterHospital from "../models/disasterHospital.model.js";
import DisasterAdmin from "../models/disasterAdmin.model.js";

const setTestPasswords = async () => {
    try {
        await connectDisasterDB();

        console.log("Setting disaster test account passwords...");

        const password = await bcrypt.hash("Test@123", 10);

        const results = await Promise.all([
            Firefighter.updateMany(
                {},
                { $set: { password } }
            ),

            RescueTeam.updateMany(
                {},
                { $set: { password } }
            ),

            DisasterPolice.updateMany(
                {},
                { $set: { password } }
            ),

            DisasterHospital.updateMany(
                {},
                { $set: { password } }
            ),

            DisasterAdmin.updateMany(
                {},
                { $set: { password } }
            ),
        ]);

        console.log("====================================");
        console.log("DISASTER TEST PASSWORDS SET");
        console.log("====================================");
        console.log("Test password: Test@123");
        console.log("Firefighters updated:", results[0].modifiedCount);
        console.log("Rescue teams updated:", results[1].modifiedCount);
        console.log("Police updated:", results[2].modifiedCount);
        console.log("Hospitals updated:", results[3].modifiedCount);
        console.log("Admins updated:", results[4].modifiedCount);

        process.exit(0);
    } catch (error) {
        console.error("❌ Failed to set passwords:", error);
        process.exit(1);
    }
};

setTestPasswords();