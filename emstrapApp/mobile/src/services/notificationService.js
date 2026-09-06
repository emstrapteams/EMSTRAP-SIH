import * as Notifications from "expo-notifications";
import * as Haptics from "expo-haptics";
import { Audio } from "expo-av";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});

let emergencySound = null;
let bookingSound = null;

export async function initializeNotifications() {

    await Notifications.requestPermissionsAsync();

    await Notifications.setNotificationChannelAsync(
        "emstrap-alerts",
        {
            name: "EMSTRAP Alerts",
            importance:
                Notifications.AndroidImportance.MAX,
            vibrationPattern: [
                0,
                500,
                250,
                500,
            ],
            enableVibrate: true,
            lockscreenVisibility:
                Notifications.AndroidNotificationVisibility.PUBLIC,
        }
    );

    emergencySound = new Audio.Sound();

    await emergencySound.loadAsync(
        require("../assets/sounds/emergency-alert.mp3")
    );

    bookingSound = new Audio.Sound();

    await bookingSound.loadAsync(
        require("../assets/sounds/private-driver-alert.mp3")
    );
}

export async function notifyEmergency() {

    try {

        await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Error
        );

        if (emergencySound) {

            await emergencySound.replayAsync();

        }

        await Notifications.scheduleNotificationAsync({

            content: {

                title: "🚨 EMSTRAP",

                body: "New emergency nearby",

                sound: false,

            },

            trigger: null,

        });

    } catch (err) {

        console.log(err);

    }

}

export async function notifyBooking() {

    try {

        await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success
        );

        if (bookingSound) {

            await bookingSound.replayAsync();

        }

        await Notifications.scheduleNotificationAsync({

            content: {

                title: "🚖 EMSTRAP",

                body: "New booking request",

                sound: false,

            },

            trigger: null,

        });

    } catch (err) {

        console.log(err);

    }

}