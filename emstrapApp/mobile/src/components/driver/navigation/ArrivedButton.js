import React from "react";
import {
    TouchableOpacity,
    Text,
    StyleSheet,
} from "react-native";

export default function ArrivedButton({
    onPress,
    title = "ARRIVED",
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

        backgroundColor: "#16A34A",

        padding: 18,

        margin: 16,

        borderRadius: 14,

        alignItems: "center",

    },

    text: {

        color: "#fff",

        fontSize: 18,

        fontWeight: "700",

    },

});