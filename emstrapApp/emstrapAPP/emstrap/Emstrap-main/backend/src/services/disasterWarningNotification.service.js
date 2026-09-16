import Notification from "../models/notification.model.js";
import { findWarningTargets } from "./disasterWarningTargeting.service.js";

const RECIPIENT_TYPES = {
    users: "USER",
    firefighters: "FIREFIGHTER",
    rescueTeams: "RESCUE_TEAM",
    police: "POLICE",
    hospitals: "HOSPITAL"
};

const createNotificationsForRecipients = async (
    recipients,
    recipientType,
    warning
) => {
    if (!recipients.length) {
        return 0;
    }

    const recipientIds = recipients.map((recipient) => recipient._id);

    // Find recipients who have already received this warning.
    const existingNotifications = await Notification.find({
        alert: warning._id,
        recipientType,
        recipient: { $in: recipientIds },
        type: "DISASTER_WARNING"
    }).select("recipient");

    const existingRecipientIds = new Set(
        existingNotifications.map((notification) =>
            String(notification.recipient)
        )
    );

    // Only create notifications for recipients who have not
    // already received this warning.
    const newNotifications = recipients
        .filter(
            (recipient) =>
                !existingRecipientIds.has(String(recipient._id))
        )
        .map((recipient) => ({
            recipient: recipient._id,
            recipientType,
            type: "DISASTER_WARNING",
            title: warning.title,
            message: warning.message,
            alert: warning._id,
            read: false
        }));

    if (!newNotifications.length) {
        return 0;
    }

    await Notification.insertMany(newNotifications);

    return newNotifications.length;
};

export const notifyWarningTargets = async (warning) => {
    const targets = await findWarningTargets(warning);

    const [
        users,
        firefighters,
        rescueTeams,
        police,
        hospitals
    ] = await Promise.all([
        createNotificationsForRecipients(
            targets.users,
            RECIPIENT_TYPES.users,
            warning
        ),

        createNotificationsForRecipients(
            targets.firefighters,
            RECIPIENT_TYPES.firefighters,
            warning
        ),

        createNotificationsForRecipients(
            targets.rescueTeams,
            RECIPIENT_TYPES.rescueTeams,
            warning
        ),

        createNotificationsForRecipients(
            targets.police,
            RECIPIENT_TYPES.police,
            warning
        ),

        createNotificationsForRecipients(
            targets.hospitals,
            RECIPIENT_TYPES.hospitals,
            warning
        )
    ]);

    return {
        targets: targets.counts,

        targetRecords: targets,

        notifications: {
            users,
            firefighters,
            rescueTeams,
            police,
            hospitals,
            total:
                users +
                firefighters +
                rescueTeams +
                police +
                hospitals
        }
    };
};