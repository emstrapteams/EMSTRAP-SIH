import DisasterAlert from "../models/disasterAlert.model.js";
import { notifyWarningTargets } from "../services/disasterWarningNotification.service.js";

const REQUIRED_FIELDS = [
    "externalId",
    "title",
    "message",
    "disasterType",
    "severity",
    "location"
];

/*
 * Ingest a SACHET-style official warning.
 *
 * Source is always forced to "SACHET" here — this endpoint is not
 * for citizen/system/admin-generated alerts, which already have
 * their own creation path elsewhere.
 */
export const ingestSachetWarning = async (req, res) => {
    try {
        const {
            externalId,
            title,
            message,
            instructions,
            disasterType,
            severity,
            areaName,
            location,
            radiusKm,
            expiresAt
        } = req.body;

        const missingFields = REQUIRED_FIELDS.filter(
            (field) =>
                req.body[field] === undefined ||
                req.body[field] === null ||
                req.body[field] === ""
        );

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(", ")}`
            });
        }

        if (
            typeof location !== "object" ||
            location.latitude === undefined ||
            location.longitude === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "location.latitude and location.longitude are required"
            });
        }

        const existing = await DisasterAlert.findOne({ externalId });

        if (existing) {
            return res.status(200).json({
                success: true,
                message: "Warning already ingested (duplicate externalId) — no new record created.",
                duplicate: true,
                alert: existing
            });
        }

        const alert = await DisasterAlert.create({
            type: "DISASTER_WARNING",
            title,
            message,
            instructions: Array.isArray(instructions)
                ? instructions
                : [],
            disasterType,
            source: "SACHET",
            externalId,
            areaName: areaName || null,
            location: {
                latitude: location.latitude,
                longitude: location.longitude,
                radiusKm: radiusKm ?? location.radiusKm ?? null
            },
            severity,
            active: true,
            expiresAt: expiresAt ? new Date(expiresAt) : null
        });

        const notificationResult = await notifyWarningTargets(alert);

        const socketResult = broadcastDisasterWarning(
            alert,
            notificationResult.targetRecords
        );

        delete notificationResult.targetRecords;

        return res.status(201).json({
            success: true,
            message: "SACHET warning ingested, recipients notified, and real-time warning broadcast successfully.",
            duplicate: false,
            alert,
            notificationResult,
            socketResult
        });
    } catch (error) {
        // Race-condition safety net: two near-simultaneous ingests of the
        // same externalId will both pass the findOne check above, but the
        // unique sparse index will reject the second insert here.
        if (error.code === 11000) {
            const existing = await DisasterAlert.findOne({
                externalId: req.body.externalId
            });

            return res.status(200).json({
                success: true,
                message: "Warning already ingested (duplicate externalId).",
                duplicate: true,
                alert: existing
            });
        }

        console.error("Ingest SACHET warning error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to ingest warning",
            error: error.message
        });
    }
};

/*
 * List official disaster warnings for the frontend map.
 * Defaults to active-only unless ?active=false is passed.
 */
export const listWarnings = async (req, res) => {
    try {
        const { severity, disasterType, active } = req.query;

        const query = { type: "DISASTER_WARNING" };

        if (severity) {
            query.severity = severity;
        }

        if (disasterType) {
            query.disasterType = disasterType;
        }

        query.active = active !== undefined ? active === "true" : true;

        const warnings = await DisasterAlert.find(query)
            .sort({ createdAt: -1 })
            .limit(100);

        return res.status(200).json({
            success: true,
            count: warnings.length,
            warnings
        });
    } catch (error) {
        console.error("List warnings error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch warnings",
            error: error.message
        });
    }
};

/*
 * Fetch a single official warning by id.
 */
export const getWarningById = async (req, res) => {
    try {
        const { id } = req.params;

        const warning = await DisasterAlert.findById(id);

        if (!warning || warning.type !== "DISASTER_WARNING") {
            return res.status(404).json({
                success: false,
                message: "Warning not found"
            });
        }

        return res.status(200).json({
            success: true,
            warning
        });
    } catch (error) {
        console.error("Get warning error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch warning",
            error: error.message
        });
    }
};
export const notifyWarningTargetsTest = async (req, res) => {
    try {
        const { id } = req.params;

        const warning = await DisasterAlert.findById(id);

        if (!warning || warning.type !== "DISASTER_WARNING") {
            return res.status(404).json({
                success: false,
                message: "Warning not found"
            });
        }

        const result = await notifyWarningTargets(warning);

        return res.status(200).json({
            success: true,
            message: "Warning targets notified successfully.",
            warningId: warning._id,
            result
        });
    } catch (error) {
        console.error("Notify warning targets error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to notify warning targets",
            error: error.message
        });
    }
};