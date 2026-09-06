import mongoose from "mongoose";
import { disasterDB } from "../config/disasterDb.js";

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },

        recipientType: {
            type: String,
            enum: [
                "USER",
                "FIREFIGHTER",
                "RESCUE_TEAM",
                "POLICE",
                "HOSPITAL",
                "ADMIN"
            ],
            required: true
        },

        type: {
            type: String,
            enum: [
                "DISASTER_WARNING",
                "EMERGENCY_CREATED",
                "EMERGENCY_ACKNOWLEDGED",
                "RESPONDER_ASSIGNED",
                "RESPONSE_STARTED",
                "RESPONDER_EN_ROUTE",
                "RESPONDER_ARRIVED",
                "PATIENT_PICKED_UP",
                "HOSPITAL_NOTIFIED",
                "EMERGENCY_RESOLVED",
                "EMERGENCY_ESCALATED",
                "SYSTEM"
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

        emergency: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DisasterEmergency",
            default: null
        },

        alert: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DisasterAlert",
            default: null
        },

        read: {
            type: Boolean,
            default: false
        },

        readAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true,
        collection: "notifications"
    }
);

const Notification =
    disasterDB.models.Notification ||
    disasterDB.model("Notification", notificationSchema);

export default Notification;