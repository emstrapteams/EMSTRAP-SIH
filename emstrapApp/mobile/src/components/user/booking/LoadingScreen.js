import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function LoadingScreen() {
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#DC2626" />

            <Text style={styles.title}>
                Loading Emergency
            </Text>

            <Text style={styles.subtitle}>
                Fetching the latest emergency information...
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 30,
    },

    title: {
        marginTop: 20,
        fontSize: 22,
        fontWeight: "700",
        color: "#111827",
    },

    subtitle: {
        marginTop: 8,
        fontSize: 15,
        color: "#6B7280",
        textAlign: "center",
        lineHeight: 22,
    },
});