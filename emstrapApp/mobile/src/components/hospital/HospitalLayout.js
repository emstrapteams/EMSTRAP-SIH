import React, { useState } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import HospitalHeader from "./HospitalHeader";
import HospitalDrawer from "./HospitalDrawer";

export default function HospitalLayout({
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

    const content = (
        <>
            {(title || description) && (
                <View style={styles.pageHeader}>
                    {title ? (
                        <Text style={styles.title}>
                            {title}
                        </Text>
                    ) : null}

                    {description ? (
                        <Text
                            style={
                                styles.description
                            }
                        >
                            {description}
                        </Text>
                    ) : null}
                </View>
            )}

            {children}
        </>
    );

    return (
        <SafeAreaView style={styles.safe}>
            {/* Fixed Hospital Navbar */}
            <HospitalHeader
                onMenuPress={() =>
                    setDrawerVisible(true)
                }
            />

            {/* Hospital Navigation Drawer */}
            <HospitalDrawer
                visible={drawerVisible}
                onClose={() =>
                    setDrawerVisible(false)
                }
                onLogout={handleLogout}
            />

            {/* Page Content */}
            {scroll ? (
                <ScrollView
                    style={styles.container}
                    contentContainerStyle={
                        styles.content
                    }
                    showsVerticalScrollIndicator={
                        false
                    }
                    keyboardShouldPersistTaps="handled"
                >
                    {content}
                </ScrollView>
            ) : (
                <View style={styles.container}>
                    <View
                        style={[
                            styles.content,
                            styles.nonScrollContent,
                        ]}
                    >
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

    nonScrollContent: {
        flex: 1,
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