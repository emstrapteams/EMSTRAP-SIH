import React from "react";
import {
    TouchableOpacity,
    Text,
    StyleSheet,
} from "react-native";

export default function CompleteTripButton({
    onPress,
    title = "COMPLETE TRIP",
}) {

    return (

        <TouchableOpacity
            style={styles.button}
            onPress={onPress}
        >

            <Text style={styles.text}>
                {title}
            </Text>

        </TouchableOpacity>

    );

}

const styles = StyleSheet.create({

    button: {

        backgroundColor: "#2563EB",

        padding: 18,

        margin: 16,

        borderRadius: 16,

        alignItems: "center",

    },

    text: {

        color: "#fff",

        fontWeight: "700",

        fontSize: 17,

    },

});