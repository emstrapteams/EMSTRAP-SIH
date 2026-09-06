import mongoose from "mongoose";
import { disasterDB } from "../config/disasterDb.js";

const firefighterSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        employeeId: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        mobile: {
            type: String,
            required: true,
            match: [
                /^[6-9]\d{9}$/,
                "Please enter a valid 10-digit Indian mobile number"
            ]
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        station: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "FireStation",
            default: null
        },

        rescueTeam: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "RescueTeam",
            default: null
        },

        specialization: {
            type: [String],
            default: []
        },

        availability: {
            type: String,
            enum: [
                "AVAILABLE",
                "BUSY",
                "OFF_DUTY",
                "EMERGENCY"
            ],
            default: "OFF_DUTY"
        },

        currentLocation: {
            latitude: {
                type: Number,
                default: null
            },
            longitude: {
                type: Number,
                default: null
            }
        },

        currentEmergency: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DisasterEmergency",
            default: null
        }
    },
    {
        timestamps: true,
        collection: "firefighters"
    }
);

const Firefighter =
    disasterDB.models.Firefighter ||
    disasterDB.model("Firefighter", firefighterSchema);

export default Firefighter;