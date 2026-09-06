import React from "react";
import {
    View,
    Text,
    StyleSheet,
} from "react-native";

export default function HistoryCard({
    trip,
}) {

    return (

        <View style={styles.card}>

            <View style={styles.header}>

                <Text style={styles.title}>
                    Completed Emergency
                </Text>

                <View style={styles.badge}>

                    <Text style={styles.badgeText}>
                        COMPLETED
                    </Text>

                </View>

            </View>

            <View style={styles.section}>

                <Text style={styles.sectionTitle}>
                    PATIENT
                </Text>

                <Row
                    label="Name"
                    value={trip.user?.name || "-"}
                />

                <Row
                    label="Phone"
                    value={trip.user?.mobile || "-"}
                />

            </View>

            <View style={styles.section}>

                <Text style={styles.sectionTitle}>
                    EMERGENCY
                </Text>

                <Row
                    label="Type"
                    value={
                        trip.emergencyType ||
                        trip.aiAnalysis
                            ?.predictedClass ||
                        "-"
                    }
                />

                <Row
                    label="Hospital"
                    value={
                        trip.hospital
                            ?.hospitalName ||
                        trip.hospital?.name ||
                        "-"
                    }
                />

                <Row
                    label="Severity"
                    value={
                        trip.aiAnalysis
                            ?.severity || "-"
                    }
                />

            </View>

            <View style={styles.section}>

                <Text style={styles.sectionTitle}>
                    COMPLETED
                </Text>

                <Row
                    label="Date"
                    value={new Date(
                        trip.updatedAt
                    ).toLocaleString()}
                />

            </View>

        </View>

    );

}

function Row({
    label,
    value,
}) {

    return (

        <View style={styles.row}>

            <Text style={styles.left}>
                {label}
            </Text>

            <Text style={styles.right}>
                {value}
            </Text>

        </View>

    );

}

const styles = StyleSheet.create({

    card: {

        backgroundColor: "#FFFFFF",

        marginHorizontal: 16,

        marginVertical: 10,

        borderRadius: 18,

        padding: 16,

        elevation: 5,

    },

    header: {

        flexDirection: "row",

        justifyContent: "space-between",

        alignItems: "center",

        marginBottom: 14,

    },

    title: {

        fontSize: 18,

        fontWeight: "700",

        color: "#111827",

    },

    badge: {

        backgroundColor: "#DCFCE7",

        borderRadius: 20,

        paddingHorizontal: 12,

        paddingVertical: 5,

    },

    badgeText: {

        color: "#15803D",

        fontWeight: "700",

        fontSize: 12,

    },

    section: {

        backgroundColor: "#F9FAFB",

        borderRadius: 12,

        padding: 12,

        marginBottom: 12,

    },

    sectionTitle: {

        fontWeight: "700",

        color: "#6B7280",

        marginBottom: 10,

    },

    row: {

        flexDirection: "row",

        justifyContent: "space-between",

        marginBottom: 8,

    },

    left: {

        color: "#6B7280",

        fontSize: 14,

    },

    right: {

        color: "#111827",

        fontWeight: "600",

        flex: 1,

        textAlign: "right",

        marginLeft: 20,

    },

});