import DisasterEmergency from "../models/disasterEmergency.model.js";
import ResponseUpdate from "../models/responseUpdate.model.js";
import FireStation from "../models/fireStation.model.js";
import Firefighter from "../models/firefighter.model.js";
import RescueTeam from "../models/rescueTeam.model.js";
import FireVehicle from "../models/fireVehicle.model.js";

const ACTIVE_EMERGENCY_STATUSES = [
    "EMERGENCY_SENT",
    "ACKNOWLEDGED",
    "RESPONSE_INITIATED",
    "RESPONDER_ASSIGNED",
    "EN_ROUTE",
    "ARRIVED",
    "PATIENT_PICKED_UP",
    "HOSPITAL_NOTIFIED",
    "SEARCHING_FOR_RESPONSE",
    "NO_RESOURCE_AVAILABLE",
    "ESCALATED"
];

const emergencySummary = (emergency) => ({
    _id: emergency._id,
    disasterType: emergency.disasterType,
    severity: emergency.severity,
    status: emergency.status,
    location: emergency.location,
    imageUrl: emergency.imageUrl || null,
    description: emergency.description || "",
    affectedPeople: emergency.affectedPeople ?? null,
    immediateDanger: emergency.immediateDanger ?? false,
    assignedRescueTeam: emergency.assignedRescueTeam || null,
    assignedFirefighter: emergency.assignedFirefighter || null,
    assignedPolice: emergency.assignedPolice || null,
    assignedHospital: emergency.assignedHospital || null,
    assignedVehicles: emergency.assignedVehicles || [],
    reportedBy: emergency.reportedBy || null,
    createdAt: emergency.createdAt,
    updatedAt: emergency.updatedAt,
});

const mapRecentUpdate = (update) => ({
    _id: update._id,
    emergency: update.emergency || null,
    updatedByType: update.updatedByType || null,
    status: update.status || null,
    message: update.message || "",
    location: update.location || null,
    createdAt: update.createdAt,
    updatedAt: update.updatedAt,
});

const getRescueTeamSection = async (teamId) => {
    const team = await RescueTeam.findById(teamId)
        .populate("station")
        .populate("members");

    return team;
};

const getFireStationSection = async (user) => {
    if (!user || !user._id) {
        return null;
    }

    if (user.role === "FIREFIGHTER") {
        const firefighter = await Firefighter.findById(user._id).populate("station");

        if (!firefighter) {
            return null;
        }

        const station = await FireStation.findById(firefighter.station?._id || firefighter.station)
            .populate("firefighters")
            .populate("rescueTeams");

        return station;
    }

    if (user.role === "RESCUE_TEAM") {
        const rescueTeam = await RescueTeam.findById(user._id).populate("station");

        if (!rescueTeam) {
            return null;
        }

        const station = await FireStation.findById(rescueTeam.station?._id || rescueTeam.station)
            .populate("firefighters")
            .populate("rescueTeams");

        return station;
    }

    return null;
};

export const getRescueTeamDashboard = async (req, res) => {
    try {
        if (!req.user || req.user.role !== "RESCUE_TEAM") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Rescue Team role required."
            });
        }

        const rescueTeam = await getRescueTeamSection(req.user._id);

        if (!rescueTeam) {
            return res.status(404).json({
                success: false,
                message: "Authenticated rescue team not found."
            });
        }

        const emergencies = await DisasterEmergency.find({
            assignedRescueTeam: rescueTeam._id,
            status: { $ne: "CANCELLED" }
        }).sort({ createdAt: -1 }).limit(50);

        const activeEmergencies = emergencies.filter((emergency) => {
            return ACTIVE_EMERGENCY_STATUSES.includes(emergency.status);
        });

        const emergencyIds = emergencies.map((item) => item._id);
        const recentUpdates = await ResponseUpdate.find({
            emergency: { $in: emergencyIds }
        }).sort({ createdAt: -1 }).limit(20);

        const mappedRecentUpdates = recentUpdates.map(mapRecentUpdate);

        return res.status(200).json({
            success: true,
            dashboard: {
                team: {
                    _id: rescueTeam._id,
                    teamName: rescueTeam.teamName,
                    teamCode: rescueTeam.teamCode,
                    station: rescueTeam.station || null,
                    districtCode: rescueTeam.districtCode || null,
                    specialization: rescueTeam.specialization || [],
                    availability: rescueTeam.availability,
                    currentLocation: rescueTeam.currentLocation || null,
                    currentEmergency: rescueTeam.currentEmergency || null,
                    equipment: rescueTeam.equipment || [],
                    memberCount: rescueTeam.members?.length || 0,
                },
                currentEmergency: rescueTeam.currentEmergency
                    ? emergencies.find((item) => item._id.toString() === rescueTeam.currentEmergency.toString()) || null
                    : null,
                activeEmergencies: activeEmergencies.map(emergencySummary),
                emergencies: emergencies.map(emergencySummary),
                recentUpdates: mappedRecentUpdates,
                stats: {
                    totalAssigned: emergencies.length,
                    active: activeEmergencies.filter((item) => ACTIVE_EMERGENCY_STATUSES.includes(item.status)).length,
                    resolved: emergencies.filter((item) => item.status === "RESOLVED").length,
                    critical: emergencies.filter((item) => item.severity === "CRITICAL").length,
                    available: rescueTeam.availability === "AVAILABLE",
                },
            }
        });
    } catch (error) {
        console.error("Rescue team dashboard error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load rescue team dashboard",
            error: error.message
        });
    }
};

