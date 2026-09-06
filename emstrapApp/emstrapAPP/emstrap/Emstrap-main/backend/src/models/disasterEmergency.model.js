import mongoose from "mongoose";
import { disasterDB } from "../config/disasterDb.js";
const disasterEmergencySchema = new mongoose.Schema(
    {
        reportedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
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
                "OTHER",
            ],
            required: true,
        },

        location: {
            latitude: {
                type: Number,
                required: true,
            },
            longitude: {
                type: Number,
                required: true,
            },
        },

        imageUrl: {
            type: String,
            default: "",
        },

        description: {
            type: String,
            default: "",
        },

        voiceTranscript: {
            type: String,
            default: "",
        },

        affectedPeople: {
            type: Number,
            default: 0,
            min: 0,
        },

        immediateDanger: {
            type: Boolean,
            default: false,
        },

        requiredResponse: {
            type: [String],
            default: [],
        },

        severity: {
            type: String,
            enum: ["LOW", "MODERATE", "HIGH", "CRITICAL"],
            default: "LOW",
        },

        assignedRescueTeam: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
        },

        assignedFirefighter: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
        },

        assignedPolice: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
        },

        assignedHospital: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
        },

        patientIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
            },
        ],

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
                "CANCELLED",
            ],
            default: "EMERGENCY_SENT",
        },
    },
    {
        timestamps: true,
        collection: "emergencies",
    }
);

const DisasterEmergency =
    disasterDB.models.DisasterEmergency ||
    disasterDB.model("DisasterEmergency", disasterEmergencySchema);

export default DisasterEmergency;