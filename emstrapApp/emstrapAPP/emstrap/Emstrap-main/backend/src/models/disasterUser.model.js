import mongoose from "mongoose";
import { disasterDB } from "../config/disasterDb.js";

const disasterUserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
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
            required: true,
            match: [
                /^[6-9]\d{9}$/,
                "Please enter a valid 10-digit Indian mobile number"
            ]
        },

        password: {
            type: String,
            required: true
        },

        isEmailVerified: {
            type: Boolean,
            default: false
        },

        emailVerificationToken: {
            type: String
        },

        emailVerificationTokenExpiry: {
            type: Date
        },

        resetPasswordToken: {
            type: String
        },

        resetPasswordExpire: {
            type: Date
        },

        address: {
            type: String,
            required: true
        },

        city: {
            type: String,
            required: true
        },

        districtCode: {
            type: String,
            default: null,
            trim: true
        },

        currentLocation: {
            latitude: {
                type: Number
            },
            longitude: {
                type: Number
            }
        }
    },
    {
        timestamps: true,
        collection: "users"
    }
);

const DisasterUser =
    disasterDB.models.DisasterUser ||
    disasterDB.model("DisasterUser", disasterUserSchema);

export default DisasterUser;