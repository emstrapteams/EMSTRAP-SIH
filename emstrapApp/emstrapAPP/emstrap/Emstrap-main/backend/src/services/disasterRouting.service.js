const ROUTING_RULES = {
    FLOOD: ["RESCUE_TEAM"],

    LANDSLIDE: ["RESCUE_TEAM"],

    EARTHQUAKE: [
        "RESCUE_TEAM",
        "POLICE",
        "HOSPITAL",
        "ADMIN"
    ],

    CYCLONE_STORM: [
        "RESCUE_TEAM",
        "POLICE"
    ],

    FIRE: [
        "FIREFIGHTER"
    ],

    BUILDING_COLLAPSE: [
        "RESCUE_TEAM",
        "FIREFIGHTER"
    ],

    ACCIDENT: [
        "POLICE",
        "HOSPITAL"
    ],

    MEDICAL_EMERGENCY: [
        "HOSPITAL"
    ],

    OTHER: [
        "ADMIN"
    ]
};


/**
 * Get the responder types required
 * for a particular disaster.
 */
export const getRequiredResponders = (disasterType) => {
    return ROUTING_RULES[disasterType] || ROUTING_RULES.OTHER;
};


/**
 * Build the initial routing decision
 * for an emergency.
 */
export const buildRoutingDecision = (emergency) => {
    const responderTypes = getRequiredResponders(
        emergency.disasterType
    );

    return {
        emergencyId: emergency._id,

        disasterType: emergency.disasterType,

        severity: emergency.severity,

        responderTypes,

        location: emergency.location,

        status: "RESPONSE_INITIATED"
    };
};