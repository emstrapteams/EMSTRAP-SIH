import React from "react";
import {
    Modal,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Image,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

function formatDate(value) {
    if (!value) return "N/A";

    try {
        return new Date(value).toLocaleString();
    } catch {
        return "N/A";
    }
}

function DetailRow({ label, value }) {
    return (
        <View style={styles.row}>
            <Text style={styles.label}>
                {label}
            </Text>

            <Text style={styles.value}>
                {value ?? "N/A"}
            </Text>
        </View>
    );
}

export default function PoliceCaseModal({
    visible,
    item,
    onClose,
    onTrack,
}) {
    if (!item) return null;

    const confidence =
        item?.aiAnalysis?.confidence != null
            ? `${(
                Number(item.aiAnalysis.confidence) *
                100
            ).toFixed(1)}%`
            : "N/A";

    const evidence = Array.isArray(item?.evidence)
        ? item.evidence
        : [];

    const canTrack =
        !!item?.ambulance &&
        ![
            "COMPLETED",
            "CANCELLED",
            "RESOLVED",
        ].includes(
            String(item?.status || "").toUpperCase()
        );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>
                            Case Details
                        </Text>

                        <Text style={styles.reference}>
                            Ref: {item?._id || "N/A"}
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                    >
                        <Ionicons
                            name="close"
                            size={24}
                            color="#374151"
                        />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={
                        styles.scrollContent
                    }
                >
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            Case Information
                        </Text>

                        <DetailRow
                            label="Status"
                            value={item?.status}
                        />

                        <DetailRow
                            label="Emergency Type"
                            value={
                                item?.requestType ||
                                "EMERGENCY"
                            }
                        />

                        <DetailRow
                            label="City"
                            value={
                                item?.user?.city || "N/A"
                            }
                        />

                        <DetailRow
                            label="Coordinates"
                            value={
                                item?.location
                                    ? `${item.location.latitude}, ${item.location.longitude}`
                                    : "N/A"
                            }
                        />

                        <DetailRow
                            label="Reported At"
                            value={formatDate(
                                item?.createdAt
                            )}
                        />
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            AI Analysis
                        </Text>

                        <DetailRow
                            label="Prediction"
                            value={
                                item?.aiAnalysis
                                    ?.predictedClass ||
                                "N/A"
                            }
                        />

                        <DetailRow
                            label="Severity"
                            value={
                                item?.aiAnalysis
                                    ?.severity || "N/A"
                            }
                        />

                        <DetailRow
                            label="Confidence"
                            value={confidence}
                        />

                        <DetailRow
                            label="Recommended Ambulance"
                            value={
                                item?.aiAnalysis
                                    ?.recommendedAmbulance ||
                                "N/A"
                            }
                        />
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            Ambulance
                        </Text>

                        <DetailRow
                            label="Driver"
                            value={
                                item?.ambulance?.name ||
                                "Not assigned"
                            }
                        />

                        <DetailRow
                            label="Contact"
                            value={
                                item?.ambulance?.mobile ||
                                "N/A"
                            }
                        />

                        <DetailRow
                            label="Vehicle Number"
                            value={
                                item?.ambulance
                                    ?.vehicleNumber ||
                                "N/A"
                            }
                        />
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            Hospital
                        </Text>

                        <DetailRow
                            label="Assigned Hospital"
                            value={
                                item?.hospital?.name ||
                                "Pending Acceptance"
                            }
                        />

                        <DetailRow
                            label="Address"
                            value={
                                item?.hospital?.address ||
                                item?.hospital?.city ||
                                "N/A"
                            }
                        />
                    </View>

                    {evidence.length > 0 && (
                        <View style={styles.section}>
                            <Text
                                style={
                                    styles.sectionTitle
                                }
                            >
                                Evidence
                            </Text>

                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={
                                    false
                                }
                            >
                                {evidence.map(
                                    (evidenceItem, index) => {
                                        const uri =
                                            typeof evidenceItem ===
                                                "string"
                                                ? evidenceItem
                                                : evidenceItem?.url ||
                                                evidenceItem
                                                    ?.imageUrl;

                                        if (!uri) {
                                            return null;
                                        }

                                        return (
                                            <Image
                                                key={`${uri}-${index}`}
                                                source={{
                                                    uri,
                                                }}
                                                style={
                                                    styles.evidenceImage
                                                }
                                            />
                                        );
                                    }
                                )}
                            </ScrollView>
                        </View>
                    )}

                    {canTrack && (
                        <TouchableOpacity
                            style={styles.trackButton}
                            onPress={() => {
                                onClose();
                                onTrack?.(item);
                            }}
                        >
                            <Ionicons
                                name="navigate-outline"
                                size={20}
                                color="#ffffff"
                            />

                            <Text style={styles.trackText}>
                                Live Track Ambulance
                            </Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8fafc",
    },

    header: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,

        backgroundColor: "#ffffff",

        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",

        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },

    title: {
        fontSize: 23,
        fontWeight: "800",
        color: "#111827",
    },

    reference: {
        marginTop: 4,
        fontSize: 11,
        color: "#9ca3af",
    },

    closeButton: {
        width: 42,
        height: 42,
        borderRadius: 12,
        backgroundColor: "#f3f4f6",
        justifyContent: "center",
        alignItems: "center",
    },

    scrollContent: {
        padding: 18,
        paddingBottom: 50,
    },

    section: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 17,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: "#e5e7eb",
    },

    sectionTitle: {
        fontSize: 16,
        fontWeight: "800",
        color: "#111827",
        marginBottom: 12,
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        paddingVertical: 7,
    },

    label: {
        width: "43%",
        fontSize: 13,
        color: "#6b7280",
    },

    value: {
        flex: 1,
        fontSize: 13,
        fontWeight: "600",
        color: "#111827",
        textAlign: "right",
    },

    evidenceImage: {
        width: 210,
        height: 150,
        borderRadius: 12,
        marginRight: 10,
        backgroundColor: "#e5e7eb",
    },

    trackButton: {
        height: 52,
        borderRadius: 13,
        backgroundColor: "#7c3aed",

        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",

        gap: 8,
    },

    trackText: {
        color: "#ffffff",
        fontSize: 15,
        fontWeight: "800",
    },
});