import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDisasterDB } from "../config/disasterDb.js";
import FireStation from "../models/fireStation.model.js";
import Firefighter from "../models/firefighter.model.js";
import FireVehicle from "../models/fireVehicle.model.js";
import DisasterEmergency from "../models/disasterEmergency.model.js";
import ResponseUpdate from "../models/responseUpdate.model.js";

const seedFireStationDemo = async () => {
    await connectDisasterDB();

    let station = await FireStation.findOne({ stationCode: "FD-BLR-001" });
    if (!station) {
        station = await FireStation.create({
            name: "Central Disaster Fire Station",
            stationCode: "FD-BLR-001",
            location: { latitude: 12.9716, longitude: 77.5946 },
            address: "Central Bangalore",
            contactNumber: "9876543210",
            status: "ACTIVE",
        });
    }

    let firefighter = await Firefighter.findOne({ email: "arun.ff@example.com" });
    if (!firefighter) {
        firefighter = await Firefighter.create({
            name: "Arun Kumar",
            employeeId: "FF-BLR-001",
            mobile: "9876500001",
            email: "arun.ff@example.com",
            password: await bcrypt.hash("Fire@123", 10),
            station: station._id,
            availability: "AVAILABLE",
            currentLocation: station.location,
        });
    } else if (!firefighter.password) {
        firefighter.password = await bcrypt.hash("Fire@123", 10);
        await firefighter.save();
    }

    const otherFirefighter = await Firefighter.findOne({ employeeId: "FF-BLR-002" });
    const firefighters = [firefighter, otherFirefighter].filter(Boolean);
    station.firefighters = firefighters.map((item) => item._id);
    await station.save();

    const vehicleData = [
        { vehicleNumber: "FS-BLR-001", vehicleType: "Fire Engine" },
        { vehicleNumber: "FS-BLR-002", vehicleType: "Water Tender" },
    ];
    for (const data of vehicleData) {
        await FireVehicle.updateOne(
            { vehicleNumber: data.vehicleNumber },
            { $setOnInsert: { ...data, station: station._id, status: "AVAILABLE", currentLocation: station.location } },
            { upsert: true }
        );
    }

    const stationResponderIds = firefighters.map((item) => item._id);
    const activeEmergency = await DisasterEmergency.findOne({
        assignedFirefighter: { $in: stationResponderIds },
        status: { $nin: ["RESOLVED", "CANCELLED"] },
    });

    if (!activeEmergency) {
        const emergency = await DisasterEmergency.create({
            disasterType: "FIRE",
            severity: "HIGH",
            location: { latitude: 12.976, longitude: 77.601 },
            description: "Development seed emergency for Fire Station end-to-end testing.",
            assignedFirefighter: firefighter._id,
            status: "RESPONDER_ASSIGNED",
        });
        firefighter.availability = "BUSY";
        firefighter.currentEmergency = emergency._id;
        await firefighter.save();
        await ResponseUpdate.create({
            emergency: emergency._id,
            updatedBy: firefighter._id,
            updatedByType: "FIREFIGHTER",
            status: "RESPONDER_ASSIGNED",
            message: "Development emergency assigned to Fire Station.",
            location: emergency.location,
        });
    }

    console.log(`Fire Station seed ready: ${station.stationCode}`);
    process.exit(0);
};

seedFireStationDemo().catch((error) => {
    console.error("Fire Station seed failed:", error);
    process.exit(1);
});