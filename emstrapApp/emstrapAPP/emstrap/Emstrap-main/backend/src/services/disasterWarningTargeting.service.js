import DisasterUser from "../models/disasterUser.model.js";
import Firefighter from "../models/firefighter.model.js";
import RescueTeam from "../models/rescueTeam.model.js";
import DisasterPolice from "../models/disasterPolice.model.js";
import DisasterHospital from "../models/disasterHospital.model.js";

import { calculateDistanceMeters } from "../utils/distance.js";

const getDistanceKm = (lat1, lon1, lat2, lon2) => {
    return calculateDistanceMeters(
        lat1,
        lon1,
        lat2,
        lon2
    ) / 1000;
};

const isWithinRadius = (location, warningLocation, radiusKm) => {
    if (
        !location ||
        location.latitude == null ||
        location.longitude == null ||
        !warningLocation ||
        warningLocation.latitude == null ||
        warningLocation.longitude == null
    ) {
        return false;
    }

    return (
        getDistanceKm(
            location.latitude,
            location.longitude,
            warningLocation.latitude,
            warningLocation.longitude
        ) <= radiusKm
    );
};

const hasMatchingDistrict = (districtCode, warningDistrictCodes) => {
    if (!districtCode || !warningDistrictCodes?.length) {
        return false;
    }

    return warningDistrictCodes.includes(String(districtCode));
};

const findNearbyUsers = async (
    warningLocation,
    radiusKm,
    districtCodes
) => {
    const users = await DisasterUser.find({
        $or: [
            {
                districtCode: {
                    $in: districtCodes
                }
            },
            {
                "currentLocation.latitude": {
                    $ne: null
                },
                "currentLocation.longitude": {
                    $ne: null
                }
            }
        ]
    }).select(
        "_id name email mobile currentLocation city districtCode"
    );

    return users.filter((user) => {
        const districtMatch = hasMatchingDistrict(
            user.districtCode,
            districtCodes
        );

        const locationMatch =
            warningLocation?.latitude != null &&
            warningLocation?.longitude != null &&
            radiusKm != null &&
            isWithinRadius(
                user.currentLocation,
                warningLocation,
                radiusKm
            );

        return districtMatch || locationMatch;
    });
};

const findNearbyFirefighters = async (
    warningLocation,
    radiusKm,
    districtCodes
) => {
    const firefighters = await Firefighter.find({
        $or: [
            {
                districtCode: {
                    $in: districtCodes
                }
            },
            {
                "currentLocation.latitude": {
                    $ne: null
                },
                "currentLocation.longitude": {
                    $ne: null
                }
            }
        ]
    }).select(
        "_id name employeeId mobile email currentLocation districtCode station rescueTeam"
    );

    return firefighters.filter((firefighter) => {
        const districtMatch = hasMatchingDistrict(
            firefighter.districtCode,
            districtCodes
        );

        const locationMatch =
            warningLocation?.latitude != null &&
            warningLocation?.longitude != null &&
            radiusKm != null &&
            isWithinRadius(
                firefighter.currentLocation,
                warningLocation,
                radiusKm
            );

        return districtMatch || locationMatch;
    });
};

const findNearbyRescueTeams = async (
    warningLocation,
    radiusKm,
    districtCodes
) => {
    const rescueTeams = await RescueTeam.find({
        $or: [
            {
                districtCode: {
                    $in: districtCodes
                }
            },
            {
                "currentLocation.latitude": {
                    $ne: null
                },
                "currentLocation.longitude": {
                    $ne: null
                }
            }
        ]
    }).select(
        "_id teamName teamCode station members currentLocation districtCode availability"
    );

    return rescueTeams.filter((team) => {
        const districtMatch = hasMatchingDistrict(
            team.districtCode,
            districtCodes
        );

        const locationMatch =
            warningLocation?.latitude != null &&
            warningLocation?.longitude != null &&
            radiusKm != null &&
            isWithinRadius(
                team.currentLocation,
                warningLocation,
                radiusKm
            );

        return districtMatch || locationMatch;
    });
};

const findNearbyPolice = async (
    warningLocation,
    radiusKm,
    districtCodes
) => {
    const police = await DisasterPolice.find({
        $or: [
            {
                districtCode: {
                    $in: districtCodes
                }
            },
            {
                "currentLocation.latitude": {
                    $ne: null
                },
                "currentLocation.longitude": {
                    $ne: null
                }
            }
        ]
    }).select(
        "_id name officerId mobile email currentLocation districtCode station unit"
    );

    return police.filter((officer) => {
        const districtMatch = hasMatchingDistrict(
            officer.districtCode,
            districtCodes
        );

        const locationMatch =
            warningLocation?.latitude != null &&
            warningLocation?.longitude != null &&
            radiusKm != null &&
            isWithinRadius(
                officer.currentLocation,
                warningLocation,
                radiusKm
            );

        return districtMatch || locationMatch;
    });
};

const findNearbyHospitals = async (
    warningLocation,
    radiusKm,
    districtCodes
) => {
    const hospitals = await DisasterHospital.find({
        status: {
            $in: [
                "ACTIVE",
                "EMERGENCY_ONLY"
            ]
        },
        emergencyAvailable: true,
        $or: [
            {
                districtCode: {
                    $in: districtCodes
                }
            },
            {
                "location.latitude": {
                    $ne: null
                },
                "location.longitude": {
                    $ne: null
                }
            }
        ]
    }).select(
        "_id name hospitalCode address location districtCode status emergencyAvailable"
    );

    return hospitals.filter((hospital) => {
        const districtMatch = hasMatchingDistrict(
            hospital.districtCode,
            districtCodes
        );

        const hospitalLocation = hospital.location;

        const locationMatch =
            warningLocation?.latitude != null &&
            warningLocation?.longitude != null &&
            radiusKm != null &&
            isWithinRadius(
                hospitalLocation,
                warningLocation,
                radiusKm
            );

        return districtMatch || locationMatch;
    });
};

export const findWarningTargets = async (warning) => {
    const warningLocation = warning.location;
    const radiusKm = warning.location?.radiusKm;

    const districtCodes = (warning.districtCodes || [])
        .map((code) => String(code).trim())
        .filter(Boolean);

    const hasDistrictTarget =
        districtCodes.length > 0;

    const hasLocationTarget =
        warningLocation?.latitude != null &&
        warningLocation?.longitude != null &&
        radiusKm != null &&
        radiusKm > 0;

    if (!hasDistrictTarget && !hasLocationTarget) {
        throw new Error(
            "Warning must contain districtCodes or valid geographic location"
        );
    }

    const [
        users,
        firefighters,
        rescueTeams,
        police,
        hospitals
    ] = await Promise.all([
        findNearbyUsers(
            warningLocation,
            radiusKm,
            districtCodes
        ),
        findNearbyFirefighters(
            warningLocation,
            radiusKm,
            districtCodes
        ),
        findNearbyRescueTeams(
            warningLocation,
            radiusKm,
            districtCodes
        ),
        findNearbyPolice(
            warningLocation,
            radiusKm,
            districtCodes
        ),
        findNearbyHospitals(
            warningLocation,
            radiusKm,
            districtCodes
        )
    ]);

    return {
        users,
        firefighters,
        rescueTeams,
        police,
        hospitals,

        counts: {
            users: users.length,
            firefighters: firefighters.length,
            rescueTeams: rescueTeams.length,
            police: police.length,
            hospitals: hospitals.length
        }
    };
};