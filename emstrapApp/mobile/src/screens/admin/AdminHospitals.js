import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    Alert,
    TouchableOpacity,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import AdminLayout from "../../components/admin/AdminLayout";
import HospitalCard from "../../components/admin/HospitalCard";
import HospitalFormModal from "../../components/admin/HospitalFormModal";

import {
    getHospitals,
    addHospital,
    updateHospital,
    deleteHospital,
} from "../../services/hospitalApi";

export default function AdminHospitals() {
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingHospital, setEditingHospital] = useState(null);
    const fetchHospitals = async (silent = false) => {
        try {
            if (!silent) setLoading(true);

            const res = await getHospitals();

            if (res.success) {
                setHospitals(res.hospitals || []);
            }
        } catch (err) {
            Alert.alert(
                "Error",
                err?.response?.data?.message ||
                "Failed to load hospitals"
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchHospitals();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchHospitals(true);
    };

    const handleView = (hospital) => {
        Alert.alert(
            hospital.name,
            `City: ${hospital.city}

Beds: ${hospital.emergencyBeds}

Phone: ${hospital.mobile}

Email: ${hospital.email}`
        );
    };

    const handleEdit = (hospital) => {
        setEditingHospital(hospital);
        setModalVisible(true);
    };

    const handleDelete = (hospital) => {
        Alert.alert(
            "Delete Hospital",
            `Delete ${hospital.name}?`,
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteHospital(hospital._id);

                            setHospitals((prev) =>
                                prev.filter(
                                    (h) => h._id !== hospital._id
                                )
                            );
                        } catch {
                            Alert.alert(
                                "Error",
                                "Failed to delete hospital"
                            );
                        }
                    },
                },
            ]
        );
    };

    const handleSaveHospital = async (form) => {
        try {
            if (editingHospital) {
                const res = await updateHospital(
                    editingHospital._id,
                    form
                );

                if (res.success) {
                    setHospitals((prev) =>
                        prev.map((h) =>
                            h._id === editingHospital._id
                                ? res.hospital
                                : h
                        )
                    );
                }
            } else {
                const res = await addHospital(form);

                if (res.success) {
                    setHospitals((prev) => [
                        res.hospital,
                        ...prev,
                    ]);
                }
            }

            setModalVisible(false);
            setEditingHospital(null);

        } catch (err) {
            Alert.alert(
                "Error",
                err?.response?.data?.message ??
                "Unable to save hospital."
            );
        }
    };

    return (
        <AdminLayout title="Hospital Management">
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                    setEditingHospital(null);
                    setModalVisible(true);
                }}
            >
                <Ionicons
                    name="add-circle-outline"
                    size={22}
                    color="#fff"
                />

                <Text style={styles.addButtonText}>
                    Add Hospital
                </Text>
            </TouchableOpacity>
            {loading ? (
                <View style={styles.loader}>
                    <ActivityIndicator
                        size="large"
                        color="#2563eb"
                    />
                </View>
            ) : (
                <>
                    <FlatList
                        data={hospitals}
                        keyExtractor={(item) => item._id}
                        renderItem={({ item }) => (
                            <HospitalCard
                                hospital={item}
                                onView={handleView}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        )}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                            />
                        }
                        ListEmptyComponent={
                            <Text style={styles.empty}>
                                No hospitals found.
                            </Text>
                        }
                        contentContainerStyle={{
                            paddingVertical: 12,
                            paddingBottom: 100,
                        }}
                    />

                    {/* Floating Add Button */}
                    <TouchableOpacity
                        style={styles.fab}
                        onPress={() => {
                            setEditingHospital(null);
                            setModalVisible(true);
                        }}
                    >
                        <Ionicons
                            name="add"
                            size={28}
                            color="white"
                        />
                    </TouchableOpacity>
                </>
            )}

            <HospitalFormModal
                visible={modalVisible}
                hospital={editingHospital}
                onClose={() => {
                    setModalVisible(false);
                    setEditingHospital(null);
                }}
                onSave={handleSaveHospital}
            />

        </AdminLayout>
    );
}

const styles = StyleSheet.create({
    loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    empty: {
        marginTop: 60,
        textAlign: "center",
        fontSize: 16,
        color: "#6b7280",
    },

    addButton: {
        backgroundColor: "#2563eb",
        borderRadius: 12,
        paddingVertical: 14,
        marginBottom: 18,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },

    addButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
        marginLeft: 8,
    },
});