import React from "react";
import {
    View,
    Text,
    StyleSheet,
    Switch,
} from "react-native";

export default function StatusCard({
    driver,
    online,
    onToggle,
}) {

    return (

        <View style={styles.card}>

            <View style={styles.topRow}>

                <View>

                    <Text style={styles.heading}>
                        Driver Status
                    </Text>

                    <Text
                        style={[
                            styles.onlineText,
                            {
                                color: online
                                    ? "#16A34A"
                                    : "#DC2626",
                            },
                        ]}
                    >
                        {online
                            ? "🟢 ONLINE"
                            : "🔴 OFFLINE"}
                    </Text>

                </View>

                <Switch
                    value={online}
                    onValueChange={onToggle}
                    trackColor={{
                        false: "#D1D5DB",
                        true: "#22C55E",
                    }}
                    thumbColor="#FFFFFF"
                />

            </View>

            <Text style={styles.subtitle}>

                {online
                    ? "Ready to receive booking requests"
                    : "You are currently offline"}

            </Text>

            <View style={styles.divider} />

            <View style={styles.infoCard}>

                <View style={styles.infoRow}>

                    <Text style={styles.label}>
                        Driver
                    </Text>

                    <Text style={styles.value}>
                        {driver?.name || "-"}
                    </Text>

                </View>

                <View style={styles.infoRow}>

                    <Text style={styles.label}>
                        Vehicle Number
                    </Text>

                    <Text style={styles.value}>
                        {driver?.vehicleNumber || "-"}
                    </Text>

                </View>

                <View style={styles.infoRow}>

                    <Text style={styles.label}>
                        Current Status
                    </Text>

                    <Text
                        style={[
                            styles.value,
                            {
                                color: online
                                    ? "#16A34A"
                                    : "#DC2626",
                            },
                        ]}
                    >
                        {online
                            ? "Waiting for Booking"
                            : "Offline"}

                    </Text>

                </View>

            </View>

        </View>

    );

}

const styles = StyleSheet.create({

    card: {

        backgroundColor: "#FFFFFF",
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 18,

        padding: 18,

        borderRadius: 18,

        shadowColor: "#000",

        shadowOpacity: 0.08,

        shadowRadius: 10,

        shadowOffset: {

            width: 0,

            height: 4,

        },

        elevation: 5,

    },

    topRow: {

        flexDirection: "row",

        justifyContent: "space-between",

        alignItems: "center",

    },

    heading: {

        fontSize: 20,

        fontWeight: "700",

        color: "#111827",

    },

    onlineText: {

        marginTop: 6,

        fontSize: 15,

        fontWeight: "700",

    },

    subtitle: {

        marginTop: 10,

        color: "#6B7280",

        fontSize: 14,

    },

    divider: {

        height: 1,

        backgroundColor: "#E5E7EB",

        marginVertical: 18,

    },

    infoCard: {

        backgroundColor: "#F9FAFB",

        borderRadius: 12,

        padding: 14,

    },

    infoRow: {

        flexDirection: "row",

        justifyContent: "space-between",

        alignItems: "center",

        marginBottom: 14,

    },

    label: {

        color: "#6B7280",

        fontSize: 15,

    },

    value: {

        color: "#111827",

        fontWeight: "700",

        fontSize: 15,

    },

});