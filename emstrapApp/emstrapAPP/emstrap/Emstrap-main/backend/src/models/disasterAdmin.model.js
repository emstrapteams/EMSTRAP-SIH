import mongoose from "mongoose";
import { disasterDB } from "../config/disasterDb.js";

const disasterAdminSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        adminId: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        mobile: {
            type: String,
            required: true
        },

        password: {
            type: String,
            required: true
        },

        designation: {
            type: String,
            default: "CONTROL_UNIT_ADMIN"
        },

        controlUnit: {
            type: String,
            default: "MAIN_CONTROL_UNIT"
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

        lastLogin: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true,
        collection: "admins"
    }
);

const DisasterAdmin =
    disasterDB.models.DisasterAdmin ||
    disasterDB.model("DisasterAdmin", disasterAdminSchema);

export default DisasterAdmin;