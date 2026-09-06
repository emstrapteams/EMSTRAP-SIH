import { Pressable, StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";

export default function FloatingEmergencyButton() {
    const router = useRouter();

    return (
        <Pressable
            style={({ pressed }) => [
                styles.button,
                pressed && styles.pressed,
            ]}
            onPress={() => router.push("/emergency")}
        >
            <Text style={styles.text}>Emergency</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({

    button: {
        position: "absolute",
        bottom: 72,
        alignSelf: "center",

        width: 170,
        height: 52,

        borderRadius: 26,

        backgroundColor: "#DC2626",

        justifyContent: "center",
        alignItems: "center",

        borderWidth: 3,
        borderColor: "#FFFFFF",

        shadowColor: "#DC2626",
        shadowOpacity: 0.35,
        shadowRadius: 12,
        shadowOffset: {
            width: 0,
            height: 4,
        },

        elevation: 15,

        zIndex: 9999,
    },

    pressed: {
        opacity: 0.9,
        transform: [{ scale: 0.97 }],
    },

    text: {
        color: "#FFFFFF",
        fontSize: 17,
        fontWeight: "700",
        letterSpacing: 0.5,
    },
});