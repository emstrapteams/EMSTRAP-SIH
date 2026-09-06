import DisasterEmergency from "../models/disasterEmergency.model.js";
import ResponseUpdate from "../models/responseUpdate.model.js";
import DisasterAlert from "../models/disasterAlert.model.js";
import { buildRoutingDecision } from "../services/disasterRouting.service.js";
import {
    findAvailableResponders,
    assignResponder
} from "../services/responderAssignment.service.js";

/*
 * CREATE DISASTER EMERGENCY
 * Citizen submits an emergency report.
 */
export const createDisasterEmergency = async (req, res) => {
    try {
        const {
            disasterType,
            location,
            imageUrl,
            description,
            voiceTranscript,
            affectedPeople,
            immediateDanger,
            requiredResponse,
            severity
        } = req.body;

        if (!disasterType) {
            return res.status(400).json({
                success: false,
                message: "Disaster type is required"
            });
        }

        if (
            !location ||
            location.latitude === undefined ||
            location.longitude === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "Emergency location is required"
            });
        }

        const emergency = await DisasterEmergency.create({
            reportedBy: req.user?._id || null,

            disasterType,

            location: {
                latitude: location.latitude,
                longitude: location.longitude
            },

            imageUrl: imageUrl || null,
            description: description || "",
            voiceTranscript: voiceTranscript || "",

            affectedPeople:
                affectedPeople !== undefined ? affectedPeople : null,

            immediateDanger:
                immediateDanger !== undefined ? immediateDanger : false,

            requiredResponse: requiredResponse || [],

            severity: severity || "MODERATE",

            status: "EMERGENCY_SENT"
        });
        const routingDecision = buildRoutingDecision(emergency);

        emergency.status = "RESPONSE_INITIATED";
        await emergency.save();
        const availableResponders = await findAvailableResponders(
            routingDecision.responderTypes
        );

        const responderFound =
            Object.values(availableResponders).some(
                (responder) => responder !== null
            );

        const assignedResponders = [];

        for (const responderType of routingDecision.responderTypes) {

            const responderKey = {
                RESCUE_TEAM: "rescueTeam",
                FIREFIGHTER: "firefighter",
                POLICE: "police",
                HOSPITAL: "hospital"
            }[responderType];

            if (!responderKey) {
                continue;
            }

            const responder = availableResponders[responderKey];

            if (!responder) {
                continue;
            }

            const assigned = await assignResponder(
                emergency,
                responderType,
                responder
            );

            if (assigned) {

                assignedResponders.push({
                    type: responderType,
                    id: responder._id,
                    name:
                        responder.teamName ||
                        responder.name
                });

                await ResponseUpdate.create({
                    emergency: emergency._id,
                    updatedBy: responder._id,
                    updatedByType: responderType,
                    status: "RESPONDER_ASSIGNED",
                    message:
                        `${responderType} assigned: ${responder.teamName ||
                        responder.name
                        }`,
                    location: {
                        latitude:
                            responder.currentLocation?.latitude ??
                            null,
                        longitude:
                            responder.currentLocation?.longitude ??
                            null
                    }
                });
            }
        }
        if (assignedResponders.length > 0) {

            emergency.status = "RESPONDER_ASSIGNED";

            await emergency.save();

        } else {

            emergency.status = "SEARCHING_FOR_RESPONSE";

            await emergency.save();

            await ResponseUpdate.create({
                emergency: emergency._id,
                updatedBy: null,
                updatedByType: "SYSTEM",
                status: "SEARCHING_FOR_RESPONSE",
                message: "No available responder found at this time",
                location: {
                    latitude: location.latitude,
                    longitude: location.longitude
                }
            });
        }

        if (!responderFound) {
            emergency.status = "SEARCHING_FOR_RESPONSE";

            await emergency.save();

            await ResponseUpdate.create({
                emergency: emergency._id,
                updatedBy: null,
                updatedByType: "SYSTEM",
                status: "SEARCHING_FOR_RESPONSE",
                message: "No available responder found at this time",
                location: {
                    latitude: location.latitude,
                    longitude: location.longitude
                }
            });
        }

        if (!responderFound) {
            emergency.status = "SEARCHING_FOR_RESPONSE";
            await emergency.save();

            await ResponseUpdate.create({
                emergency: emergency._id,
                updatedBy: null,
                updatedByType: "SYSTEM",
                status: "SEARCHING_FOR_RESPONSE",
                message: "No available responder found at this time",
                location: {
                    latitude: location.latitude,
                    longitude: location.longitude
                }
            });
        }
        /*
         * Add first response timeline entry.
         */
        await ResponseUpdate.create({
            emergency: emergency._id,
            updatedBy: req.user?._id || null,
            updatedByType: "USER",
            status: "EMERGENCY_SENT",
            message: "Emergency reported by citizen",
            location: {
                latitude: location.latitude,
                longitude: location.longitude
            }
        });
        await ResponseUpdate.create({
            emergency: emergency._id,
            updatedBy: null,
            updatedByType: "SYSTEM",
            status: "RESPONSE_INITIATED",
            message: `Emergency routed to: ${routingDecision.responderTypes.join(", ")}`,
            location: {
                latitude: location.latitude,
                longitude: location.longitude
            }
        });

        /*
         * Create an alert for the emergency.
         */
        await DisasterAlert.create({
            type: "EMERGENCY",
            title: `${disasterType.replaceAll("_", " ")} Emergency`,
            message:
                description ||
                "A citizen has reported an emergency.",
            disasterType,
            source: "CITIZEN",
            emergency: emergency._id,
            location: {
                latitude: location.latitude,
                longitude: location.longitude
            },
            severity: severity || "MODERATE"
        });

        return res.status(201).json({
            success: true,
            message: "Emergency reported successfully",
            emergency,
            routing: routingDecision,
            availableResponders,
            assignedResponders
        });

    } catch (error) {
        console.error(
            "Create disaster emergency error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to create emergency",
            error: error.message
        });
    }
};


