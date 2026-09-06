import DisasterEmergency from "../models/disasterEmergency.model.js";
import ResponseUpdate from "../models/responseUpdate.model.js";


const STATUS_FLOW = {
    RESPONDER_ASSIGNED: ["ACKNOWLEDGED"],
    ACKNOWLEDGED: ["EN_ROUTE"],
    EN_ROUTE: ["ARRIVED"],
    ARRIVED: ["RESOLVED"]
};


/*
 * Update responder status for an emergency.
 */
export const updateResponderStatus = async (req, res) => {
    try {
        const {
            emergencyId,
            status,
            message,
            location
        } = req.body;

        if (!emergencyId || !status) {
            return res.status(400).json({
                success: false,
                message: "Emergency ID and status are required"
            });
        }

        const emergency =
            await DisasterEmergency.findById(emergencyId);

        if (!emergency) {
            return res.status(404).json({
                success: false,
                message: "Emergency not found"
            });
        }


        /*
         * Determine who is making the update.
         *
         * For now the responder identity can come from
         * req.user when responder authentication is added.
         *
         * During development, the assigned rescue team is
         * used when available.
         */
        let responderType = "RESCUE_TEAM";
        let responderId = emergency.assignedRescueTeam;


        /*
         * Make sure the requested status is a valid
         * next step in the emergency lifecycle.
         */
        const allowedNextStatuses =
            STATUS_FLOW[emergency.status] || [];

        if (!allowedNextStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message:
                    `Cannot change status from ${emergency.status} to ${status}`
            });
        }


        /*
         * Update emergency status.
         */
        emergency.status = status;

        await emergency.save();


        /*
         * Add response timeline entry.
         */
        const update = await ResponseUpdate.create({
            emergency: emergency._id,

            updatedBy: responderId || null,

            updatedByType: responderType,

            status,

            message:
                message ||
                `Responder updated emergency to ${status}`,

            location: {
                latitude:
                    location?.latitude ??
                    null,

                longitude:
                    location?.longitude ??
                    null
            }
        });


        /*
         * Return updated emergency and timeline entry.
         */
        return res.status(200).json({
            success: true,
            message: `Emergency status updated to ${status}`,
            emergency,
            update
        });

    } catch (error) {

        console.error(
            "Update responder status error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to update responder status",
            error: error.message
        });
    }
};