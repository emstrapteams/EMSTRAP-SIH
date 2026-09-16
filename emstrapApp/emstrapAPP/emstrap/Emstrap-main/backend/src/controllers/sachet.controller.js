import {
    syncSachetKarnatakaWarnings
} from "../services/sachet.service.js";

import DisasterUser from "../models/disasterUser.model.js";
import Firefighter from "../models/firefighter.model.js";
import RescueTeam from "../models/rescueTeam.model.js";
import DisasterPolice from "../models/disasterPolice.model.js";
import DisasterHospital from "../models/disasterHospital.model.js";

export const syncSachetKarnataka = async (req, res) => {
    try {
        const result = await syncSachetKarnatakaWarnings();

        return res.status(200).json(result);
    } catch (error) {
        console.error("SACHET sync error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to sync SACHET warnings",
            error: error.message
        });
    }
};

export const testSachetTargeting = async (req, res) => {
    try {
        const [
            users,
            firefighters,
            rescueTeams,
            police,
            hospitals
        ] = await Promise.all([
            DisasterUser.countDocuments(),
            Firefighter.countDocuments(),
            RescueTeam.countDocuments(),
            DisasterPolice.countDocuments(),
            DisasterHospital.countDocuments()
        ]);

        return res.status(200).json({
            success: true,
            database: "EMSTRAP_FULL_DISASTER_DB",
            targeting: {
                users,
                firefighters,
                rescueTeams,
                police,
                hospitals
            }
        });
    } catch (error) {
        console.error("SACHET targeting test error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to test SACHET targeting",
            error: error.message
        });
    }
};