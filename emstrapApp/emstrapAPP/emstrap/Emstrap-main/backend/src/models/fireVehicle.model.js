import mongoose from "mongoose";
import { disasterDB } from "../config/disasterDb.js";

const fireVehicleSchema = new mongoose.Schema(
    {
        vehicleNumber: { type: String, required: true, unique: true, trim: true },
        vehicleType: { type: String, required: true, trim: true },
        station: { type: mongoose.Schema.Types.ObjectId, ref: "FireStation", required: true },
        status: { type: String, enum: ["AVAILABLE", "DISPATCHED", "MAINTENANCE"], default: "AVAILABLE" },
        crew: [{ type: mongoose.Schema.Types.ObjectId, ref: "Firefighter" }],
        currentLocation: {
            latitude: { type: Number, default: null },
            longitude: { type: Number, default: null },
        },
        currentEmergency: { type: mongoose.Schema.Types.ObjectId, ref: "DisasterEmergency", default: null },
        fuelLevel: { type: Number, min: 0, max: 100, default: null },
        waterLevel: { type: Number, min: 0, max: 100, default: null },
        equipment: { type: [String], default: [] },
    },
    { timestamps: true, collection: "fire_vehicles" }
);

const FireVehicle = disasterDB.models.FireVehicle || disasterDB.model("FireVehicle", fireVehicleSchema);

export default FireVehicle;