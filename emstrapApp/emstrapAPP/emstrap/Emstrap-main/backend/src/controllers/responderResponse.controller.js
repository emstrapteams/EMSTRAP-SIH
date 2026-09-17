import DisasterEmergency from "../models/disasterEmergency.model.js";
import ResponseUpdate from "../models/responseUpdate.model.js";
import Firefighter from "../models/firefighter.model.js";
import RescueTeam from "../models/rescueTeam.model.js";
import FireVehicle from "../models/fireVehicle.model.js";
import { getIO } from "../sockets/socket.js";
import { getStationForDisasterUser, stationResponderIds } from "../services/fireStationAccess.service.js";


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

        if (!req.user || !["FIREFIGHTER", "RESCUE_TEAM"].includes(req.user.role)) {
            return res.status(403).json({ success: false, message: "Fire Station or Rescue Team authentication is required." });
        }

        const station = await getStationForDisasterUser(req.user);
        if (!station) {
            return res.status(404).json({ success: false, message: "No fire station context found for the authenticated user." });
        }

        const { firefighterIds, rescueTeamIds } = stationResponderIds(station);
        const emergency = await DisasterEmergency.findOne({
            _id: emergencyId,
            $or: [
                { assignedFirefighter: { $in: firefighterIds } },
                { assignedRescueTeam: { $in: rescueTeamIds } },
            ],
        });

        if (!emergency) {
            return res.status(404).json({
                success: false,
                message: "Emergency not found"
            });
        }


        const responderType = req.user.role;
        const responderId = req.user._id;

        const allowedNextStatuses =
            STATUS_FLOW[emergency.status] || [];

        if (!allowedNextStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message:
                    `Cannot change status from ${emergency.status} to ${status}`
            });
        }


        emergency.status = status;

        await emergency.save();


        const update = await ResponseUpdate.create({
            emergency: emergency._id,

            updatedBy: responderId || null,

            updatedByType: responderType,

            status,

            message:
                message ||
                `Responder updated emergency to ${status}`,

            location: location || emergency.location,
        });

        if (status === "RESOLVED") {
            await Promise.all([
                emergency.assignedFirefighter
                    ? Firefighter.findByIdAndUpdate(emergency.assignedFirefighter, { availability: "AVAILABLE", currentEmergency: null })
                    : null,
                emergency.assignedRescueTeam
                    ? RescueTeam.findByIdAndUpdate(emergency.assignedRescueTeam, { availability: "AVAILABLE", currentEmergency: null })
                    : null,
                FireVehicle.updateMany({ currentEmergency: emergency._id }, { status: "AVAILABLE", currentEmergency: null }),
            ]);
        }

        try {
            getIO().to(`station_${station._id}`).emit("fire_station_updated", {
                type: "emergency_status_changed",
                emergencyId: emergency._id,
                status,
            });
        } catch {
            // REST remains authoritative when Socket.IO is unavailable.
        }


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