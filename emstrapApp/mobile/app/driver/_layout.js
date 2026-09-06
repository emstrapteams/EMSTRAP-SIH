import { Stack } from "expo-router";
import { DriverProvider } from "../../src/context/DriverContext";

export default function DriverLayout() {

    return (

        <DriverProvider>

            <Stack
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Stack.Screen name="index" />
                <Stack.Screen name="emergency" />
                <Stack.Screen name="navigation" />
                <Stack.Screen name="hospital" />
                <Stack.Screen name="history" />
                <Stack.Screen name="profile" />
            </Stack>

        </DriverProvider>

    );

}