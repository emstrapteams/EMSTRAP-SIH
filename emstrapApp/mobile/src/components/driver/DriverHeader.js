import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Pressable,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

import { useDriver } from "../../context/DriverContext";
export default function DriverHeader() {

    const router = useRouter();

    const { online } = useDriver();

    const [profileVisible, setProfileVisible] =
        useState(false);
    const [menuVisible, setMenuVisible] =
        useState(false);

    const [user, setUser] = useState(null);

    useEffect(() => {

        const loadUser = async () => {

            const storedUser =
                await AsyncStorage.getItem("user");

            if (storedUser) {

                setUser(JSON.parse(storedUser));

            }

        };

        loadUser();

    }, []);

    const openProfile = () => {

        setMenuVisible(false);

        setProfileVisible(true);

    };

    const handleLogout = async () => {

        try {

            setProfileVisible(false);

            await AsyncStorage.multiRemove([
                "authToken",
                "user",
                "currentEmergency",
            ]);

            router.replace("/login");

        } catch (error) {

            console.log(error);

        }

    };

    const initial =
        user?.name?.charAt(0)?.toUpperCase() || "D";

    return (

        <>

            <SafeAreaView
                edges={["top"]}
                style={{ backgroundColor: "#ffffff" }}
            >

                <View style={styles.header}>

                    <View style={styles.leftSection}>

                        <TouchableOpacity
                            style={styles.menuButton}
                            onPress={() => {

                                setProfileVisible(false);

                                setMenuVisible(true);

                            }}
                        >

                            <Ionicons
                                name="menu"
                                size={28}
                                color="#111827"
                            />

                        </TouchableOpacity>

                        <View style={styles.brandContainer}>

                            <View style={styles.logo}>

                                <Ionicons
                                    name="car"
                                    size={20}
                                    color="#ffffff"
                                />

                            </View>

                            <View>

                                <Text style={styles.brand}>
                                    emstrap
                                </Text>

                                <Text style={styles.role}>
                                    Government Driver
                                </Text>

                            </View>

                        </View>

                    </View>

                    <View style={styles.rightSection}>

                        <View
                            style={[
                                styles.statusBadge,
                                {
                                    backgroundColor: online
                                        ? "#DCFCE7"
                                        : "#FEE2E2",
                                },
                            ]}
                        >

                            <View
                                style={[
                                    styles.statusDot,
                                    {
                                        backgroundColor: online
                                            ? "#16A34A"
                                            : "#DC2626",
                                    },
                                ]}
                            />

                            <Text
                                style={[
                                    styles.statusText,
                                    {
                                        color: online
                                            ? "#15803D"
                                            : "#DC2626",
                                    },
                                ]}
                            >
                                {online
                                    ? "ONLINE"
                                    : "OFFLINE"}
                            </Text>

                        </View>

                        <TouchableOpacity
                            style={styles.avatar}
                            activeOpacity={0.8}
                            onPress={openProfile}
                        >

                            <Text style={styles.avatarText}>
                                {initial}
                            </Text>

                        </TouchableOpacity>

                    </View>

                </View>

            </SafeAreaView>

            {/* ---------------- Drawer ---------------- */}

            <Modal
                visible={menuVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setMenuVisible(false)}
            >

                <View style={styles.drawerContainer}>

                    <Pressable
                        style={styles.drawerOverlay}
                        onPress={() => setMenuVisible(false)}
                    />

                    <View style={styles.drawer}>

                        <Text style={styles.drawerTitle}>
                            {user?.name}
                        </Text>

                        <Text
                            style={{
                                color: "#6B7280",
                                marginBottom: 25,
                            }}
                        >
                            Government Driver
                        </Text>

                        <TouchableOpacity
                            style={styles.drawerItem}
                            onPress={() => {

                                setMenuVisible(false);

                                router.replace("/driver");

                            }}
                        >

                            <Ionicons
                                name="home-outline"
                                size={22}
                                color="#DC2626"
                            />

                            <Text style={styles.drawerText}>
                                Dashboard
                            </Text>

                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.drawerItem}
                            onPress={() => {

                                setMenuVisible(false);

                                router.push("/driver/profile");

                            }}
                        >

                            <Ionicons
                                name="person-outline"
                                size={22}
                                color="#DC2626"
                            />

                            <Text style={styles.drawerText}>
                                Profile
                            </Text>

                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.drawerItem}
                            onPress={() => {

                                setMenuVisible(false);

                                router.push("/driver/history");

                            }}
                        >

                            <Ionicons
                                name="time-outline"
                                size={22}
                                color="#DC2626"
                            />

                            <Text style={styles.drawerText}>
                                Driver History
                            </Text>

                        </TouchableOpacity>

                        <View style={styles.divider} />

                        <TouchableOpacity
                            style={styles.drawerItem}
                            onPress={handleLogout}
                        >

                            <Ionicons
                                name="log-out-outline"
                                size={22}
                                color="#DC2626"
                            />

                            <Text
                                style={[
                                    styles.drawerText,
                                    {
                                        color: "#DC2626",
                                    },
                                ]}
                            >
                                Logout
                            </Text>

                        </TouchableOpacity>

                    </View>

                </View>

            </Modal>

            {/* ---------------- Profile ---------------- */}

            <Modal
                visible={profileVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setProfileVisible(false)}
            >

                <View style={styles.modalWrapper}>

                    <Pressable
                        style={styles.modalOverlay}
                        onPress={() => setProfileVisible(false)}
                    />

                    <View style={styles.profileCard}>

                        <View style={styles.profileAvatar}>

                            <Text style={styles.profileAvatarText}>
                                {initial}
                            </Text>

                        </View>

                        <Text style={styles.profileRole}>
                            {user?.name || "Driver"}
                        </Text>

                        <Text style={styles.profileEmail}>
                            {user?.email}
                        </Text>

                        <View style={styles.divider} />

                        <TouchableOpacity
                            style={styles.logoutButton}
                            onPress={handleLogout}
                        >

                            <Ionicons
                                name="log-out-outline"
                                size={20}
                                color="#DC2626"
                            />

                            <Text style={styles.logoutText}>
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

        paddingHorizontal: 18,

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

    },

    rightSection: {

        flexDirection: "row",

        alignItems: "center",

    },

    brandContainer: {

        flexDirection: "row",

        alignItems: "center",

        marginLeft: 12,

    },

    logo: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: "#DC2626",
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

        color: "#6B7280",

    },

    statusBadge: {

        flexDirection: "row",

        alignItems: "center",

        paddingHorizontal: 10,

        paddingVertical: 6,

        borderRadius: 20,

        marginRight: 10,

    },

    statusDot: {

        width: 8,

        height: 8,

        borderRadius: 8,

        marginRight: 6,

    },

    statusText: {

        fontSize: 12,

        fontWeight: "700",

    },

    avatar: {

        width: 42,

        height: 42,

        borderRadius: 21,

        backgroundColor: "#DC2626",

        alignItems: "center",

        justifyContent: "center",

    },

    avatarText: {

        color: "#FFFFFF",

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

        backgroundColor: "#FFFFFF",

        borderRadius: 16,

        padding: 18,

        borderWidth: 1,

        borderColor: "#E5E7EB",

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

        backgroundColor: "#DC2626",

        justifyContent: "center",

        alignItems: "center",

        marginBottom: 10,

    },

    profileAvatarText: {

        color: "#FFFFFF",

        fontSize: 22,

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

        color: "#6B7280",

        textAlign: "center",

    },

    divider: {

        width: "100%",

        height: 1,

        backgroundColor: "#E5E7EB",

        marginVertical: 16,

    },

    logoutButton: {

        width: "100%",

        flexDirection: "row",

        justifyContent: "center",

        alignItems: "center",

        gap: 8,

        paddingVertical: 11,

        borderRadius: 10,

        backgroundColor: "#FEF2F2",

    },

    logoutText: {

        color: "#DC2626",

        fontSize: 14,

        fontWeight: "700",

    },
    leftSection: {

        flexDirection: "row",

        alignItems: "center",

    },

    menuButton: {

        marginRight: 12,

    },

    drawerContainer: {

        ...StyleSheet.absoluteFillObject,

        flexDirection: "row",

    },

    drawerOverlay: {

        flex: 1,

        backgroundColor: "rgba(0,0,0,0.35)",

    },

    drawer: {

        position: "absolute",

        left: 0,

        top: 0,

        bottom: 0,

        width: 280,

        backgroundColor: "#FFFFFF",

        paddingTop: 70,

        paddingHorizontal: 20,

        elevation: 20,

        shadowColor: "#000",

        shadowOpacity: 0.2,

        shadowRadius: 10,

    },

    drawerTitle: {

        fontSize: 22,

        fontWeight: "700",

        color: "#111827",

    },

    drawerItem: {

        flexDirection: "row",

        alignItems: "center",

        paddingVertical: 18,

    },

    drawerText: {

        marginLeft: 16,

        fontSize: 17,

        fontWeight: "600",

        color: "#111827",

    },

});