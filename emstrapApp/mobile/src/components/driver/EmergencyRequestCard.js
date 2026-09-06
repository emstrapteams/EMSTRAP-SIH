import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from "react-native";

export default function EmergencyRequestCard({
    emergency,
    onAccept,
    onDecline,
}) {

    return (
        <View style={styles.card}>

            <Text style={styles.type}>
                {emergency?.requestType}
            </Text>

            <Text style={styles.priority}>
                {emergency?.priority}
            </Text>

            <Text style={styles.address}>
                {emergency?.location?.address}
            </Text>

            <TouchableOpacity
                style={styles.accept}
                onPress={onAccept}
            >
                <Text style={styles.text}>
                    ACCEPT
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.decline}
                onPress={onDecline}
            >
                <Text style={styles.declineText}>
                    DECLINE
                </Text>
            </TouchableOpacity>

        </View>
    );

}

const styles = StyleSheet.create({

    card: {
        margin: 20,
        padding: 20,
        borderRadius: 20,
        backgroundColor: "#fff",
        elevation: 4,
    },

    type: {
        fontSize: 24,
        fontWeight: "700",
    },

    priority: {
        color: "#DC2626",
        marginTop: 8,
        fontWeight: "700",
    },

    address: {
        marginTop: 16,
        color: "#6B7280",
    },

    accept: {
        marginTop: 30,
        backgroundColor: "#16A34A",
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
    },

    decline: {
        marginTop: 12,
        borderWidth: 1,
        borderColor: "#DC2626",
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
    },

    text: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 16,
    },

    declineText: {
        color: "#DC2626",
        fontWeight: "700",
        fontSize: 16,
    }

});