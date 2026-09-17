import mongoose from "mongoose";
import DisasterEmergency from "../models/disasterEmergency.model.js";
import FireVehicle from "../models/fireVehicle.model.js";
import ResponseUpdate from "../models/responseUpdate.model.js";
import { getIO } from "../sockets/socket.js";
import { getStationForDisasterUser, stationResponderIds } from "../services/fireStationAccess.service.js";

const ACTIVE_STATUSES = [
    "EMERGENCY_SENT", "ACKNOWLEDGED", "RESPONSE_INITIATED", "RESPONDER_ASSIGNED",
    "EN_ROUTE", "ARRIVED", "PATIENT_PICKED_UP", "HOSPITAL_NOTIFIED",
    "SEARCHING_FOR_RESPONSE", "NO_RESOURCE_AVAILABLE", "ESCALATED",
];

const emitStationUpdate = (stationId, payload) => {
    try {
        getIO().to(`station_${stationId}`).emit("fire_station_updated", payload);
    } catch {
        // REST remains authoritative when Socket.IO is unavailable.
    }
};

const getAuthorizedStation = async (req, res) => {
    const station = await getStationForDisasterUser(req.user);
    if (!station) {
        res.status(404).json({ success: false, message: "No fire station context found for the authenticated user." });
        return null;
    }
    return station;
};

export const getFireStationVehicles = async (req, res) => {
    try {
        const station = await getAuthorizedStation(req, res);
        if (!station) return;
        const vehicles = await FireVehicle.find({ station: station._id })
            .populate("crew", "name employeeId availability")
            .populate("currentEmergency", "disasterType status location")
            .sort({ vehicleNumber: 1 });
        return res.status(200).json({ success: true, vehicles });
    } catch (error) {
        console.error("Get fire station vehicles error:", error);
        return res.status(500).json({ success: false, message: "Failed to load fire vehicles" });
    }
};

export const dispatchVehicle = async (req, res) => {
    const session = await FireVehicle.startSession();
    try {
        const { emergencyId, vehicleId } = req.body;
        if (!mongoose.isValidObjectId(emergencyId) || !mongoose.isValidObjectId(vehicleId)) return res.status(400).json({ success: false, message: "A valid emergencyId and vehicleId are required." });
        const station = await getAuthorizedStation(req, res);
        if (!station) return;
        const { firefighterIds, rescueTeamIds } = stationResponderIds(station);
        let result;

        await session.withTransaction(async () => {
            const vehicle = await FireVehicle.findOne({ _id: vehicleId, station: station._id }).session(session);
            if (!vehicle) throw Object.assign(new Error("Vehicle does not belong to the authenticated station."), { statusCode: 403 });
            if (vehicle.status !== "AVAILABLE") throw Object.assign(new Error("Vehicle is not available for dispatch."), { statusCode: 409 });
            const emergency = await DisasterEmergency.findOne({
                _id: emergencyId,
                status: { $in: ACTIVE_STATUSES },
                $or: [{ assignedFirefighter: { $in: firefighterIds } }, { assignedRescueTeam: { $in: rescueTeamIds } }],
            }).session(session);
            if (!emergency) throw Object.assign(new Error("Emergency is not associated with the authenticated station."), { statusCode: 403 });

            vehicle.status = "DISPATCHED";
            vehicle.currentEmergency = emergency._id;
            await vehicle.save({ session });
            emergency.assignedVehicles = emergency.assignedVehicles || [];
            if (!emergency.assignedVehicles.some((id) => id.toString() === vehicle._id.toString())) emergency.assignedVehicles.push(vehicle._id);
            await emergency.save({ session });
            const updates = await ResponseUpdate.create([{
                emergency: emergency._id,
                updatedBy: req.user._id,
                updatedByType: req.user.role,
                status: emergency.status,
                message: `Vehicle ${vehicle.vehicleNumber} dispatched to emergency.`,
                location: emergency.location,
            }], { session });
            result = { vehicle, emergency, update: updates[0] };
        });

        emitStationUpdate(station._id.toString(), { type: "vehicle_dispatched", emergencyId, vehicleId });
        return res.status(200).json({ success: true, message: "Fire vehicle dispatched.", ...result });
    } catch (error) {
        const status = error.statusCode || 500;
        if (status === 500) console.error("Dispatch fire vehicle error:", error);
        return res.status(status).json({ success: false, message: error.message || "Failed to dispatch fire vehicle" });
    } finally {
        await session.endSession();
    }
};

export const updateVehicleStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!["AVAILABLE", "DISPATCHED", "MAINTENANCE"].includes(status)) return res.status(400).json({ success: false, message: "Invalid vehicle status." });
        const station = await getAuthorizedStation(req, res);
        if (!station) return;
        const vehicle = await FireVehicle.findOne({ _id: req.params.vehicleId, station: station._id });
        if (!vehicle) return res.status(404).json({ success: false, message: "Vehicle not found for this station." });
        if (status === "DISPATCHED" && !vehicle.currentEmergency) return res.status(400).json({ success: false, message: "Dispatch a vehicle to an emergency before setting DISPATCHED." });
        const previousEmergency = vehicle.currentEmergency;
        vehicle.status = status;
        if (status === "AVAILABLE" || status === "MAINTENANCE") vehicle.currentEmergency = null;
        await vehicle.save();
        if ((status === "AVAILABLE" || status === "MAINTENANCE") && previousEmergency) await DisasterEmergency.findByIdAndUpdate(previousEmergency, { $pull: { assignedVehicles: vehicle._id } });
        emitStationUpdate(station._id.toString(), { type: "vehicle_status_changed", vehicleId: vehicle._id, status });
        return res.status(200).json({ success: true, message: "Fire vehicle status updated.", vehicle });
    } catch (error) {
        console.error("Update fire vehicle status error:", error);
        return res.status(500).json({ success: false, message: "Failed to update fire vehicle status" });
    }
};

export const getFireStationVehicle = async (req, res) => {
    try {
        const station = await getAuthorizedStation(req, res);
        if (!station) return;
        const vehicle = await FireVehicle.findOne({ _id: req.params.vehicleId, station: station._id })
            .populate("crew", "name employeeId availability")
            .populate("currentEmergency", "disasterType status location description");
        if (!vehicle) return res.status(404).json({ success: false, message: "Vehicle not found for this station." });
        return res.status(200).json({ success: true, vehicle });
    } catch (error) {
        console.error("Get fire station vehicle error:", error);
        return res.status(500).json({ success: false, message: "Failed to load fire vehicle" });
    }
};