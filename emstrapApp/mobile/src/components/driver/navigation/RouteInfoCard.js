import React from "react";
import {
    View,
    Text,
    StyleSheet,
} from "react-native";

export default function RouteInfoCard({

    distance,

    duration,

}) {

    return (

        <View style={styles.card}>

            <View style={styles.item}>

                <Text style={styles.value}>
                    {distance != null
                        ? `${distance.toFixed(1)} km`
                        : "-- km"}
                </Text>

                <Text style={styles.label}>
                    Distance
                </Text>

            </View>

            <View style={styles.item}>

                <Text style={styles.value}>
                    {duration != null
                        ? `${Math.round(duration)} min`
                        : "-- min"}
                </Text>

                <Text style={styles.label}>
                    ETA
                </Text>

            </View>

        </View>

    );

}

const styles = StyleSheet.create({

    card: {

        flexDirection: "row",

        justifyContent: "space-around",

        backgroundColor: "#fff",

        padding: 18,

        borderRadius: 18,

        margin: 16,

        elevation: 4,

    },

    item: {

        alignItems: "center",

    },

    value: {

        fontSize: 24,

        fontWeight: "700",

        color: "#111827",

    },

    label: {

        color: "#6B7280",

        marginTop: 4,

    },

});