import { Stack } from "expo-router";
import { PrivateDriverProvider } from "../../src/context/PrivateDriverContext";

export default function PrivateDriverLayout() {

    return (

        <PrivateDriverProvider>

            <Stack
                screenOptions={{
                    headerShown: false,
                }}
            >

                <Stack.Screen name="index" />

                <Stack.Screen
                    name="pickup-navigation"
                />

                <Stack.Screen
                    name="drop-navigation"
                />

                <Stack.Screen
                    name="history"
                />

                <Stack.Screen
                    name="profile"
                />

            </Stack>

        </PrivateDriverProvider>

    );

}