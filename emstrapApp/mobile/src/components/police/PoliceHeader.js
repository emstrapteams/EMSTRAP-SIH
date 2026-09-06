import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
export default function PoliceHeader({
    onMenuPress,
    onLogout,
}) {
    const { user } = useAuth();
    const [profileOpen, setProfileOpen] =
        React.useState(false);

    const initial =
        user?.name?.charAt(0)?.toUpperCase() ||
        "P";

    return (
        <View style={styles.header}>
            <TouchableOpacity
                style={styles.menuButton}
                onPress={onMenuPress}
                activeOpacity={0.7}
            >
                <Ionicons
                    name="menu-outline"
                    size={28}
                    color="#111827"
                />
            </TouchableOpacity>

            <View style={styles.brandContainer}>
                <View style={styles.logo}>
                    <Ionicons
                        name="shield-checkmark"
                        size={20}
                        color="#ffffff"
                    />
                </View>

                <View>
                    <Text style={styles.brand}>
                        emstrap
                    </Text>

                    <Text style={styles.role}>
                        Police
                    </Text>
                </View>
            </View>

            <View style={styles.profileWrapper}>
                <TouchableOpacity
                    style={styles.avatar}
                    activeOpacity={0.8}
                    onPress={() =>
                        setProfileOpen((prev) => !prev)
                    }
                >
                    <Text style={styles.avatarText}>
                        {initial}
                    </Text>
                </TouchableOpacity>

                {profileOpen && (
                    <View style={styles.profileMenu}>
                        <View style={styles.profileTop}>
                            <View style={styles.menuAvatar}>
                                <Text style={styles.menuAvatarText}>
                                    {initial}
                                </Text>
                            </View>

                            <View style={styles.userInfo}>
                                <Text
                                    style={styles.userName}
                                    numberOfLines={1}
                                >
                                    {user?.name || "Police"}
                                </Text>

                                <Text
                                    style={styles.userEmail}
                                    numberOfLines={1}
                                >
                                    {user?.email || ""}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <TouchableOpacity
                            style={styles.logoutButton}
                            activeOpacity={0.7}
                            onPress={() => {
                                setProfileOpen(false);
                                onLogout?.();
                            }}
                        >
                            <Ionicons
                                name="log-out-outline"
                                size={20}
                                color="#dc2626"
                            />

                            <Text style={styles.logoutText}>
                                Logout
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        height: 64,
        backgroundColor: "#ffffff",

        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",

        paddingHorizontal: 16,

        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",

        elevation: 3,

        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: {
            width: 0,
            height: 2,
        },

        zIndex: 20,
    },

    menuButton: {
        width: 42,
        height: 42,
        borderRadius: 12,

        justifyContent: "center",
        alignItems: "center",

        backgroundColor: "#f3f4f6",
    },

    brandContainer: {
        flexDirection: "row",
        alignItems: "center",
    },

    logo: {
        width: 36,
        height: 36,
        borderRadius: 10,

        backgroundColor: "#1d4ed8",

        justifyContent: "center",
        alignItems: "center",

        marginRight: 10,
    },

    brand: {
        fontSize: 19,
        fontWeight: "800",
        color: "#111827",
    },

    role: {
        marginTop: -2,
        fontSize: 10,
        fontWeight: "600",
        color: "#6b7280",
    },

    avatar: {
        width: 42,
        height: 42,
        borderRadius: 21,

        backgroundColor: "#2563eb",

        justifyContent: "center",
        alignItems: "center",

        borderWidth: 2,
        borderColor: "#dbeafe",
    },

    avatarText: {
        fontSize: 16,
        fontWeight: "800",
        color: "#ffffff",
    },
    profileWrapper: {
        position: "relative",
        zIndex: 1000,
    },

    profileMenu: {
        position: "absolute",
        top: 50,
        right: 0,
        width: 245,

        backgroundColor: "#ffffff",
        borderRadius: 14,
        padding: 14,

        borderWidth: 1,
        borderColor: "#e5e7eb",

        elevation: 12,

        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 12,
        shadowOffset: {
            width: 0,
            height: 5,
        },

        zIndex: 1000,
    },

    profileTop: {
        flexDirection: "row",
        alignItems: "center",
    },

    menuAvatar: {
        width: 42,
        height: 42,
        borderRadius: 21,

        backgroundColor: "#2563eb",

        justifyContent: "center",
        alignItems: "center",

        marginRight: 11,
    },

    menuAvatarText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "800",
    },

    userInfo: {
        flex: 1,
    },

    userName: {
        fontSize: 14,
        fontWeight: "700",
        color: "#111827",
    },

    userEmail: {
        marginTop: 3,
        fontSize: 12,
        color: "#6b7280",
    },

    divider: {
        height: 1,
        backgroundColor: "#e5e7eb",
        marginVertical: 12,
    },

    logoutButton: {
        height: 42,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        borderRadius: 9,
        backgroundColor: "#fef2f2",
    },

    logoutText: {
        marginLeft: 9,
        fontSize: 14,
        fontWeight: "700",
        color: "#dc2626",
    },
});