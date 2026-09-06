import React, { useEffect, useState } from "react";
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
} from "react-native";

const initialForm = {
    name: "",
    mobile: "",
    email: "",
    password: "",
    address: "",
    city: "",
    role: "police",
};

export default function PoliceFormModal({
    visible,
    onClose,
    onSave,
    police,
}) {
    const [form, setForm] = useState(initialForm);

    useEffect(() => {
        if (police) {
            setForm({
                name: police.name || "",
                mobile: police.mobile || "",
                email: police.email || "",
                password: "",
                address: police.address || "",
                city: police.city || "",
                role: police.role || "police",
            });
        } else {
            setForm(initialForm);
        }
    }, [police, visible]);

    const change = (key, value) => {
        setForm((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const submit = () => {
        onSave(form);
    };

    const input = (
        label,
        key,
        keyboardType = "default",
        secure = false
    ) => (
        <View style={{ marginBottom: 14 }}>
            <Text style={styles.label}>{label}</Text>

            <TextInput
                value={form[key]}
                onChangeText={(t) => change(key, t)}
                keyboardType={keyboardType}
                secureTextEntry={secure}
                style={styles.input}
            />
        </View>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
        >
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>
                    {police ? "Edit Police Unit" : "Add Police Unit"}
                </Text>

                {input("Station / Unit Name", "name")}
                {input("Mobile", "mobile", "phone-pad")}
                {input("Email", "email", "email-address")}
                {input("Password", "password", "default", true)}
                {input("Address", "address")}
                {input("City", "city")}

                <Text style={styles.label}>Role</Text>

                <View style={styles.roleContainer}>
                    <TouchableOpacity
                        style={[
                            styles.roleButton,
                            form.role === "police" &&
                            styles.roleActive,
                        ]}
                        onPress={() =>
                            change("role", "police")
                        }
                    >
                        <Text
                            style={[
                                styles.roleText,
                                form.role === "police" &&
                                styles.roleTextActive,
                            ]}
                        >
                            Police Station
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.roleButton,
                            form.role === "police_hq" &&
                            styles.roleActive,
                        ]}
                        onPress={() =>
                            change("role", "police_hq")
                        }
                    >
                        <Text
                            style={[
                                styles.roleText,
                                form.role === "police_hq" &&
                                styles.roleTextActive,
                            ]}
                        >
                            Headquarters
                        </Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.save}
                    onPress={submit}
                >
                    <Text style={styles.saveText}>
                        {police
                            ? "Save Changes"
                            : "Add Police Unit"}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.cancel}
                    onPress={onClose}
                >
                    <Text style={styles.cancelText}>
                        Cancel
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        paddingBottom: 50,
    },

    title: {
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 25,
    },

    label: {
        marginBottom: 6,
        fontWeight: "600",
        color: "#374151",
    },

    input: {
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 15,
        marginBottom: 14,
    },

    roleContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
    },

    roleButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: "center",
        marginHorizontal: 4,
    },

    roleActive: {
        backgroundColor: "#2563eb",
        borderColor: "#2563eb",
    },

    roleText: {
        color: "#374151",
        fontWeight: "600",
    },

    roleTextActive: {
        color: "#fff",
    },

    save: {
        backgroundColor: "#2563eb",
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 10,
    },

    saveText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 16,
    },

    cancel: {
        alignItems: "center",
        marginTop: 18,
    },

    cancelText: {
        color: "#dc2626",
        fontWeight: "600",
        fontSize: 16,
    },
});