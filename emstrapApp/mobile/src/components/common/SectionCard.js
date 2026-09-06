import React from "react";
import { View, StyleSheet } from "react-native";

export default function SectionCard({ children }) {
    return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        padding: 18,
        marginBottom: 22,
        borderWidth: 1,
        borderColor: "#E5E7EB",

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 6,

        elevation: 2,
    },
});