/*
 * GET SINGLE DISASTER EMERGENCY
 */
export const getDisasterEmergency = async (req, res) => {
    try {
        const emergency = await DisasterEmergency.findById(
            req.params.id
        );

        if (!emergency) {
            return res.status(404).json({
                success: false,
                message: "Emergency not found"
            });
        }

        const updates = await ResponseUpdate.find({
            emergency: emergency._id
        }).sort({ createdAt: 1 });

        return res.status(200).json({
            success: true,
            emergency,
            updates
        });

    } catch (error) {
        console.error(
            "Get disaster emergency error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve emergency",
            error: error.message
        });
    }
};


/*
 * GET ALL EMERGENCIES REPORTED BY CURRENT CITIZEN
 */
export const getUserDisasterEmergencies = async (req, res) => {
    try {
        const emergencies = await DisasterEmergency.find({
            reportedBy: req.user._id
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: emergencies.length,
            emergencies
        });

    } catch (error) {
        console.error(
            "Get user disaster emergencies error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve emergencies",
            error: error.message
        });
    }
};


/*
 * UPLOAD / UPDATE EMERGENCY EVIDENCE
 *
 * Cloudinary integration will be connected here later.
 * For now, this endpoint accepts an already-uploaded image URL.
 */
export const uploadDisasterEvidence = async (req, res) => {
    try {
        const { imageUrl } = req.body;

        if (!imageUrl) {
            return res.status(400).json({
                success: false,
                message: "Image URL is required"
            });
        }

        const emergency = await DisasterEmergency.findById(
            req.params.id
        );

        if (!emergency) {
            return res.status(404).json({
                success: false,
                message: "Emergency not found"
            });
        }

        emergency.imageUrl = imageUrl;

        await emergency.save();

        return res.status(200).json({
            success: true,
            message: "Emergency evidence updated",
            emergency
        });

    } catch (error) {
        console.error(
            "Upload disaster evidence error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to update evidence",
            error: error.message
        });
    }
};