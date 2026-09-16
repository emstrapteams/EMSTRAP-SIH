import mongoose from "mongoose";
import { disasterDB } from "../config/disasterDb.js";

const disasterPoliceSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        officerId: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        mobile: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            select: false
        },

        station: {
            type: String,
            required: true,
            trim: true
        },

        districtCode: {
            type: String,
            default: null,
            trim: true
        },

        unit: {
            type: String,
            default: "GENERAL"
        },

        availability: {
            type: String,
            enum: [
                "AVAILABLE",
                "BUSY",
                "OFF_DUTY"
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
        collection: "polices"
    }
);

const DisasterPolice =
    disasterDB.models.DisasterPolice ||
    disasterDB.model("DisasterPolice", disasterPoliceSchema);

export default DisasterPolice;