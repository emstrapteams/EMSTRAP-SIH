import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import AdminLayout from "../../components/admin/AdminLayout";
import DriverCard from "../../components/admin/DriverCard";
import DriverFormModal from "../../components/admin/DriverFormModal";

import {
    getGovernmentDrivers,
    getPrivateDrivers,
    addDriver,
    updateGovernmentDriver,
    updatePrivateDriver,
    deleteGovernmentDriver,
    deletePrivateDriver,
} from "../../services/driverApi";

export default function AdminDrivers() {

    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [modalVisible, setModalVisible] = useState(false);
    const [editingDriver, setEditingDriver] = useState(null);

    const fetchDrivers = async (silent = false) => {

        try {

            if (!silent) setLoading(true);

            const [govRes, privateRes] = await Promise.all([
                getGovernmentDrivers(),
                getPrivateDrivers(),
            ]);

            const government =
                (govRes.ambulances || []).map((d) => ({
                    ...d,
                    driverType: "government",
                }));

            const privateDrivers =
                (privateRes.drivers || []).map((d) => ({
                    ...d,
                    driverType: "private",
                }));

            setDrivers([
                ...government,
                ...privateDrivers,
            ]);

        } catch {

            Alert.alert(
                "Error",
                "Unable to load drivers."
            );

        } finally {

            setLoading(false);
            setRefreshing(false);

        }
    };

    useEffect(() => {
        fetchDrivers();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchDrivers(true);
    };

    const handleView = (driver) => {

        Alert.alert(
            driver.name,

            `Vehicle : ${driver.vehicleNumber}

Mobile : ${driver.mobile}

Email : ${driver.email}

Address : ${driver.address}

City : ${driver.city}

Driver Type : ${driver.driverType === "government"
                ? "Government"
                : "Private"
            }

Status : ${driver.driverStatus === "LIVE"
                ? "Online"
                : "Offline"
            }`
        );
    };

    const handleEdit = (driver) => {
        setEditingDriver(driver);
        setModalVisible(true);
    };

    const handleDelete = (driver) => {

        Alert.alert(
            "Delete Driver",
            `Delete ${driver.name}?`,
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

                            if (
                                driver.driverType ===
                                "government"
                            ) {

                                await deleteGovernmentDriver(
                                    driver._id
                                );

                            } else {

                                await deletePrivateDriver(
                                    driver._id
                                );

                            }

                            setDrivers((prev) =>
                                prev.filter(
                                    (d) =>
                                        d._id !==
                                        driver._id
                                )
                            );

                        } catch {

                            Alert.alert(
                                "Error",
                                "Unable to delete driver."
                            );

                        }

                    },
                },
            ]
        );
    };

    const handleSaveDriver = async (form) => {

        try {

            if (editingDriver) {

                let res;

                if (
                    editingDriver.driverType ===
                    "government"
                ) {

                    res =
                        await updateGovernmentDriver(
                            editingDriver._id,
                            form
                        );

                } else {

                    res =
                        await updatePrivateDriver(
                            editingDriver._id,
                            form
                        );

                }

                const updated =
                    res.driver ||
                    res.ambulance;

                updated.driverType =
                    editingDriver.driverType;

                setDrivers((prev) =>
                    prev.map((d) =>
                        d._id === editingDriver._id
                            ? updated
                            : d
                    )
                );

            } else {

                const payload = {
                    ...form,
                    role:
                        form.driverType ===
                            "government"
                            ? "ambulance_driver"
                            : "private_driver",
                };

                const res =
                    await addDriver(payload);

                if (res.success) {

                    fetchDrivers(true);

                }

            }

            setEditingDriver(null);
            setModalVisible(false);

        } catch {

            Alert.alert(
                "Error",
                "Unable to save driver."
            );

        }
    };
    return (
        <AdminLayout title="Driver Management">

            <View style={{ flex: 1 }}>

                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                        setEditingDriver(null);
                        setModalVisible(true);
                    }}
                >
                    <Ionicons
                        name="add-circle-outline"
                        size={22}
                        color="#fff"
                    />

                    <Text style={styles.addButtonText}>
                        Add Driver
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

                    <FlatList
                        data={drivers}
                        keyExtractor={(item) => item._id}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                            />
                        }
                        renderItem={({ item }) => (
                            <DriverCard
                                driver={item}
                                onView={handleView}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        )}
                        ListEmptyComponent={
                            <Text style={styles.empty}>
                                No drivers found.
                            </Text>
                        }
                        contentContainerStyle={{
                            paddingTop: 8,
                            paddingBottom: 100,
                        }}
                    />

                )}

            </View>

            <DriverFormModal
                visible={modalVisible}
                driver={editingDriver}
                onClose={() => {
                    setModalVisible(false);
                    setEditingDriver(null);
                }}
                onSave={handleSaveDriver}
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
        color: "#6b7280",
        fontSize: 16,
    },

    addButton: {
        backgroundColor: "#2563eb",
        paddingVertical: 14,
        borderRadius: 12,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 18,
    },

    addButtonText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 16,
        marginLeft: 8,
    },

});