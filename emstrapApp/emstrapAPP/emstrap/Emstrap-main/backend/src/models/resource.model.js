import mongoose from "mongoose";
import { disasterDB } from "../config/disasterDb.js";

const resourceSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        resourceCode: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        type: {
            type: String,
            enum: [
                "FIRE_ENGINE",
                "RESCUE_VEHICLE",
                "RESCUE_BOAT",
                "LADDER",
                "CUTTING_EQUIPMENT",
                "ROPE_RESCUE_EQUIPMENT",
                "LIFE_JACKET",
                "MEDICAL_KIT",
                "SEARCH_EQUIPMENT",
                "COMMUNICATION_EQUIPMENT",
                "OTHER"
            ],
            required: true
        },

        station: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "FireStation",
            default: null
        },

        quantity: {
            type: Number,
            default: 1,
            min: 0
        },

        availableQuantity: {
            type: Number,
            default: 1,
            min: 0
        },

        status: {
            type: String,
            enum: [
                "AVAILABLE",
                "PARTIALLY_AVAILABLE",
                "IN_USE",
                "MAINTENANCE",
                "UNAVAILABLE"
            ],
            default: "AVAILABLE"
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
        },

        assignedEmergency: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DisasterEmergency",
            default: null
        },

        assignedRescueTeam: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "RescueTeam",
            default: null
        },

        description: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true,
        collection: "resources"
    }
);

const Resource =
    disasterDB.models.Resource ||
    disasterDB.model("Resource", resourceSchema);

export default Resource;