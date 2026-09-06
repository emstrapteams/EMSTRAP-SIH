import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import AdminDrawer from "./AdminDrawer";
import AdminHeader from "./AdminHeader";

export default function AdminLayout({
    title,
    description,
    children,
}) {
    const [drawerVisible, setDrawerVisible] =
        useState(false);

    return (
        <SafeAreaView style={styles.safe}>
            <AdminHeader
                title="emstrap"
                onMenuPress={() =>
                    setDrawerVisible(true)
                }
            />

            <AdminDrawer
                visible={drawerVisible}
                onClose={() =>
                    setDrawerVisible(false)
                }
            />

            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>
                        {title}
                    </Text>

                    {description ? (
                        <Text style={styles.description}>
                            {description}
                        </Text>
                    ) : null}
                </View>

                <View style={styles.body}>
                    {children}
                </View>
            </View>
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
        paddingHorizontal: 18,
        paddingTop: 18,
    },

    header: {
        marginBottom: 15,
    },

    body: {
        flex: 1,
    },

    title: {
        fontSize: 30,
        fontWeight: "bold",
        color: "#111",
    },

    description: {
        marginTop: 6,
        fontSize: 15,
        color: "#666",
    },
});