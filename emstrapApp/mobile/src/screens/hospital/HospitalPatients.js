import React, {
    useCallback,
    useMemo,
    useState,
} from "react";

import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    FlatList,
    RefreshControl,
    Modal,
    Image,
    ScrollView,
    Alert,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";

import HospitalLayout from "../../components/hospital/HospitalLayout";

import {
    getAlerts,
    getHospitalPatients,
    resolveHospitalCase,
} from "../../services/api";
export default function HospitalPatients() {
    const [patients, setPatients] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [search, setSearch] =
        useState("");

    const [error, setError] =
        useState("");

    const [selectedPatient, setSelectedPatient] =
        useState(null);
    const [statusFilter, setStatusFilter] =
        useState("TOTAL");
    const mapPatient = (alert) => ({
        ...alert,

        // Patient
        name: alert?.user?.name || alert?.name || "Anonymous",
        patientName: alert?.user?.name || alert?.name || "Anonymous",
        age: alert?.user?.age || alert?.age || "—",
        gender: alert?.user?.gender || alert?.gender || "—",
        mobile: alert?.user?.mobile || "—",
        email: alert?.user?.email || "—",

        // Emergency
        accidentType:
            alert?.emergencyType ||
            alert?.type ||
            alert?.aiAnalysis?.predictedClass ||
            "Emergency",

        status: alert?.status,
        requestType: alert?.requestType,

        // AI
        aiPrediction: alert?.aiAnalysis?.predictedClass || "—",
        severity: alert?.aiAnalysis?.severity || "—",
        confidence: alert?.aiAnalysis?.confidence ?? null,
        recommendedAmbulance:
            alert?.aiAnalysis?.recommendedAmbulance || "—",

        // Duplicate
        duplicateDetected: alert?.duplicateDetected,
        similarityScore: alert?.similarityScore,

        // Location
        latitude: alert?.location?.latitude,
        longitude: alert?.location?.longitude,

        // Images
        imageUrl: alert?.imageUrl,
        evidence: alert?.evidence || [],

        // Ambulance
        ambulanceName: alert?.ambulance?.name || "—",
        ambulanceEmail: alert?.ambulance?.email || "—",
        ambulanceMobile: alert?.ambulance?.mobile || "—",
        vehicleNumber: alert?.ambulance?.vehicleNumber || "—",

        // Hospital
        hospitalName: alert?.hospital?.name || "—",
        hospitalEmail: alert?.hospital?.email || "—",
        hospitalMobile: alert?.hospital?.mobile || "—",
        hospitalAddress: alert?.hospital?.address || "—",
        hospitalCity: alert?.hospital?.city || "—",
        // Hospital Resolution
        hospitalResolved: alert?.hospitalResolved ?? false,
        hospitalResolvedAt: alert?.hospitalResolvedAt,
        hospitalResolvedBy: alert?.hospitalResolvedBy,
        createdAt: alert?.createdAt,
        updatedAt: alert?.updatedAt,
    });
    const fetchPatients = async (
        showLoader = true
    ) => {
        try {
            if (showLoader) {
                setLoading(true);
            }

            setError("");

            const [patientsResponse, alertsResponse] =
                await Promise.all([
                    getHospitalPatients(),
                    getAlerts(),
                ]);

            console.log(
                "HOSPITAL PATIENT RECORDS:",
                patientsResponse
            );

            console.log(
                "FIRST ALERT:",
                JSON.stringify(alertsResponse?.alerts?.[0], null, 2)
            );

            const completedPatients = (
                Array.isArray(patientsResponse)
                    ? patientsResponse
                    : patientsResponse?.data ||
                    patientsResponse?.patients ||
                    []
            ).map(mapPatient);

            const alerts =
                alertsResponse?.alerts || [];

            // Convert active emergency alerts into
            // the same structure used by Patient Records.
            const activePatients = alerts
                .filter(
                    (alert) =>
                        !["COMPLETED", "CANCELLED"].includes(alert.status)
                )
                .map(mapPatient);

            // Avoid duplicates if a record exists
            // in both endpoints.
            const combined = [
                ...activePatients,
                ...completedPatients,
            ];

            const uniquePatients =
                Array.from(
                    new Map(
                        combined.map((patient) => [
                            String(
                                patient._id ||
                                patient.patientId
                            ),
                            patient,
                        ])
                    ).values()
                );

            setPatients(uniquePatients);
        } catch (err) {
            console.log(
                "HOSPITAL PATIENT ERROR:",
                err?.response?.data ||
                err?.message
            );

            setError(
                err?.response?.data?.message ||
                "Failed to load patient records."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };
    const handleResolve = async (id) => {
        try {
            await resolveHospitalCase(id);

            Alert.alert(
                "Success",
                "Patient marked as resolved."
            );

            setSelectedPatient(null);

            fetchPatients(false);
        } catch (err) {
            console.error(err);

            Alert.alert(
                "Error",
                "Unable to mark patient as resolved."
            );
        }
    };
    useFocusEffect(
        useCallback(() => {
            fetchPatients();
        }, [])
    );

    const filteredPatients = useMemo(() => {
        const query =
            search.trim().toLowerCase();

        return patients.filter((patient) => {
            const status = String(
                patient?.status || ""
            ).toUpperCase();

            // STATUS FILTER
            let matchesStatus = true;

            if (statusFilter === "PENDING") {
                matchesStatus =
                    status === "PENDING";
            }

            if (statusFilter === "COMPLETED") {
                matchesStatus =
                    status === "COMPLETED";
            }

            if (statusFilter === "ACTIVE") {
                matchesStatus =
                    status !== "COMPLETED" &&
                    status !== "CANCELLED";
            }

            if (!matchesStatus) {
                return false;
            }

            // SEARCH FILTER
            if (!query) {
                return true;
            }

            const name = String(
                patient?.name ||
                patient?.patientName ||
                ""
            ).toLowerCase();

            const id = String(
                patient?._id ||
                patient?.patientId ||
                ""
            ).toLowerCase();

            return (
                name.includes(query) ||
                id.includes(query)
            );
        });
    }, [patients, search, statusFilter]);

    const stats = useMemo(() => {
        const completed =
            patients.filter(
                (patient) =>
                    String(
                        patient.status
                    ).toUpperCase() ===
                    "COMPLETED"
            ).length;

        const pending =
            patients.filter(
                (patient) =>
                    String(
                        patient.status
                    ).toUpperCase() ===
                    "PENDING"
            ).length;

        const active = patients.filter((patient) => {
            const status = String(patient.status || "").toUpperCase();

            return (
                status !== "COMPLETED" &&
                status !== "CANCELLED"
            );
        }).length;

        return {
            total: patients.length,
            active,
            pending,
            completed,
        };
    }, [patients]);

    const formatDate = (value) => {
        if (!value) {
            return "—";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "—";
        }

        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };

    const renderPatient = ({
        item,
    }) => {
        const name =
            item?.name ||
            item?.patientName ||
            "Patient";

        const patientId = String(
            item?._id ||
            item?.patientId ||
            ""
        );

        return (
            <View style={styles.patientCard}>
                <View
                    style={
                        styles.patientHeader
                    }
                >
                    <View
                        style={styles.avatar}
                    >
                        <Text
                            style={
                                styles.avatarText
                            }
                        >
                            {name
                                .charAt(0)
                                .toUpperCase()}
                        </Text>
                    </View>

                    <View
                        style={
                            styles.patientInfo
                        }
                    >
                        <Text
                            style={
                                styles.patientName
                            }
                        >
                            {name}
                        </Text>

                        <Text
                            style={
                                styles.patientId
                            }
                        >
                            ID:{" "}
                            {patientId
                                ? patientId.slice(
                                    -8
                                )
                                : "—"}
                        </Text>
                    </View>

                    <View
                        style={
                            styles.statusBadge
                        }
                    >
                        <Text
                            style={
                                styles.statusText
                            }
                        >
                            {item.status ||
                                "Unknown"}
                        </Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.details}>
                    <Detail
                        label="Age"
                        value={item.age}
                    />

                    <Detail
                        label="Gender"
                        value={item.gender}
                    />

                    <Detail
                        label="Accident"
                        value={
                            item.accidentType ||
                            item.accident_type
                        }
                    />

                    <Detail
                        label="Admission"
                        value={formatDate(
                            item.createdAt ||
                            item.admissionDate
                        )}
                    />

                    <Detail
                        label="Doctor"
                        value={
                            item.doctorName ||
                            item.doctor
                        }
                    />

                    <Detail
                        label="Ward"
                        value={item.ward}
                    />
                </View>

                <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() =>
                        setSelectedPatient(item)
                    }
                >
                    <Ionicons
                        name="eye-outline"
                        size={17}
                        color="#ffffff"
                    />

                    <Text
                        style={
                            styles.viewButtonText
                        }
                    >
                        View Details
                    </Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (

        <HospitalLayout
            title="Patient Records"
            description="Manage and view historical patient records and analytics"
            scroll={false}
        >
            <View style={styles.container}>
                {/* Stats */}
                <View style={styles.statsRow}>
                    <Stat
                        label="Total"
                        value={stats.total}
                        active={
                            statusFilter === "TOTAL"
                        }
                        onPress={() =>
                            setStatusFilter("TOTAL")
                        }
                    />

                    <Stat
                        label="Active"
                        value={stats.active}
                        active={
                            statusFilter === "ACTIVE"
                        }
                        onPress={() =>
                            setStatusFilter("ACTIVE")
                        }
                    />

                    <Stat
                        label="Pending"
                        value={stats.pending}
                        active={
                            statusFilter === "PENDING"
                        }
                        onPress={() =>
                            setStatusFilter("PENDING")
                        }
                    />

                    <Stat
                        label="Completed"
                        value={stats.completed}
                        active={
                            statusFilter === "COMPLETED"
                        }
                        onPress={() =>
                            setStatusFilter("COMPLETED")
                        }
                    />
                </View>

                {/* Search */}
                <View
                    style={
                        styles.searchContainer
                    }
                >
                    <Ionicons
                        name="search-outline"
                        size={20}
                        color="#94a3b8"
                    />

                    <TextInput
                        style={styles.searchInput}
                        placeholder="Name or Patient ID..."
                        placeholderTextColor="#94a3b8"
                        value={search}
                        onChangeText={setSearch}
                    />

                    {search ? (
                        <TouchableOpacity
                            onPress={() =>
                                setSearch("")
                            }
                        >
                            <Ionicons
                                name="close-circle"
                                size={20}
                                color="#94a3b8"
                            />
                        </TouchableOpacity>
                    ) : null}
                </View>

                <Text style={styles.count}>
                    Patient Records (
                    {filteredPatients.length})
                </Text>

                {loading ? (
                    <View
                        style={
                            styles.centerState
                        }
                    >
                        <ActivityIndicator
                            size="large"
                            color="#6366f1"
                        />

                        <Text
                            style={
                                styles.stateText
                            }
                        >
                            Loading patient
                            records...
                        </Text>
                    </View>
                ) : error ? (
                    <View
                        style={
                            styles.centerState
                        }
                    >
                        <Ionicons
                            name="alert-circle-outline"
                            size={42}
                            color="#ef4444"
                        />

                        <Text
                            style={
                                styles.stateText
                            }
                        >
                            {error}
                        </Text>

                        <TouchableOpacity
                            style={
                                styles.retryButton
                            }
                            onPress={() =>
                                fetchPatients()
                            }
                        >
                            <Text
                                style={
                                    styles.retryText
                                }
                            >
                                Try Again
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <FlatList
                        data={
                            filteredPatients
                        }
                        keyExtractor={(
                            item,
                            index
                        ) =>
                            String(
                                item?._id ||
                                item?.patientId ||
                                index
                            )
                        }
                        renderItem={
                            renderPatient
                        }
                        showsVerticalScrollIndicator={
                            false
                        }
                        contentContainerStyle={
                            styles.list
                        }
                        refreshControl={
                            <RefreshControl
                                refreshing={
                                    refreshing
                                }
                                onRefresh={() => {
                                    setRefreshing(
                                        true
                                    );

                                    fetchPatients(
                                        false
                                    );
                                }}
                            />
                        }
                        ListEmptyComponent={
                            <View
                                style={
                                    styles.centerState
                                }
                            >
                                <Ionicons
                                    name="search-outline"
                                    size={42}
                                    color="#94a3b8"
                                />

                                <Text
                                    style={
                                        styles.stateText
                                    }
                                >
                                    No patient
                                    records found.
                                </Text>
                            </View>
                        }
                    />
                )}
            </View>
            <PatientDetailsModal
                patient={selectedPatient}
                onClose={() => setSelectedPatient(null)}
                onResolve={handleResolve}
            />
        </HospitalLayout>
    );
}
function PatientDetailsModal({
    patient,
    onClose,
    onResolve,
}) {
    if (!patient) {
        return null;
    }

    const name =
        patient.name ||
        patient.patientName ||
        "Patient";

    const patientId = String(
        patient._id ||
        patient.patientId ||
        ""
    );

    const admissionDate =
        patient.createdAt ||
        patient.admissionDate;

    const formattedDate = admissionDate
        ? new Date(
            admissionDate
        ).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
        : "—";

    const notes =
        patient.description ||
        patient.notes ||
        patient.treatmentNotes;

    return (
        <Modal
            visible={!!patient}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View
                    style={
                        styles.modalContainer
                    }
                >
                    {/* Header */}
                    <View
                        style={
                            styles.modalHeader
                        }
                    >
                        <View
                            style={
                                styles.modalPatient
                            }
                        >
                            <View
                                style={
                                    styles.modalAvatar
                                }
                            >
                                <Text
                                    style={
                                        styles.modalAvatarText
                                    }
                                >
                                    {name
                                        .charAt(0)
                                        .toUpperCase()}
                                </Text>
                            </View>

                            <View
                                style={{
                                    flex: 1,
                                }}
                            >
                                <Text
                                    style={
                                        styles.modalName
                                    }
                                >
                                    {name}
                                </Text>

                                <Text
                                    style={
                                        styles.modalId
                                    }
                                >
                                    ID:{" "}
                                    {patientId ||
                                        "—"}
                                </Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={
                                styles.closeButton
                            }
                            onPress={onClose}
                        >
                            <Ionicons
                                name="close"
                                size={23}
                                color="#475569"
                            />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={
                            false
                        }
                        contentContainerStyle={
                            styles.modalContent
                        }
                    >
                        {/* Status */}
                        <View
                            style={
                                styles.modalStatus
                            }
                        >
                            <View>
                                <Text
                                    style={
                                        styles.modalFieldLabel
                                    }
                                >
                                    STATUS
                                </Text>

                                <Text
                                    style={
                                        styles.modalStatusText
                                    }
                                >
                                    {patient.status ||
                                        "Unknown"}
                                </Text>
                            </View>

                            <Ionicons
                                name="pulse-outline"
                                size={26}
                                color="#10b981"
                            />
                        </View>

                        {/* Evidence image */}
                        {(patient.imageUrl || patient.evidence?.length > 0) && (
                            <View style={styles.imageSection}>
                                <Text style={styles.sectionTitle}>
                                    Evidence
                                </Text>

                                {patient.imageUrl && (
                                    <Image
                                        source={{ uri: patient.imageUrl }}
                                        style={styles.evidenceImage}
                                        resizeMode="cover"
                                    />
                                )}

                                {patient.evidence?.map((item, index) => (
                                    <Image
                                        key={index}
                                        source={{ uri: item.imageUrl }}
                                        style={[
                                            styles.evidenceImage,
                                            { marginTop: 12 },
                                        ]}
                                        resizeMode="cover"
                                    />
                                ))}
                            </View>
                        )}

                        <Text
                            style={
                                styles.sectionTitle
                            }
                        >
                            Patient Information
                        </Text>

                        <View style={styles.modalGrid}>
                            <ModalField
                                label="Name"
                                value={name}
                            />

                            <ModalField
                                label="Phone"
                                value={patient.mobile}
                            />

                            <ModalField
                                label="Email"
                                value={patient.email}
                            />

                            <ModalField
                                label="Age"
                                value={patient.age}
                            />

                            <ModalField
                                label="Gender"
                                value={patient.gender}
                            />

                            <ModalField
                                label="Emergency Type"
                                value={patient.accidentType}
                            />

                            <ModalField
                                label="Request Type"
                                value={patient.requestType}
                            />

                            <ModalField
                                label="Admission Date"
                                value={formattedDate}
                            />
                        </View>
                        <Text style={styles.sectionTitle}>AI Analysis</Text>

                        <View style={styles.modalGrid}>
                            <ModalField
                                label="Prediction"
                                value={patient.aiPrediction}
                            />

                            <ModalField
                                label="Severity"
                                value={patient.severity}
                            />

                            <ModalField
                                label="Confidence"
                                value={
                                    patient.confidence != null
                                        ? `${(patient.confidence * 100).toFixed(1)}%`
                                        : "—"
                                }
                            />

                            <ModalField
                                label="Recommended Ambulance"
                                value={patient.recommendedAmbulance}
                            />
                        </View>
                        <Text style={styles.sectionTitle}>
                            Location
                        </Text>

                        <View style={styles.modalGrid}>
                            <ModalField
                                label="Latitude"
                                value={patient.latitude}
                            />

                            <ModalField
                                label="Longitude"
                                value={patient.longitude}
                            />
                        </View>
                        <Text style={styles.sectionTitle}>
                            Ambulance Details
                        </Text>

                        <View style={styles.modalGrid}>
                            <ModalField
                                label="Driver"
                                value={patient.ambulanceName}
                            />

                            <ModalField
                                label="Phone"
                                value={patient.ambulanceMobile}
                            />

                            <ModalField
                                label="Email"
                                value={patient.ambulanceEmail}
                            />

                            <ModalField
                                label="Vehicle Number"
                                value={patient.vehicleNumber}
                            />
                        </View>

                        <Text style={styles.sectionTitle}>
                            Hospital Details
                        </Text>

                        <View style={styles.modalGrid}>
                            <ModalField
                                label="Hospital"
                                value={patient.hospitalName}
                            />

                            <ModalField
                                label="Phone"
                                value={patient.hospitalMobile}
                            />

                            <ModalField
                                label="Email"
                                value={patient.hospitalEmail}
                            />

                            <ModalField
                                label="City"
                                value={patient.hospitalCity}
                            />

                            <ModalField
                                label="Address"
                                value={patient.hospitalAddress}
                            />
                        </View>
                        {patient.duplicateDetected && (
                            <>
                                <Text style={styles.sectionTitle}>
                                    Duplicate Detection
                                </Text>

                                <View style={styles.modalGrid}>
                                    <ModalField
                                        label="Duplicate"
                                        value="YES"
                                    />

                                    <ModalField
                                        label="Similarity"
                                        value={`${patient.similarityScore}%`}
                                    />
                                </View>
                            </>
                        )}
                        {notes ? (
                            <View
                                style={
                                    styles.notesSection
                                }
                            >
                                <Text
                                    style={
                                        styles.sectionTitle
                                    }
                                >
                                    Treatment Notes
                                </Text>

                                <View
                                    style={
                                        styles.notesBox
                                    }
                                >
                                    <Text
                                        style={
                                            styles.notesText
                                        }
                                    >
                                        {notes}
                                    </Text>
                                </View>
                            </View>
                        ) : null}
                        {!patient.hospitalResolved && (
                            <TouchableOpacity
                                style={styles.resolveButton}
                                onPress={() => onResolve(patient._id)}
                            >
                                <Ionicons
                                    name="checkmark-circle"
                                    size={22}
                                    color="#fff"
                                />

                                <Text style={styles.resolveButtonText}>
                                    Mark as Resolved
                                </Text>
                            </TouchableOpacity>
                        )}
                        <Text
                            style={[
                                styles.sectionTitle,
                                { marginTop: 20 },
                            ]}
                        >
                            Hospital Status
                        </Text>

                        <View style={styles.modalGrid}>
                            <ModalField
                                label="Status"
                                value={
                                    patient.hospitalResolved
                                        ? "Resolved"
                                        : "Pending"
                                }
                            />

                            <ModalField
                                label="Resolved On"
                                value={
                                    patient.hospitalResolvedAt
                                        ? new Date(
                                            patient.hospitalResolvedAt
                                        ).toLocaleString()
                                        : "—"
                                }
                            />
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

function ModalField({
    label,
    value,
}) {
    return (
        <View style={styles.modalField}>
            <Text
                style={
                    styles.modalFieldLabel
                }
            >
                {label}
            </Text>

            <Text
                style={
                    styles.modalFieldValue
                }
            >
                {value || "—"}
            </Text>
        </View>
    );
}
function Stat({
    label,
    value,
    active,
    onPress,
}) {
    return (
        <TouchableOpacity
            style={[
                styles.statCard,
                active &&
                styles.statCardActive,
            ]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <Text
                style={[
                    styles.statValue,
                    active &&
                    styles.statValueActive,
                ]}
            >
                {value}
            </Text>

            <Text
                style={[
                    styles.statLabel,
                    active &&
                    styles.statLabelActive,
                ]}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
}
function Detail({ label, value }) {
    return (
        <View style={styles.detail}>
            <Text style={styles.detailLabel}>
                {label}
            </Text>

            <Text
                style={styles.detailValue}
                numberOfLines={1}
            >
                {value || "—"}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    statsRow: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 16,
    },

    statCard: {
        flex: 1,
        backgroundColor: "#ffffff",
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#e2e8f0",
    },

    statValue: {
        fontSize: 20,
        fontWeight: "900",
        color: "#0f172a",
    },

    statLabel: {
        marginTop: 3,
        fontSize: 10,
        fontWeight: "700",
        color: "#64748b",
    },

    searchContainer: {
        height: 48,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#e2e8f0",
        borderRadius: 12,
        marginBottom: 16,
    },

    searchInput: {
        flex: 1,
        marginLeft: 9,
        fontSize: 14,
        color: "#0f172a",
    },

    count: {
        marginBottom: 12,
        fontSize: 14,
        fontWeight: "800",
        color: "#334155",
    },

    list: {
        paddingBottom: 40,
    },

    patientCard: {
        padding: 15,
        marginBottom: 12,
        backgroundColor: "#ffffff",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#e2e8f0",
    },

    patientHeader: {
        flexDirection: "row",
        alignItems: "center",
    },

    avatar: {
        width: 42,
        height: 42,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#eef2ff",
    },

    avatarText: {
        fontSize: 17,
        fontWeight: "900",
        color: "#4f46e5",
    },

    patientInfo: {
        flex: 1,
        marginLeft: 11,
    },

    patientName: {
        fontSize: 15,
        fontWeight: "800",
        color: "#0f172a",
    },

    patientId: {
        marginTop: 3,
        fontSize: 11,
        color: "#64748b",
    },

    statusBadge: {
        paddingHorizontal: 9,
        paddingVertical: 5,
        borderRadius: 20,
        backgroundColor: "#ecfdf5",
    },

    statusText: {
        fontSize: 10,
        fontWeight: "800",
        color: "#059669",
    },

    divider: {
        height: 1,
        marginVertical: 13,
        backgroundColor: "#f1f5f9",
    },

    details: {
        flexDirection: "row",
        flexWrap: "wrap",
    },

    detail: {
        width: "50%",
        marginBottom: 12,
    },

    detailLabel: {
        fontSize: 9,
        fontWeight: "800",
        color: "#94a3b8",
        textTransform: "uppercase",
    },

    detailValue: {
        marginTop: 3,
        paddingRight: 8,
        fontSize: 12,
        fontWeight: "600",
        color: "#334155",
    },

    viewButton: {
        height: 40,
        marginTop: 3,
        borderRadius: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        backgroundColor: "#4f46e5",
    },

    viewButtonText: {
        fontSize: 12,
        fontWeight: "800",
        color: "#ffffff",
    },

    centerState: {
        flex: 1,
        minHeight: 220,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },

    stateText: {
        marginTop: 10,
        textAlign: "center",
        fontSize: 13,
        color: "#64748b",
    },

    retryButton: {
        marginTop: 15,
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: "#4f46e5",
    },

    retryText: {
        color: "#ffffff",
        fontWeight: "800",
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(15,23,42,0.55)",
    },

    modalContainer: {
        maxHeight: "88%",
        backgroundColor: "#ffffff",
        borderTopLeftRadius: 26,
        borderTopRightRadius: 26,
    },

    modalHeader: {
        flexDirection: "row",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
    },

    modalPatient: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
    },

    modalAvatar: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
        backgroundColor: "#4f46e5",
    },

    modalAvatarText: {
        fontSize: 19,
        fontWeight: "900",
        color: "#ffffff",
    },

    modalName: {
        fontSize: 18,
        fontWeight: "900",
        color: "#0f172a",
    },

    modalId: {
        marginTop: 3,
        fontSize: 10,
        color: "#64748b",
    },

    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f1f5f9",
    },

    modalContent: {
        padding: 20,
        paddingBottom: 40,
    },

    modalStatus: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 15,
        marginBottom: 22,
        borderRadius: 14,
        backgroundColor: "#ecfdf5",
    },

    modalStatusText: {
        marginTop: 4,
        fontSize: 15,
        fontWeight: "900",
        color: "#059669",
    },

    sectionTitle: {
        marginBottom: 12,
        fontSize: 14,
        fontWeight: "900",
        color: "#0f172a",
    },

    imageSection: {
        marginBottom: 22,
    },

    evidenceImage: {
        width: "100%",
        height: 210,
        borderRadius: 16,
        backgroundColor: "#f1f5f9",
    },

    modalGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
    },

    modalField: {
        width: "50%",
        paddingRight: 12,
        marginBottom: 20,
    },

    modalFieldLabel: {
        fontSize: 9,
        fontWeight: "900",
        color: "#94a3b8",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },

    modalFieldValue: {
        marginTop: 5,
        fontSize: 13,
        fontWeight: "700",
        color: "#334155",
    },

    notesSection: {
        marginTop: 4,
    },

    notesBox: {
        padding: 15,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        backgroundColor: "#f8fafc",
    },

    notesText: {
        fontSize: 13,
        lineHeight: 20,
        color: "#475569",
    },
    resolveButton: {
        marginTop: 20,
        height: 50,
        borderRadius: 12,
        backgroundColor: "#16a34a",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },

    resolveButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
        marginLeft: 8,
    },
});