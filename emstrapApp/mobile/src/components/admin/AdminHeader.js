import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Pressable,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function AdminHeader({ title = "EmSTraP", onMenuPress }) {
    const router = useRouter();
    const { user, logoutUser } = useAuth();

    const [menuVisible, setMenuVisible] = useState(false);

    const initial =
        user?.name?.charAt(0)?.toUpperCase() || "A";

    function logout() {
        setMenuVisible(false);
        logoutUser();
        router.replace("/login");
    }

    return (
        <>
            <View style={styles.header}>
                <TouchableOpacity onPress={onMenuPress}>
                    <Ionicons
                        name="menu"
                        size={28}
                        color="#111"
                    />
                </TouchableOpacity>

                <Text style={styles.logo}>
                    {title}
                </Text>

                <TouchableOpacity
                    onPress={() => setMenuVisible(true)}
                    style={styles.avatar}
                >
                    <Text style={styles.avatarText}>
                        {initial}
                    </Text>
                </TouchableOpacity>
            </View>

            <Modal
                visible={menuVisible}
                transparent
                animationType="fade"
            >
                <Pressable
                    style={styles.overlay}
                    onPress={() => setMenuVisible(false)}
                >
                    <View style={styles.menu}>
                        <Text style={styles.name}>
                            {user?.name}
                        </Text>

                        <Text style={styles.email}>
                            {user?.email}
                        </Text>

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
        </>
    );
}

const styles = StyleSheet.create({

    header: {
        height: 60,
        backgroundColor: "#fff",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 18,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },

    logo: {
        fontWeight: "bold",
        fontSize: 20,
    },

    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#ef4444",
        justifyContent: "center",
        alignItems: "center",
    },

    avatarText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 18,
    },

    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,.3)",
        justifyContent: "flex-start",
        alignItems: "flex-end",
        paddingTop: 70,
        paddingRight: 12,
    },

    menu: {
        width: 220,
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 15,
    },

    name: {
        fontWeight: "bold",
        fontSize: 17,
    },

    email: {
        color: "#666",
        marginTop: 3,
        marginBottom: 15,
    },

    item: {
        flexDirection: "row",
        alignItems: "center",
    },

    logout: {
        color: "#ef4444",
        marginLeft: 10,
        fontWeight: "600",
    },

});