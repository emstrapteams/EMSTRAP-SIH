import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Pressable,
    Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function UserHeader() {
    const router = useRouter();

    const [user, setUser] = useState(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const load = async () => {
            const data = await AsyncStorage.getItem("user");
            if (data) {
                setUser(JSON.parse(data));
            }
        };

        load();
    }, []);

    const initial = user?.name?.charAt(0)?.toUpperCase() || "U";

    const logout = async () => {
        await AsyncStorage.multiRemove([
            "authToken",
            "user",
        ]);

        router.replace("/login");
    };

    return (
        <>
            <SafeAreaView edges={["top"]} style={styles.safeArea}>
                <View style={styles.header}>

                    <Image
                        source={require("../../assets/logo.png")}
                        style={styles.logo}
                        resizeMode="contain"
                    />

                    <TouchableOpacity
                        style={styles.avatar}
                        onPress={() => setVisible(true)}
                    >
                        <Text style={styles.avatarText}>
                            {initial}
                        </Text>
                    </TouchableOpacity>

                </View>
            </SafeAreaView>

            <Modal
                visible={visible}
                transparent
                animationType="fade"
            >
                <Pressable
                    style={styles.overlay}
                    onPress={() => setVisible(false)}
                />

                <View style={styles.card}>

                    <View style={styles.bigAvatar}>
                        <Text style={styles.bigText}>
                            {initial}
                        </Text>
                    </View>

                    <Text style={styles.name}>
                        {user?.name}
                    </Text>

                    <Text style={styles.email}>
                        {user?.email}
                    </Text>

                    <TouchableOpacity
                        style={styles.logout}
                        onPress={logout}
                    >
                        <Text style={styles.logoutText}>
                            Logout
                        </Text>
                    </TouchableOpacity>

                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    header: {
        height: 64,
        backgroundColor: "#fff",

        borderBottomWidth: 1,
        borderBottomColor: "#ECECEC",

        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",

        paddingHorizontal: 18,

        elevation: 4,
    },

    logo: {
        width: 120,
        height: 42,
    },

    avatar: {
        width: 42,
        height: 42,
        borderRadius: 21,

        backgroundColor: "#DC2626",

        justifyContent: "center",
        alignItems: "center",
    },

    avatarText: {
        color: "#fff",
        fontWeight: "800",
        fontSize: 18,
    },

    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.25)",
    },

    card: {
        position: "absolute",
        right: 18,
        top: 70,

        width: 240,

        backgroundColor: "#fff",

        borderRadius: 18,

        padding: 18,

        elevation: 12,

        alignItems: "center",
    },

    bigAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,

        backgroundColor: "#DC2626",

        justifyContent: "center",
        alignItems: "center",
    },

    bigText: {
        color: "#fff",
        fontWeight: "800",
        fontSize: 24,
    },

    name: {
        marginTop: 12,
        fontWeight: "700",
        fontSize: 18,
    },

    email: {
        color: "#666",
        marginTop: 4,
    },

    logout: {
        marginTop: 20,

        backgroundColor: "#FEE2E2",

        width: "100%",

        padding: 12,

        borderRadius: 12,

        alignItems: "center",
    },

    logoutText: {
        color: "#DC2626",
        fontWeight: "700",
    },
    safeArea: {
        backgroundColor: "#FFFFFF",
    },
});