import React from "react";
import {
    TouchableOpacity,
    Text,
    StyleSheet,
} from "react-native";

export default function BookingButton({
    title,
    onPress,
    disabled = false,
}) {
    return (
        <TouchableOpacity
            activeOpacity={0.85}
            onPress={onPress}
            disabled={disabled}
            style={[
                styles.button,
                disabled && styles.disabled,
            ]}
        >
            <Text style={styles.text}>{title}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        marginTop: 24,
        backgroundColor: "#DC2626",
        borderRadius: 16,
        height: 58,
        justifyContent: "center",
        alignItems: "center",
    },

    disabled: {
        opacity: 0.5,
    },

    text: {
        color: "#FFFFFF",
        fontSize: 17,
        fontWeight: "700",
    },
});