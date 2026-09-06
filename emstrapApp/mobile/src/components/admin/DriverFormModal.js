import React, { useEffect, useState } from "react";
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from "react-native";

export default function DriverFormModal({
    visible,
    driver,
    onClose,
    onSave,
}) {
    const [form, setForm] = useState({
        driverType: "private",
        name: "",
        vehicleNumber: "",
        mobile: "",
        email: "",
        password: "",
        address: "",
        city: "",
        driverStatus: "OFFLINE",
    });

    useEffect(() => {
        if (driver) {
            setForm({
                driverType: driver.driverType || "private",
                name: driver.name || "",
                vehicleNumber: driver.vehicleNumber || "",
                mobile: driver.mobile || "",
                email: driver.email || "",
                password: "",
                address: driver.address || "",
                city: driver.city || "",
                driverStatus:
                    driver.driverStatus || "OFFLINE",
            });
        } else {
            setForm({
                driverType: "private",
                name: "",
                vehicleNumber: "",
                mobile: "",
                email: "",
                password: "",
                address: "",
                city: "",
                driverStatus: "OFFLINE",
            });
        }
    }, [driver, visible]);

    const update = (key, value) => {
        setForm((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
        >
            <View style={styles.overlay}>

                <View style={styles.container}>

                    <Text style={styles.title}>
                        {driver
                            ? "Update Driver"
                            : "Add Driver"}
                    </Text>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                    >

                        <Text style={styles.label}>
                            Driver Type
                        </Text>

                        <View style={styles.selector}>

                            <TouchableOpacity
                                style={[
                                    styles.option,
                                    form.driverType ===
                                    "government" &&
                                    styles.selected,
                                ]}
                                onPress={() =>
                                    update(
                                        "driverType",
                                        "government"
                                    )
                                }
                            >
                                <Text>
                                    Government
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.option,
                                    form.driverType ===
                                    "private" &&
                                    styles.selected,
                                ]}
                                onPress={() =>
                                    update(
                                        "driverType",
                                        "private"
                                    )
                                }
                            >
                                <Text>
                                    Private
                                </Text>
                            </TouchableOpacity>

                        </View>

                        <TextInput
                            style={styles.input}
                            placeholder="Driver Name"
                            value={form.name}
                            onChangeText={(t) =>
                                update("name", t)
                            }
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Vehicle Number"
                            value={form.vehicleNumber}
                            onChangeText={(t) =>
                                update(
                                    "vehicleNumber",
                                    t
                                )
                            }
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Mobile"
                            keyboardType="phone-pad"
                            value={form.mobile}
                            onChangeText={(t) =>
                                update("mobile", t)
                            }
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={form.email}
                            onChangeText={(t) =>
                                update("email", t)
                            }
                        />

                        <TextInput
                            style={styles.input}
                            placeholder={
                                driver
                                    ? "Password (leave blank to keep current)"
                                    : "Password"
                            }
                            secureTextEntry
                            value={form.password}
                            onChangeText={(t) =>
                                update(
                                    "password",
                                    t
                                )
                            }
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Address"
                            value={form.address}
                            onChangeText={(t) =>
                                update(
                                    "address",
                                    t
                                )
                            }
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="City"
                            value={form.city}
                            onChangeText={(t) =>
                                update("city", t)
                            }
                        />

                        <Text style={styles.label}>
                            Driver Status
                        </Text>

                        <View style={styles.selector}>

                            <TouchableOpacity
                                style={[
                                    styles.option,
                                    form.driverStatus ===
                                    "LIVE" &&
                                    styles.selected,
                                ]}
                                onPress={() =>
                                    update(
                                        "driverStatus",
                                        "LIVE"
                                    )
                                }
                            >
                                <Text>Online</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.option,
                                    form.driverStatus ===
                                    "OFFLINE" &&
                                    styles.selected,
                                ]}
                                onPress={() =>
                                    update(
                                        "driverStatus",
                                        "OFFLINE"
                                    )
                                }
                            >
                                <Text>
                                    Offline
                                </Text>
                            </TouchableOpacity>

                        </View>

                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={() =>
                                onSave(form)
                            }
                        >
                            <Text
                                style={
                                    styles.saveText
                                }
                            >
                                {driver
                                    ? "Update Driver"
                                    : "Add Driver"}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={
                                styles.cancelButton
                            }
                            onPress={onClose}
                        >
                            <Text
                                style={
                                    styles.cancelText
                                }
                            >
                                Cancel
                            </Text>
                        </TouchableOpacity>

                    </ScrollView>

                </View>

            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.45)",
        justifyContent: "center",
        padding: 20,
    },

    container: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        maxHeight: "90%",
    },

    title: {
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 18,
    },

    label: {
        marginTop: 12,
        marginBottom: 6,
        fontWeight: "600",
    },

    input: {
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 12,
    },

    selector: {
        flexDirection: "row",
        marginBottom: 12,
    },

    option: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#d1d5db",
        padding: 12,
        alignItems: "center",
        marginRight: 8,
        borderRadius: 10,
    },

    selected: {
        backgroundColor: "#dbeafe",
        borderColor: "#2563eb",
    },

    saveButton: {
        backgroundColor: "#2563eb",
        padding: 14,
        borderRadius: 10,
        marginTop: 18,
    },

    saveText: {
        color: "#fff",
        textAlign: "center",
        fontWeight: "700",
        fontSize: 16,
    },

    cancelButton: {
        marginTop: 12,
        padding: 14,
        borderRadius: 10,
        backgroundColor: "#f3f4f6",
    },

    cancelText: {
        textAlign: "center",
        fontWeight: "600",
        color: "#374151",
    },
});