import mongoose from "mongoose";
import { disasterDB } from "../config/disasterDb.js";

const disasterHospitalSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        hospitalCode: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        password: {
            type: String,
            select: false
        },

        address: {
            type: String,
            required: true
        },

        districtCode: {
            type: String,
            default: null,
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

        contactNumber: {
            type: String,
            required: true
        },

        emergencyAvailable: {
            type: Boolean,
            default: true
        },

        availableBeds: {
            type: Number,
            default: 0,
            min: 0
        },

        emergencyCapacity: {
            type: Number,
            default: 0,
            min: 0
        },

        specialties: {
            type: [String],
            default: []
        },

        status: {
            type: String,
            enum: [
                "ACTIVE",
                "FULL",
                "INACTIVE",
                "EMERGENCY_ONLY"
            ],
            default: "ACTIVE"
        },

        currentPatients: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Patient"
            }
        ]
    },
    {
        timestamps: true,
        collection: "hospitals"
    }
);

const DisasterHospital =
    disasterDB.models.DisasterHospital ||
    disasterDB.model("DisasterHospital", disasterHospitalSchema);

export default DisasterHospital;