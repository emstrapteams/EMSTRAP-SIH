import React, { useState, useEffect } from "react";
import {
    View,
    TextInput,
    FlatList,
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { searchLocations } from "../../services/locationService";

export default function LocationSearch({
    placeholder,
    value,
    onSelect,
    showCurrentLocation = false,
    onCurrentLocation,
}) {
    const [query, setQuery] = useState(value || "");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    // Keep input synced with parent state
    useEffect(() => {
        setQuery(value || "");
    }, [value]);

    useEffect(() => {
        const timeout = setTimeout(async () => {
            if (!query || query.length < 3) {
                setResults([]);
                return;
            }

            try {
                setLoading(true);

                const locations = await searchLocations(query);

                setResults(locations);
            } finally {
                setLoading(false);
            }
        }, 500);

        return () => clearTimeout(timeout);
    }, [query]);

    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <MaterialCommunityIcons
                    name="magnify"
                    size={22}
                    color="#6B7280"
                />

                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    value={query}
                    onChangeText={setQuery}
                />

                {loading && (
                    <ActivityIndicator
                        size="small"
                        color="#2563EB"
                    />
                )}
            </View>

            {showCurrentLocation && (
                <TouchableOpacity
                    style={styles.currentButton}
                    onPress={onCurrentLocation}
                >
                    <MaterialCommunityIcons
                        name="crosshairs-gps"
                        size={18}
                        color="#2563EB"
                    />

                    <Text style={styles.currentText}>
                        Use Current Location
                    </Text>
                </TouchableOpacity>
            )}

            <FlatList
                keyboardShouldPersistTaps="handled"
                data={results}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.item}
                        onPress={() => {
                            setQuery(item.address);
                            setResults([]);
                            onSelect(item);
                        }}
                    >
                        <MaterialCommunityIcons
                            name="map-marker"
                            size={20}
                            color="#DC2626"
                        />

                        <Text style={styles.address}>
                            {item.address}
                        </Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },

    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        paddingHorizontal: 14,
        height: 56,
    },

    input: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
    },

    currentButton: {
        marginTop: 10,
        flexDirection: "row",
        alignItems: "center",
    },

    currentText: {
        marginLeft: 8,
        color: "#2563EB",
        fontWeight: "600",
    },

    item: {
        flexDirection: "row",
        alignItems: "center",
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
        backgroundColor: "#FFFFFF",
    },

    address: {
        flex: 1,
        marginLeft: 10,
        color: "#374151",
    },
});