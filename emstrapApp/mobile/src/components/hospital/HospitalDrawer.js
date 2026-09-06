import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Pressable,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import {
    useRouter,
    usePathname,
} from "expo-router";

const menuItems = [
    {
        title: "Dashboard",
        icon: "grid-outline",
        route: "/hospital",
    },
    {
        title: "Live Map",
        icon: "map-outline",
        route: "/hospital/live",
    },
    {
        title: "Patient Records",
        icon: "people-outline",
        route: "/hospital/patients",
    },
    {
        title: "Settings",
        icon: "settings-outline",
        route: "/hospital/settings",
    },
];

export default function HospitalDrawer({
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
                {/* Dark background */}
                <Pressable
                    style={styles.overlay}
                    onPress={onClose}
                />

                {/* Drawer */}
                <View style={styles.drawer}>
                    {/* Header */}
                    <View style={styles.drawerHeader}>
                        <View style={styles.logo}>
                            <Ionicons
                                name="medical"
                                size={25}
                                color="#ffffff"
                            />
                        </View>

                        <View
                            style={
                                styles.brandContainer
                            }
                        >
                            <Text style={styles.brand}>
                                emstrap
                            </Text>

                            <Text style={styles.role}>
                                Hospital Portal
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={
                                styles.closeButton
                            }
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
                        <Text
                            style={styles.menuLabel}
                        >
                            NAVIGATION
                        </Text>

                        {menuItems.map((item) => {
                            const active =
                                pathname ===
                                item.route;

                            return (
                                <TouchableOpacity
                                    key={
                                        item.route
                                    }
                                    style={[
                                        styles.menuItem,
                                        active &&
                                        styles.menuItemActive,
                                    ]}
                                    onPress={() =>
                                        navigate(
                                            item.route
                                        )
                                    }
                                    activeOpacity={
                                        0.75
                                    }
                                >
                                    <Ionicons
                                        name={
                                            item.icon
                                        }
                                        size={21}
                                        color={
                                            active
                                                ? "#dc2626"
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
                                        {
                                            item.title
                                        }
                                    </Text>

                                    <Ionicons
                                        name="chevron-forward"
                                        size={18}
                                        color="#9ca3af"
                                        style={
                                            styles.chevron
                                        }
                                    />
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Logout */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={
                                styles.logoutButton
                            }
                            onPress={onLogout}
                            activeOpacity={0.75}
                        >
                            <Ionicons
                                name="log-out-outline"
                                size={21}
                                color="#dc2626"
                            />

                            <Text
                                style={
                                    styles.logoutText
                                }
                            >
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
        backgroundColor:
            "rgba(17, 24, 39, 0.45)",
    },

    drawer: {
        width: "82%",
        maxWidth: 330,
        height: "100%",

        backgroundColor: "#ffffff",

        paddingTop: 20,

        elevation: 20,

        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 15,
        shadowOffset: {
            width: 5,
            height: 0,
        },
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

        backgroundColor: "#dc2626",

        alignItems: "center",
        justifyContent: "center",

        marginRight: 12,
    },

    brandContainer: {
        flex: 1,
    },

    brand: {
        fontSize: 20,
        fontWeight: "800",
        color: "#111827",
    },

    role: {
        marginTop: 1,

        fontSize: 11,
        fontWeight: "600",
        color: "#6b7280",
    },

    closeButton: {
        width: 38,
        height: 38,

        borderRadius: 10,

        backgroundColor: "#f3f4f6",

        alignItems: "center",
        justifyContent: "center",
    },

    menu: {
        flex: 1,

        paddingHorizontal: 14,
        paddingTop: 20,
    },

    menuLabel: {
        marginLeft: 10,
        marginBottom: 10,

        fontSize: 10,
        fontWeight: "800",

        letterSpacing: 1.3,

        color: "#9ca3af",
    },

    menuItem: {
        minHeight: 54,

        flexDirection: "row",
        alignItems: "center",

        paddingHorizontal: 14,

        borderRadius: 12,

        marginBottom: 7,
    },

    menuItemActive: {
        backgroundColor: "#fef2f2",
    },

    menuText: {
        marginLeft: 13,

        fontSize: 14,
        fontWeight: "600",

        color: "#4b5563",
    },

    menuTextActive: {
        color: "#dc2626",
        fontWeight: "800",
    },

    chevron: {
        marginLeft: "auto",
    },

    footer: {
        paddingHorizontal: 14,
        paddingVertical: 18,

        borderTopWidth: 1,
        borderTopColor: "#e5e7eb",
    },

    logoutButton: {
        minHeight: 52,

        flexDirection: "row",
        alignItems: "center",

        paddingHorizontal: 14,

        borderRadius: 12,

        backgroundColor: "#fef2f2",
    },

    logoutText: {
        marginLeft: 13,

        fontSize: 14,
        fontWeight: "700",

        color: "#dc2626",
    },
});