export const getFireStationDashboard = async (req, res) => {
    try {
        if (!req.user || !["FIREFIGHTER", "RESCUE_TEAM"].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Firefighter or Rescue Team role required."
            });
        }

        const station = await getFireStationSection(req.user);

        if (!station) {
            return res.status(404).json({
                success: false,
                message: "No fire station context found for the authenticated user."
            });
        }

        const firefighterIds = (station.firefighters || []).map((member) => member._id);
        const rescueTeamIds = (station.rescueTeams || []).map((team) => team._id);

        const stationEmergencies = await DisasterEmergency.find({
            $or: [
                { assignedFirefighter: { $in: firefighterIds } },
                { assignedRescueTeam: { $in: rescueTeamIds } }
            ],
            status: { $ne: "CANCELLED" }
        }).sort({ createdAt: -1 }).limit(50);

        const emergencyIds = stationEmergencies.map((item) => item._id);
        const dayStart = new Date();
        dayStart.setHours(0, 0, 0, 0);
        const [vehicles, todaysIncidents, dispatchedUnits] = await Promise.all([
            FireVehicle.find({ station: station._id })
                .populate("crew", "name employeeId availability")
                .populate("currentEmergency", "disasterType status location")
                .sort({ vehicleNumber: 1 }),
            DisasterEmergency.countDocuments({
                $or: [
                    { assignedFirefighter: { $in: firefighterIds } },
                    { assignedRescueTeam: { $in: rescueTeamIds } },
                ],
                createdAt: { $gte: dayStart },
                status: { $ne: "CANCELLED" },
            }),
            FireVehicle.countDocuments({ station: station._id, status: "DISPATCHED" }),
        ]);
        const recentUpdates = await ResponseUpdate.find({
            emergency: { $in: emergencyIds }
        }).sort({ createdAt: -1 }).limit(20);

        const mappedRecentUpdates = recentUpdates.map(mapRecentUpdate);

        return res.status(200).json({
            success: true,
            dashboard: {
                station: {
                    _id: station._id,
                    name: station.name,
                    stationCode: station.stationCode,
                    location: station.location || null,
                    address: station.address || null,
                    contactNumber: station.contactNumber || null,
                    status: station.status,
                    firefighterCount: station.firefighters?.length || 0,
                    rescueTeamCount: station.rescueTeams?.length || 0,
                },
                firefighters: (station.firefighters || []).map((member) => ({
                    _id: member._id,
                    name: member.name,
                    employeeId: member.employeeId,
                    availability: member.availability,
                    currentLocation: member.currentLocation || null,
                    currentEmergency: member.currentEmergency || null,
                    specialization: member.specialization || [],
                })),
                rescueTeams: (station.rescueTeams || []).map((team) => ({
                    _id: team._id,
                    teamName: team.teamName,
                    teamCode: team.teamCode,
                    availability: team.availability,
                    districtCode: team.districtCode || null,
                    specialization: team.specialization || [],
                    currentLocation: team.currentLocation || null,
                    currentEmergency: team.currentEmergency || null,
                    memberCount: team.members?.length || 0,
                })),
                vehicles,
                activeEmergencies: stationEmergencies.filter((emergency) => ACTIVE_EMERGENCY_STATUSES.includes(emergency.status)).map(emergencySummary),
                recentUpdates: mappedRecentUpdates,
                stats: {
                    total: stationEmergencies.length,
                    active: stationEmergencies.filter((item) => ACTIVE_EMERGENCY_STATUSES.includes(item.status)).length,
                    resolved: stationEmergencies.filter((item) => item.status === "RESOLVED").length,
                    critical: stationEmergencies.filter((item) => item.severity === "CRITICAL").length,
                    todaysIncidents,
                    dispatchedUnits,
                    availableVehicles: vehicles.filter((vehicle) => vehicle.status === "AVAILABLE").length,
                },
            }
        });
    } catch (error) {
        console.error("Fire station dashboard error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load fire station dashboard",
            error: error.message
        });
    }
};
