import {
    syncSachetKarnatakaWarnings
} from "../services/sachet.service.js";

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