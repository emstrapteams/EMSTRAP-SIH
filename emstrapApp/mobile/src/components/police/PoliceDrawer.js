import React from "react";
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    Pressable,
    StyleSheet,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";

const menuItems = [
    {
        title: "Dashboard",
        icon: "grid-outline",
        route: "/police",
    },
    {
        title: "Live Map",
        icon: "map-outline",
        route: "/police/live",
    },
    {
        title: "Settings",
        icon: "settings-outline",
        route: "/police/settings",
    },
];

export default function PoliceDrawer({
    visible,
    onClose,
    onLogout,
}) {
    const router = useRouter();
    const pathname = usePathname();

    const navigate = (route) => {
        onClose();
        router.push(route);
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.wrapper}>
                <Pressable
                    style={styles.overlay}
                    onPress={onClose}
                />

                <View style={styles.drawer}>
                    {/* Header */}
                    <View style={styles.drawerHeader}>
                        <View style={styles.logo}>
                            <Ionicons
                                name="shield-checkmark"
                                size={25}
                                color="#ffffff"
                            />
                        </View>

                        <View style={styles.brandContainer}>
                            <Text style={styles.brand}>
                                emstrap
                            </Text>

                            <Text style={styles.role}>
                                Police Portal
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={onClose}
                        >
                            <Ionicons
                                name="close"
                                size={24}
                                color="#6b7280"
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Navigation */}
                    <View style={styles.menu}>
                        <Text style={styles.menuLabel}>
                            NAVIGATION
                        </Text>

                        {menuItems.map((item) => {
                            const active =
                                pathname === item.route;

                            return (
                                <TouchableOpacity
                                    key={item.route}
                                    style={[
                                        styles.menuItem,
                                        active &&
                                        styles.menuItemActive,
                                    ]}
                                    onPress={() =>
                                        navigate(item.route)
                                    }
                                >
                                    <Ionicons
                                        name={item.icon}
                                        size={21}
                                        color={
                                            active
                                                ? "#2563eb"
                                                : "#4b5563"
                                        }
                                    />

                                    <Text
                                        style={[
                                            styles.menuText,
                                            active &&
                                            styles.menuTextActive,
                                        ]}
                                    >
                                        {item.title}
                                    </Text>

                                    <Ionicons
                                        name="chevron-forward"
                                        size={18}
                                        color="#9ca3af"
                                        style={styles.chevron}
                                    />
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Logout */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={styles.logoutButton}
                            onPress={onLogout}
                        >
                            <Ionicons
                                name="log-out-outline"
                                size={21}
                                color="#dc2626"
                            />

                            <Text style={styles.logoutText}>
                                Logout
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        flexDirection: "row",
    },

    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.45)",
    },

    drawer: {
        width: "82%",
        maxWidth: 330,
        height: "100%",
        backgroundColor: "#ffffff",
        paddingTop: 20,
    },

    drawerHeader: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 18,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },

    logo: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: "#1d4ed8",
        justifyContent: "center",
        alignItems: "center",
    },

    brandContainer: {
        flex: 1,
        marginLeft: 12,
    },

    brand: {
        fontSize: 20,
        fontWeight: "800",
        color: "#111827",
    },

    role: {
        marginTop: 2,
        fontSize: 12,
        color: "#6b7280",
    },

    closeButton: {
        width: 38,
        height: 38,
        justifyContent: "center",
        alignItems: "center",
    },

    menu: {
        flex: 1,
        paddingHorizontal: 14,
        paddingTop: 22,
    },

    menuLabel: {
        marginLeft: 10,
        marginBottom: 10,
        fontSize: 11,
        fontWeight: "700",
        color: "#9ca3af",
        letterSpacing: 1,
    },

    menuItem: {
        height: 52,
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        marginBottom: 6,
    },

    menuItemActive: {
        backgroundColor: "#eff6ff",
    },

    menuText: {
        marginLeft: 13,
        fontSize: 15,
        fontWeight: "600",
        color: "#374151",
    },

    menuTextActive: {
        color: "#2563eb",
        fontWeight: "700",
    },

    chevron: {
        marginLeft: "auto",
    },

    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: "#e5e7eb",
    },

    logoutButton: {
        height: 50,
        borderRadius: 12,
        backgroundColor: "#fef2f2",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 15,
    },

    logoutText: {
        marginLeft: 12,
        color: "#dc2626",
        fontSize: 15,
        fontWeight: "700",
    },
});