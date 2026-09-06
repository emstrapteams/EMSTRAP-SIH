import React from "react";
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Pressable,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function AdminDrawer({
    visible,
    onClose,
}) {
    const router = useRouter();
    const { logoutUser } = useAuth();

    const menuItems = [
        {
            title: "Overview",
            icon: "grid-outline",
            route: "/admin",
        },
        {
            title: "Users",
            icon: "people-outline",
            route: "/admin/users",
        },
        {
            title: "Emergencies",
            icon: "warning-outline",
            route: "/admin/emergencies",
        },
        {
            title: "Bookings",
            icon: "calendar-outline",
            route: "/admin/booking",
        },
        {
            title: "Hospitals",
            icon: "medical-outline",
            route: "/admin/hospital",
        },
        {
            title: "Ambulance",
            icon: "car-outline",
            route: "/admin/driver",
        },
        {
            title: "Police",
            icon: "shield-outline",
            route: "/admin/police",
        },
    ];
    async function logout() {
        onClose();
        await logoutUser();
        router.replace("/login");
    }

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
        >
            <Pressable
                style={styles.overlay}
                onPress={onClose}
            >
                <View style={styles.drawer}>
                    <Text style={styles.title}>
                        Admin Panel
                    </Text>

                    {menuItems.map((item) => (
                        <TouchableOpacity
                            key={item.title}
                            style={styles.item}
                            onPress={() => {
                                onClose();
                                router.push(item.route);
                            }}
                        >
                            <Ionicons
                                name={item.icon}
                                size={22}
                                color="#444"
                            />

                            <Text style={styles.text}>
                                {item.title}
                            </Text>
                        </TouchableOpacity>
                    ))}

                    <View style={styles.divider} />

                    <TouchableOpacity
                        style={styles.item}
                        onPress={logout}
                    >
                        <Ionicons
                            name="log-out-outline"
                            size={22}
                            color="#ef4444"
                        />

                        <Text style={styles.logout}>
                            Logout
                        </Text>
                    </TouchableOpacity>
                </View>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,.35)",
    },

    drawer: {
        width: 280,
        flex: 1,
        backgroundColor: "#fff",
        paddingTop: 70,
        paddingHorizontal: 20,
    },

    title: {
        fontSize: 22,
        fontWeight: "700",
        marginBottom: 30,
    },

    item: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
    },

    text: {
        marginLeft: 15,
        fontSize: 16,
    },

    divider: {
        height: 1,
        backgroundColor: "#eee",
        marginVertical: 20,
    },

    logout: {
        marginLeft: 15,
        color: "#ef4444",
        fontWeight: "600",
        fontSize: 16,
    },
});