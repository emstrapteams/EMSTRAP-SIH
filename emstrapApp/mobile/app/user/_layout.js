import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import FloatingEmergencyButton from "../../src/components/common/FloatingEmergencyButton";

export default function UserLayout() {
    return (
        <>
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarActiveTintColor: "#dc2626",
                    tabBarInactiveTintColor: "#777",
                    tabBarStyle: {
                        height: 65,
                        paddingBottom: 8,
                        paddingTop: 6,
                    },
                }}
            >

                <Tabs.Screen
                    name="booking"
                    options={{
                        title: "Booking",
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons
                                name="calendar"
                                size={size}
                                color={color}
                            />
                        ),
                    }}
                />

                <Tabs.Screen
                    name="dashboard"
                    options={{
                        title: "Dashboard",
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons
                                name="grid"
                                size={size}
                                color={color}
                            />
                        ),
                    }}
                />

                <Tabs.Screen
                    name="profile"
                    options={{
                        title: "Profile",
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons
                                name="person"
                                size={size}
                                color={color}
                            />
                        ),
                    }}
                />

                <Tabs.Screen
                    name="searching-driver"
                    options={{ href: null }}
                />

                <Tabs.Screen
                    name="booking-tracking"
                    options={{ href: null }}
                />

                <Tabs.Screen
                    name="tracking"
                    options={{ href: null }}
                />
            </Tabs>

            <FloatingEmergencyButton />
        </>
    );
}