import {
    SafeAreaView,
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function LandingScreen() {

    const router = useRouter();

    return (

        <SafeAreaView style={styles.container}>

            <Image
                source={require("../src/assets/logo.png")}
                style={styles.logo}
                resizeMode="contain"
            />

            <Text style={styles.title}>
                EMSTRAP
            </Text>

            <Text style={styles.subtitle}>
                Protecting Lives Through AI
            </Text>



            <TouchableOpacity
                style={styles.loginButton}
                onPress={() => router.push("/login")}
            >

                <Text style={styles.loginText}>
                    Login
                </Text>

            </TouchableOpacity>

            <TouchableOpacity
                style={styles.registerButton}
                onPress={() => router.push("/register")}
            >

                <Text style={styles.registerText}>
                    Register
                </Text>

            </TouchableOpacity>

        </SafeAreaView>

    );

}
const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#fff",
        justifyContent: "center",
        paddingHorizontal: 25,
    },

    logo: {
        width: 130,
        height: 130,
        alignSelf: "center",
        marginBottom: 15,
    },

    title: {
        fontSize: 32,
        fontWeight: "700",
        textAlign: "center",
    },

    subtitle: {
        textAlign: "center",
        color: "#666",
        marginTop: 5,
        marginBottom: 45,
        fontSize: 16,
    },


    loginButton: {
        backgroundColor: "#111827",
        borderRadius: 16,
        paddingVertical: 17,
        alignItems: "center",
        marginBottom: 15,
    },

    loginText: {
        color: "white",
        fontWeight: "700",
        fontSize: 18,
    },

    registerButton: {
        borderWidth: 2,
        borderColor: "#dc2626",
        borderRadius: 16,
        paddingVertical: 17,
        alignItems: "center",
    },

    registerText: {
        color: "#dc2626",
        fontWeight: "700",
        fontSize: 18,
    },

});