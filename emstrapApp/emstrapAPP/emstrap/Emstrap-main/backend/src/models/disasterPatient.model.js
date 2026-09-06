import mongoose from "mongoose";
import { disasterDB } from "../config/disasterDb.js";

const disasterPatientSchema = new mongoose.Schema(
    {
        emergency: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DisasterEmergency",
            required: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        age: {
            type: Number,
            min: 0,
            default: null
        },

        gender: {
            type: String,
            enum: [
                "MALE",
                "FEMALE",
                "OTHER",
                "UNKNOWN"
            ],
            default: "UNKNOWN"
        },

        condition: {
            type: String,
            default: ""
        },

        injuries: {
            type: [String],
            default: []
        },

        priority: {
            type: String,
            enum: [
                "LOW",
                "MODERATE",
                "HIGH",
                "CRITICAL"
            ],
            default: "LOW"
        },

        pickedUp: {
            type: Boolean,
            default: false
        },

        pickedUpAt: {
            type: Date,
            default: null
        },

        pickedUpBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "RescueTeam",
            default: null
        },

        hospital: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DisasterHospital",
            default: null
        },

        hospitalNotified: {
            type: Boolean,
            default: false
        },

        hospitalNotifiedAt: {
            type: Date,
            default: null
        },

        treatmentStatus: {
            type: String,
            enum: [
                "WAITING",
                "IN_TREATMENT",
                "STABLE",
                "CRITICAL",
                "DISCHARGED"
            ],
            default: "WAITING"
        }
    },
    {
        timestamps: true,
        collection: "patients"
    }
);

const DisasterPatient =
    disasterDB.models.DisasterPatient ||
    disasterDB.model("DisasterPatient", disasterPatientSchema);

export default DisasterPatient;