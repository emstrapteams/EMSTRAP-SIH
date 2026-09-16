import { getIO } from "../sockets/socket.js";

export const broadcastDisasterWarning = (warning, targets) => {
    const io = getIO();

    const payload = {
        id: warning._id,
        type: warning.type,
        title: warning.title,
        message: warning.message,
        instructions: warning.instructions || [],
        disasterType: warning.disasterType,
        source: warning.source,
        externalId: warning.externalId,
        areaName: warning.areaName,
        severity: warning.severity,
        active: warning.active,
        expiresAt: warning.expiresAt,
        location: warning.location
    };

    // Citizens
    targets.users.forEach((user) => {
        io.to(`user_${user._id}`).emit(
            "disaster_warning",
            payload
        );
    });

    // Firefighters
    targets.firefighters.forEach((firefighter) => {
        io.to(`firefighter_${firefighter._id}`).emit(
            "disaster_warning",
            payload
        );
    });

    // Rescue Teams
    targets.rescueTeams.forEach((team) => {
        io.to(`rescue_team_${team._id}`).emit(
            "disaster_warning",
            payload
        );
    });

    // Police
    targets.police.forEach((officer) => {
        io.to(`police_${officer._id}`).emit(
            "disaster_warning",
            payload
        );
    });

    // Hospitals
    targets.hospitals.forEach((hospital) => {
        io.to(`hospital_${hospital._id}`).emit(
            "disaster_warning",
            payload
        );
    });

    return {
        users: targets.users.length,
        firefighters: targets.firefighters.length,
        rescueTeams: targets.rescueTeams.length,
        police: targets.police.length,
        hospitals: targets.hospitals.length
    };
};