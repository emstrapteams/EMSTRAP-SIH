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
    emergencyBeds: "0",
    latitude: "",
    longitude: "",
};

export default function HospitalFormModal({
    visible,
    onClose,
    onSave,
    hospital,
}) {
    const [form, setForm] = useState(initialForm);

    useEffect(() => {
        if (hospital) {
            setForm({
                name: hospital.name || "",
                mobile: hospital.mobile || "",
                email: hospital.email || "",
                password: "",
                address: hospital.address || "",
                city: hospital.city || "",
                emergencyBeds: String(hospital.emergencyBeds || 0),
                latitude: String(hospital.location?.latitude || ""),
                longitude: String(hospital.location?.longitude || ""),
            });
        } else {
            setForm(initialForm);
        }
    }, [hospital, visible]);

    const change = (key, value) => {
        setForm((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const submit = () => {
        onSave({
            ...form,
            emergencyBeds: Number(form.emergencyBeds),
            location: {
                latitude: Number(form.latitude),
                longitude: Number(form.longitude),
            },
        });
    };

    const input = (label, key, keyboardType = "default", secure = false) => (
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
            <ScrollView
                contentContainerStyle={styles.container}
            >
                <Text style={styles.title}>
                    {hospital ? "Edit Hospital" : "Add Hospital"}
                </Text>

                {input("Hospital Name", "name")}
                {input("Mobile", "mobile", "phone-pad")}
                {input("Email", "email", "email-address")}
                {input("Password", "password", "default", true)}
                {input("Address", "address")}
                {input("City", "city")}
                {input("Emergency Beds", "emergencyBeds", "numeric")}
                {input("Latitude", "latitude", "numeric")}
                {input("Longitude", "longitude", "numeric")}

                <TouchableOpacity
                    style={styles.save}
                    onPress={submit}
                >
                    <Text style={styles.saveText}>
                        {hospital ? "Save Changes" : "Add Hospital"}
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
    },

    save: {
        backgroundColor: "#2563eb",
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 15,
    },

    saveText: {
        color: "white",
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