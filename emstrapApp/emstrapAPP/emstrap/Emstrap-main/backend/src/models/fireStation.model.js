import mongoose from "mongoose";
import { disasterDB } from "../config/disasterDb.js";

const fireStationSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        stationCode: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        location: {
            latitude: {
                type: Number,
                required: true
            },
            longitude: {
                type: Number,
                required: true
            }
        },

        address: {
            type: String,
            required: true
        },

        contactNumber: {
            type: String,
            required: true,
            match: [
                /^[6-9]\d{9}$/,
                "Please enter a valid 10-digit Indian mobile number"
            ]
        },

        status: {
            type: String,
            enum: [
                "ACTIVE",
                "INACTIVE",
                "EMERGENCY_ONLY"
            ],
            default: "ACTIVE"
        },

        firefighters: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Firefighter"
            }
        ],

        rescueTeams: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "RescueTeam"
            }
        ]
    },
    {
        timestamps: true,
        collection: "fire_stations"
    }
);

const FireStation =
    disasterDB.models.FireStation ||
    disasterDB.model("FireStation", fireStationSchema);

export default FireStation;