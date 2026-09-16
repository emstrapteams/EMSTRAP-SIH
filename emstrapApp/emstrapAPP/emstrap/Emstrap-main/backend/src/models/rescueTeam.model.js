import mongoose from "mongoose";
import { disasterDB } from "../config/disasterDb.js";

const rescueTeamSchema = new mongoose.Schema(
    {
        teamName: {
            type: String,
            required: true,
            trim: true
        },

        teamCode: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        password: {
            type: String,
            select: false
        },

        station: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "FireStation",
            required: true
        },

        districtCode: {
            type: String,
            default: null,
            trim: true
        },

        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Firefighter"
            }
        ],

        specialization: {
            type: [String],
            default: []
        },

        availability: {
            type: String,
            enum: [
                "AVAILABLE",
                "BUSY",
                "OFF_DUTY"
            ],
            default: "AVAILABLE"
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
        },

        equipment: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Resource"
            }
        ]
    },
    {
        timestamps: true,
        collection: "rescue_teams"
    }
);

const RescueTeam =
    disasterDB.models.RescueTeam ||
    disasterDB.model("RescueTeam", rescueTeamSchema);

export default RescueTeam;