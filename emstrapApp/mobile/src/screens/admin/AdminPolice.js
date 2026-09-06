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
import PoliceCard from "../../components/admin/PoliceCard";
import PoliceFormModal from "../../components/admin/PoliceFormModal";

import {
    getPolice,
    addPolice,
    updatePolice,
    deletePolice,
} from "../../services/policeApi";

export default function AdminPolice() {

    const [policeRecords, setPoliceRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [modalVisible, setModalVisible] = useState(false);
    const [editingPolice, setEditingPolice] = useState(null);

    const fetchPolice = async (silent = false) => {
        try {

            if (!silent) setLoading(true);

            const res = await getPolice();

            if (res.success) {
                setPoliceRecords(res.police || []);
            }

        } catch (err) {

            Alert.alert(
                "Error",
                err?.response?.data?.message ||
                "Failed to load police records."
            );

        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchPolice();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchPolice(true);
    };

    const handleView = (police) => {

        Alert.alert(
            police.name,

            `Role: ${police.role === "police_hq"
                ? "Police Headquarters"
                : "Police Station"
            }

City: ${police.city}

Phone: ${police.mobile}

Email: ${police.email}

Address: ${police.address}`
        );
    };

    const handleEdit = (police) => {
        setEditingPolice(police);
        setModalVisible(true);
    };

    const handleDelete = (police) => {

        Alert.alert(
            "Delete Police Unit",

            `Delete ${police.name}?`,

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

                            await deletePolice(police._id);

                            setPoliceRecords((prev) =>
                                prev.filter(
                                    (p) => p._id !== police._id
                                )
                            );

                        } catch {

                            Alert.alert(
                                "Error",
                                "Failed to delete police record."
                            );
                        }
                    },
                },
            ]
        );
    };

    const handleSavePolice = async (form) => {

        try {

            if (editingPolice) {

                const res = await updatePolice(
                    editingPolice._id,
                    form
                );

                if (res.success) {

                    setPoliceRecords((prev) =>
                        prev.map((p) =>
                            p._id === editingPolice._id
                                ? res.police
                                : p
                        )
                    );
                }

            } else {

                const res = await addPolice(form);

                if (res.success) {

                    setPoliceRecords((prev) => [
                        res.police,
                        ...prev,
                    ]);
                }
            }

            setModalVisible(false);
            setEditingPolice(null);

        } catch (err) {

            Alert.alert(
                "Error",
                err?.response?.data?.message ||
                "Unable to save police record."
            );
        }
    };
    return (
        <AdminLayout title="Police Management">

            <View style={{ flex: 1 }}>

                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                        setEditingPolice(null);
                        setModalVisible(true);
                    }}
                >
                    <Ionicons
                        name="add-circle-outline"
                        size={22}
                        color="#fff"
                    />

                    <Text style={styles.addButtonText}>
                        Add Police Unit
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
                        data={policeRecords}
                        keyExtractor={(item) => item._id}
                        renderItem={({ item }) => (
                            <PoliceCard
                                police={item}
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
                                No police units found.
                            </Text>
                        }
                        contentContainerStyle={{
                            paddingBottom: 100,
                            paddingTop: 8,
                        }}
                    />

                )}

            </View>

            <PoliceFormModal
                visible={modalVisible}
                police={editingPolice}
                onClose={() => {
                    setModalVisible(false);
                    setEditingPolice(null);
                }}
                onSave={handleSavePolice}
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