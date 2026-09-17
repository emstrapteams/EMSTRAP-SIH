import FireStation from "../models/fireStation.model.js";
import Firefighter from "../models/firefighter.model.js";
import RescueTeam from "../models/rescueTeam.model.js";

export const getStationForDisasterUser = async (user) => {
    if (!user?._id) return null;

    if (user.role === "FIREFIGHTER") {
        const firefighter = await Firefighter.findById(user._id).select("station");
        return firefighter?.station ? FireStation.findById(firefighter.station) : null;
    }

    if (user.role === "RESCUE_TEAM") {
        const team = await RescueTeam.findById(user._id).select("station");
        return team?.station ? FireStation.findById(team.station) : null;
    }

    return null;
};

export const stationResponderIds = (station) => ({
    firefighterIds: (station?.firefighters || []).map((id) => id.toString()),
    rescueTeamIds: (station?.rescueTeams || []).map((id) => id.toString()),
});