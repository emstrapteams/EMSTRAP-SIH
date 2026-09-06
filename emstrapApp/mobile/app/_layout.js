import { useEffect } from "react";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

import AuthProvider from "../src/context/AuthContext";
import { EmergencyProvider } from "../src/context/EmergencyContext";
import { initializeNotifications } from "../src/services/notificationService";

export default function RootLayout() {

    useEffect(() => {

        initializeNotifications();

    }, []);

    return (

        <SafeAreaProvider>

            <AuthProvider>

                <EmergencyProvider>

                    <Stack
                        screenOptions={{
                            headerShown: false,
                        }}
                    />

                </EmergencyProvider>

            </AuthProvider>

        </SafeAreaProvider>

    );

}