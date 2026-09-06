import { useState } from "react";
import {
    Alert,
    Pressable,
    StyleSheet,
    Text,
} from "react-native";

import { cancelEmergencyByUser } from "../../services/api";
export default function CancelButton({
    emergency,
    onCancel,
}) {
    const [loading, setLoading] = useState(false);

    if (!emergency) return null;

    // Don't show button if emergency is already finished
    if (
        emergency.status === "COMPLETED" ||
        emergency.status === "CANCELLED"
    ) {
        return null;
    }

    const handleCancel = () => {
        Alert.alert(
            "Cancel Emergency",
            "Are you sure you want to cancel this emergency request?",
            [
                {
                    text: "No",
                    style: "cancel",
                },
                {
                    text: "Yes",
                    style: "destructive",
                    onPress: confirmCancel,
                },
            ]
        );
    };

    const confirmCancel = async () => {
        try {
            setLoading(true);

            const res = await cancelEmergencyByUser(
                emergency._id
            );

            if (res.success) {
                Alert.alert(
                    "Success",
                    "Emergency cancelled successfully."
                );

                if (onCancel) {
                    onCancel();
                }
            } else {
                Alert.alert(
                    "Error",
                    res.message || "Unable to cancel emergency."
                );
            }
        } catch (err) {
            Alert.alert(
                "Error",
                err?.response?.data?.message ||
                "Failed to cancel emergency."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Pressable
            style={({ pressed }) => [
                styles.button,
                pressed && styles.pressed,
            ]}
            onPress={handleCancel}
            disabled={loading}
        >
            <Text style={styles.text}>
                {loading
                    ? "Cancelling..."
                    : "Cancel Emergency"}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        marginTop: 10,
        backgroundColor: "#DC2626",
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: "center",
    },

    pressed: {
        opacity: 0.8,
    },

    text: {
        color: "#FFFFFF",
        fontSize: 17,
        fontWeight: "700",
    },
});