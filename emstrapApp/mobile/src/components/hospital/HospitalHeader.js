import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Pressable,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function HospitalHeader({
    onMenuPress,
}) {
    const router = useRouter();

    const [profileVisible, setProfileVisible] =
        useState(false);


    const [user, setUser] = useState(null);
    useEffect(() => {
        const loadUser = async () => {
            const storedUser = await AsyncStorage.getItem("user");

            console.log("Stored User:", storedUser);

            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        };

        loadUser();
    }, []);
    const openProfile = () => {
        setProfileVisible(true);
    };

    const handleLogout = async () => {
        try {
            setProfileVisible(false);

            await AsyncStorage.multiRemove([
                "authToken",
                "user",
            ]);

            router.replace("/login");
        } catch (error) {
            console.log(
                "HOSPITAL LOGOUT ERROR:",
                error
            );
        }
    };

    const initial = user?.name?.charAt(0)?.toUpperCase() || "H";

    return (
        <>
            <View style={styles.header}>
                {/* Menu */}
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

                {/* Brand */}
                <View style={styles.brandContainer}>
                    <View style={styles.logo}>
                        <Ionicons
                            name="medical"
                            size={20}
                            color="#ffffff"
                        />
                    </View>

                    <View>
                        <Text style={styles.brand}>
                            emstrap
                        </Text>

                        <Text style={styles.role}>
                            Hospital
                        </Text>
                    </View>
                </View>

                {/* Avatar */}
                <TouchableOpacity
                    style={styles.avatar}
                    onPress={openProfile}
                    activeOpacity={0.8}
                >
                    <Text style={styles.avatarText}>
                        {initial}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Profile popup */}
            <Modal
                visible={profileVisible}
                transparent
                animationType="fade"
                onRequestClose={() =>
                    setProfileVisible(false)
                }
            >
                <View style={styles.modalWrapper}>
                    <Pressable
                        style={styles.modalOverlay}
                        onPress={() =>
                            setProfileVisible(false)
                        }
                    />

                    <View style={styles.profileCard}>
                        <View style={styles.profileAvatar}>
                            <Text
                                style={
                                    styles.profileAvatarText
                                }
                            >
                                {initial}
                            </Text>
                        </View>

                        <Text style={styles.profileRole}>
                            {user?.name || "Hospital"}
                        </Text>

                        <Text style={styles.profileEmail}>
                            {user?.email || "Hospital Account"}
                        </Text>

                        <View style={styles.divider} />

                        <TouchableOpacity
                            style={styles.logoutButton}
                            onPress={handleLogout}
                            activeOpacity={0.8}
                        >
                            <Ionicons
                                name="log-out-outline"
                                size={20}
                                color="#dc2626"
                            />

                            <Text
                                style={styles.logoutText}
                            >
                                Logout
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </>
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

        backgroundColor: "#dc2626",

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

        backgroundColor: "#dc2626",

        alignItems: "center",
        justifyContent: "center",
    },

    avatarText: {
        color: "#ffffff",
        fontSize: 17,
        fontWeight: "800",
    },

    modalWrapper: {
        flex: 1,
    },

    modalOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.25)",
    },

    profileCard: {
        position: "absolute",
        top: 72,
        right: 16,

        width: 250,

        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 18,

        borderWidth: 1,
        borderColor: "#e5e7eb",

        elevation: 10,

        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 12,
        shadowOffset: {
            width: 0,
            height: 5,
        },

        alignItems: "center",
    },

    profileAvatar: {
        width: 54,
        height: 54,
        borderRadius: 27,

        backgroundColor: "#dc2626",

        alignItems: "center",
        justifyContent: "center",

        marginBottom: 10,
    },

    profileAvatarText: {
        color: "#ffffff",
        fontSize: 21,
        fontWeight: "800",
    },

    profileRole: {
        fontSize: 15,
        fontWeight: "800",
        color: "#111827",
    },

    profileEmail: {
        marginTop: 4,

        fontSize: 13,
        color: "#6b7280",

        textAlign: "center",
    },

    divider: {
        width: "100%",
        height: 1,

        backgroundColor: "#e5e7eb",

        marginVertical: 16,
    },

    logoutButton: {
        width: "100%",

        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",

        gap: 8,

        paddingVertical: 11,

        borderRadius: 10,

        backgroundColor: "#fef2f2",
    },

    logoutText: {
        color: "#dc2626",
        fontSize: 14,
        fontWeight: "700",
    },
});