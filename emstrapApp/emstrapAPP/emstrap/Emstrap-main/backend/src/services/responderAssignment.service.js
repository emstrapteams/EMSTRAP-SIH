import RescueTeam from "../models/rescueTeam.model.js";
import Firefighter from "../models/firefighter.model.js";
import DisasterPolice from "../models/disasterPolice.model.js";
import DisasterHospital from "../models/disasterHospital.model.js";


/*
 * Find an available rescue team.
 */
export const findAvailableRescueTeam = async () => {
    return await RescueTeam.findOne({
        availability: "AVAILABLE"
    }).sort({ updatedAt: 1 });
};


/*
 * Find an available firefighter.
 */
export const findAvailableFirefighter = async () => {
    return await Firefighter.findOne({
        availability: "AVAILABLE"
    }).sort({ updatedAt: 1 });
};


/*
 * Find available police personnel.
 */
export const findAvailablePolice = async () => {
    return await DisasterPolice.findOne({
        availability: "AVAILABLE"
    }).sort({ updatedAt: 1 });
};


/*
 * Find an available hospital.
 */
export const findAvailableHospital = async () => {
    return await DisasterHospital.findOne({
        status: {
            $in: ["ACTIVE", "EMERGENCY_ONLY"]
        },
        emergencyAvailable: true
    }).sort({ availableBeds: -1 });
};


/*
 * Find available responders according to routing.
 */
export const findAvailableResponders = async (responderTypes) => {
    const responders = {};

    if (responderTypes.includes("RESCUE_TEAM")) {
        responders.rescueTeam =
            await findAvailableRescueTeam();
    }

    if (responderTypes.includes("FIREFIGHTER")) {
        responders.firefighter =
            await findAvailableFirefighter();
    }

    if (responderTypes.includes("POLICE")) {
        responders.police =
            await findAvailablePolice();
    }

    if (responderTypes.includes("HOSPITAL")) {
        responders.hospital =
            await findAvailableHospital();
    }

    return responders;
};


/*
 * Assign an available responder to an emergency.
 */
export const assignResponder = async (
    emergency,
    responderType,
    responder
) => {

    if (!responder) {
        return false;
    }


    if (responderType === "RESCUE_TEAM") {

        emergency.assignedRescueTeam = responder._id;

        responder.availability = "BUSY";
        responder.currentEmergency = emergency._id;

        await responder.save();

        return true;
    }


    if (responderType === "FIREFIGHTER") {

        emergency.assignedFirefighter = responder._id;

        responder.availability = "BUSY";
        responder.currentEmergency = emergency._id;

        await responder.save();

        return true;
    }


    if (responderType === "POLICE") {

        emergency.assignedPolice = responder._id;

        responder.availability = "BUSY";
        responder.currentEmergency = emergency._id;

        await responder.save();

        return true;
    }


    if (responderType === "HOSPITAL") {

        emergency.assignedHospital = responder._id;

        return true;
    }


    return false;
};