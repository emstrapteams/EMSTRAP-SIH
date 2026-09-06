import "dotenv/config";
import { connectDisasterDB } from "../config/disasterDb.js";
import RescueTeam from "../models/rescueTeam.model.js";

const reset = async () => {
    try {
        await connectDisasterDB();

        await RescueTeam.updateOne(
            { teamCode: "RT-BLR-001" },
            {
                $set: {
                    availability: "AVAILABLE",
                    currentEmergency: null
                }
            }
        );

        console.log("✅ Test rescue team reset to AVAILABLE");

        process.exit(0);
    } catch (error) {
        console.error("❌ Reset failed:", error);
        process.exit(1);
    }
};

reset();