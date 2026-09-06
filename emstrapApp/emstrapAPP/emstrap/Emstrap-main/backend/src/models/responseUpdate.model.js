import mongoose from "mongoose";
import { disasterDB } from "../config/disasterDb.js";

const responseUpdateSchema = new mongoose.Schema(
    {
        emergency: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DisasterEmergency",
            required: true
        },

        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            default: null
        },

        updatedByType: {
            type: String,
            enum: [
                "USER",
                "FIREFIGHTER",
                "RESCUE_TEAM",
                "POLICE",
                "HOSPITAL",
                "ADMIN",
                "SYSTEM"
            ],
            required: true
        },

        status: {
            type: String,
            enum: [
                "EMERGENCY_SENT",
                "ACKNOWLEDGED",
                "RESPONSE_INITIATED",
                "RESPONDER_ASSIGNED",
                "EN_ROUTE",
                "ARRIVED",
                "PATIENT_PICKED_UP",
                "HOSPITAL_NOTIFIED",
                "RESOLVED",
                "SEARCHING_FOR_RESPONSE",
                "NO_RESOURCE_AVAILABLE",
                "ESCALATED",
                "CANCELLED"
            ],
            required: true
        },

        message: {
            type: String,
            default: ""
        },

        location: {
            latitude: {
                type: Number,
                default: null
            },

            longitude: {
                type: Number,
                default: null
            }
        }
    },
    {
        timestamps: true,
        collection: "response_updates"
    }
);

const ResponseUpdate =
    disasterDB.models.ResponseUpdate ||
    disasterDB.model("ResponseUpdate", responseUpdateSchema);

export default ResponseUpdate;