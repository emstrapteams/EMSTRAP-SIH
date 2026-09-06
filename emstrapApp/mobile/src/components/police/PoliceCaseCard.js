import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

const STATUS_CONFIG = {
    PENDING: {
        label: "Pending",
        color: "#d97706",
        background: "#fffbeb",
    },

    AMBULANCE_ACCEPTED: {
        label: "In Progress",
        color: "#dc2626",
        background: "#fef2f2",
    },

    COMPLETED: {
        label: "Resolved",
        color: "#16a34a",
        background: "#f0fdf4",
    },

    CANCELLED: {
        label: "Cancelled",
        color: "#475569",
        background: "#f1f5f9",
    },
};

function formatDate(value) {
    if (!value) return "N/A";

    try {
        return new Date(value).toLocaleString();
    } catch {
        return "N/A";
    }
}

export default function PoliceCaseCard({
    item,
    onDetails,
    onTrack,
    onResolve,
}) {
    const status =
        STATUS_CONFIG[item?.status] || {
            label: item?.status || "Unknown",
            color: "#475569",
            background: "#f1f5f9",
        };

    const prediction =
        item?.aiAnalysis?.predictedClass ||
        "N/A";

    const severity =
        item?.aiAnalysis?.severity ||
        "N/A";

    const confidence =
        item?.aiAnalysis?.confidence != null
            ? `${(
                Number(
                    item.aiAnalysis.confidence
                ) * 100
            ).toFixed(1)}%`
            : "N/A";

    const latitude =
        item?.location?.latitude;

    const longitude =
        item?.location?.longitude;

    const canTrack =
        !!item?.ambulance &&
        ![
            "COMPLETED",
            "CANCELLED",
            "RESOLVED",
        ].includes(
            String(
                item?.status || ""
            ).toUpperCase()
        );

    const canResolve =
        ![
            "COMPLETED",
            "CANCELLED",
        ].includes(item?.status);

    return (
        <View style={styles.card}>
            {/* Top row */}

            <View style={styles.topRow}>
                <View style={styles.caseIcon}>
                    <Ionicons
                        name="warning"
                        size={21}
                        color="#dc2626"
                    />
                </View>

                <View style={styles.titleArea}>
                    <Text style={styles.caseTitle}>
                        {item?.requestType ||
                            "EMERGENCY"}
                    </Text>

                    <Text style={styles.reference}>
                        Ref:{" "}
                        {item?._id
                            ? item._id.slice(-8)
                            : "N/A"}
                    </Text>
                </View>

                <View
                    style={[
                        styles.statusBadge,
                        {
                            backgroundColor:
                                status.background,
                        },
                    ]}
                >
                    <Text
                        style={[
                            styles.statusText,
                            {
                                color:
                                    status.color,
                            },
                        ]}
                    >
                        {status.label}
                    </Text>
                </View>
            </View>

            <View style={styles.divider} />

            {/* AI */}

            <Text style={styles.groupTitle}>
                AI Analysis
            </Text>

            <View style={styles.infoRow}>
                <Text style={styles.label}>
                    Prediction
                </Text>

                <Text style={styles.value}>
                    {prediction}
                </Text>
            </View>

            <View style={styles.infoRow}>
                <Text style={styles.label}>
                    Severity
                </Text>

                <Text style={styles.value}>
                    {severity}
                </Text>
            </View>

            <View style={styles.infoRow}>
                <Text style={styles.label}>
                    Confidence
                </Text>

                <Text style={styles.value}>
                    {confidence}
                </Text>
            </View>

            <View style={styles.divider} />

            {/* Location */}

            <View style={styles.iconRow}>
                <Ionicons
                    name="location-outline"
                    size={18}
                    color="#6b7280"
                />

                <Text style={styles.location}>
                    {item?.user?.city ||
                        item?.location?.address ||
                        "Location unavailable"}
                </Text>
            </View>

            {latitude != null &&
                longitude != null ? (
                <Text style={styles.coordinates}>
                    {latitude}, {longitude}
                </Text>
            ) : null}

            <View style={styles.iconRow}>
                <Ionicons
                    name="time-outline"
                    size={18}
                    color="#6b7280"
                />

                <Text style={styles.location}>
                    {formatDate(
                        item?.createdAt
                    )}
                </Text>
            </View>

            <View style={styles.divider} />

            {/* Actions */}

            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.detailsButton}
                    onPress={() =>
                        onDetails?.(item)
                    }
                >
                    <Ionicons
                        name="document-text-outline"
                        size={17}
                        color="#2563eb"
                    />

                    <Text style={styles.detailsText}>
                        Details
                    </Text>
                </TouchableOpacity>

                {canTrack && (
                    <TouchableOpacity
                        style={styles.trackButton}
                        onPress={() =>
                            onTrack?.(item)
                        }
                    >
                        <Ionicons
                            name="navigate-outline"
                            size={17}
                            color="#7c3aed"
                        />

                        <Text
                            style={
                                styles.trackText
                            }
                        >
                            Live Track
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {canResolve && (
                <TouchableOpacity
                    style={styles.resolveButton}
                    onPress={() =>
                        onResolve?.(item)
                    }
                >
                    <Ionicons
                        name="checkmark-circle-outline"
                        size={19}
                        color="#ffffff"
                    />

                    <Text style={styles.resolveText}>
                        Mark Resolved
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#ffffff",
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        padding: 17,
        marginBottom: 14,

        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 7,
        shadowOffset: {
            width: 0,
            height: 2,
        },

        elevation: 2,
    },

    topRow: {
        flexDirection: "row",
        alignItems: "center",
    },

    caseIcon: {
        width: 42,
        height: 42,
        borderRadius: 12,
        backgroundColor: "#fef2f2",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 11,
    },

    titleArea: {
        flex: 1,
    },

    caseTitle: {
        fontSize: 16,
        fontWeight: "800",
        color: "#111827",
    },

    reference: {
        marginTop: 3,
        fontSize: 11,
        color: "#9ca3af",
    },

    statusBadge: {
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },

    statusText: {
        fontSize: 11,
        fontWeight: "800",
    },

    divider: {
        height: 1,
        backgroundColor: "#f1f5f9",
        marginVertical: 14,
    },

    groupTitle: {
        fontSize: 12,
        fontWeight: "800",
        color: "#9ca3af",
        textTransform: "uppercase",
        marginBottom: 8,
    },

    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 4,
    },

    label: {
        fontSize: 13,
        color: "#6b7280",
    },

    value: {
        maxWidth: "58%",
        fontSize: 13,
        fontWeight: "700",
        color: "#111827",
        textAlign: "right",
    },

    iconRow: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 4,
    },

    location: {
        flex: 1,
        marginLeft: 8,
        fontSize: 13,
        color: "#4b5563",
    },

    coordinates: {
        marginLeft: 26,
        marginBottom: 5,
        fontSize: 11,
        color: "#9ca3af",
    },

    actions: {
        flexDirection: "row",
        gap: 10,
    },

    detailsButton: {
        flex: 1,
        height: 43,
        borderRadius: 11,
        backgroundColor: "#eff6ff",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
    },

    detailsText: {
        color: "#2563eb",
        fontSize: 13,
        fontWeight: "700",
    },

    trackButton: {
        flex: 1,
        height: 43,
        borderRadius: 11,
        backgroundColor: "#f5f3ff",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
    },

    trackText: {
        color: "#7c3aed",
        fontSize: 13,
        fontWeight: "700",
    },

    resolveButton: {
        marginTop: 10,
        height: 45,
        borderRadius: 11,
        backgroundColor: "#16a34a",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 7,
    },

    resolveText: {
        color: "#ffffff",
        fontSize: 14,
        fontWeight: "800",
    },
});