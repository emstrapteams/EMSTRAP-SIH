import React from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function LocationPicker({
    label,
    placeholder,
    value,
    onChangeText,
    onUseCurrentLocation,
    showCurrentLocation = false,
}) {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>

            <View style={styles.inputContainer}>
                <MaterialCommunityIcons
                    name="map-marker-outline"
                    size={22}
                    color="#9CA3AF"
                />

                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor="#9CA3AF"
                    value={value}
                    onChangeText={onChangeText}
                />
            </View>

            {showCurrentLocation && (
                <TouchableOpacity
                    style={styles.locationButton}
                    onPress={onUseCurrentLocation}
                    activeOpacity={0.8}
                >
                    <MaterialCommunityIcons
                        name="crosshairs-gps"
                        size={20}
                        color="#2563EB"
                    />

                    <Text style={styles.locationText}>
                        Use Current Location
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },

    label: {
        fontSize: 15,
        fontWeight: "600",
        color: "#374151",
        marginBottom: 8,
    },

    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        paddingHorizontal: 14,
        height: 56,
    },

    input: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        color: "#111827",
    },

    locationButton: {
        marginTop: 10,
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        backgroundColor: "#EFF6FF",
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
    },

    locationText: {
        marginLeft: 8,
        fontSize: 14,
        fontWeight: "600",
        color: "#2563EB",
    },
});