import React, { useState } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import PoliceHeader from "./PoliceHeader";
import PoliceDrawer from "./PoliceDrawer";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
export default function PoliceLayout({
    title,
    description,
    children,
    scroll = true,
}) {
    const [drawerVisible, setDrawerVisible] =
        useState(false);
    const router = useRouter();

    const handleLogout = async () => {
        try {
            setDrawerVisible(false);

            await AsyncStorage.removeItem("authToken");

            router.replace("/login");
        } catch (error) {
            console.log(
                "POLICE LOGOUT ERROR:",
                error
            );
        }
    };
    const content = (
        <>
            <View style={styles.pageHeader}>
                <Text style={styles.title}>
                    {title}
                </Text>

                {description ? (
                    <Text style={styles.description}>
                        {description}
                    </Text>
                ) : null}
            </View>

            {children}
        </>
    );

    return (
        <SafeAreaView style={styles.safe}>
            <PoliceHeader
                onMenuPress={() =>
                    setDrawerVisible(true)
                }
                onLogout={handleLogout}
            />

            <PoliceDrawer
                visible={drawerVisible}
                onClose={() =>
                    setDrawerVisible(false)
                }
                onLogout={handleLogout}
            />

            {scroll ? (
                <ScrollView
                    style={styles.container}
                    contentContainerStyle={
                        styles.content
                    }
                    showsVerticalScrollIndicator={
                        false
                    }
                >
                    {content}
                </ScrollView>
            ) : (
                <View style={styles.container}>
                    <View style={styles.content}>
                        {content}
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: "#f4f6f9",
    },

    container: {
        flex: 1,
    },

    content: {
        flexGrow: 1,
        paddingHorizontal: 18,
        paddingTop: 18,
        paddingBottom: 80,
    },

    pageHeader: {
        marginBottom: 20,
    },

    title: {
        fontSize: 30,
        fontWeight: "800",
        color: "#111827",
    },

    description: {
        marginTop: 6,
        fontSize: 14,
        lineHeight: 20,
        color: "#6b7280",
    },
});