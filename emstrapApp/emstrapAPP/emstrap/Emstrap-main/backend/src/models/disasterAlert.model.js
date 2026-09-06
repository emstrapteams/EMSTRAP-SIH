import mongoose from "mongoose";
import { disasterDB } from "../config/disasterDb.js";

const disasterAlertSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: [
                "DISASTER_WARNING",
                "EMERGENCY",
                "RESCUE_RESPONSE"
            ],
            required: true
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        message: {
            type: String,
            required: true
        },

        disasterType: {
            type: String,
            enum: [
                "FLOOD",
                "LANDSLIDE",
                "EARTHQUAKE",
                "CYCLONE_STORM",
                "FIRE",
                "BUILDING_COLLAPSE",
                "ACCIDENT",
                "MEDICAL_EMERGENCY",
                "OTHER"
            ],
            default: "OTHER"
        },

        source: {
            type: String,
            enum: [
                "SACHET",
                "CITIZEN",
                "SYSTEM",
                "ADMIN",
                "RESPONDER"
            ],
            required: true
        },

        emergency: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DisasterEmergency",
            default: null
        },

        location: {
            latitude: {
                type: Number,
                default: null
            },

            longitude: {
                type: Number,
                default: null
            },

            radiusKm: {
                type: Number,
                default: null
            }
        },

        severity: {
            type: String,
            enum: [
                "LOW",
                "MODERATE",
                "HIGH",
                "CRITICAL"
            ],
            default: "LOW"
        },

        active: {
            type: Boolean,
            default: true
        },

        expiresAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true,
        collection: "alerts"
    }
);

const DisasterAlert =
    disasterDB.models.DisasterAlert ||
    disasterDB.model("DisasterAlert", disasterAlertSchema);

export default DisasterAlert;