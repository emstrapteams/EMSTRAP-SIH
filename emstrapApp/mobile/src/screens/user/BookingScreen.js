import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
} from "react-native";

import UserHeader from "../../components/common/UserHeader";
import LocationSearch from "../../components/user/LocationSearch";
import DistanceCard from "../../components/user/DistanceCard";
import AmbulanceTypeCard from "../../components/user/AmbulanceTypeCard";
import FareCard from "../../components/user/FareCard";
import BookingButton from "../../components/user/BookingButton";
import SectionCard from "../../components/common/SectionCard";
import { getCurrentLocation } from "../../utils/user/locationPermission";
import { getRoute } from "../../services/routeService";
import { createBooking } from "../../services/bookingService";
export default function BookingScreen() {

    const router = useRouter();

    const [pickup, setPickup] = useState(null);
    const [dropoff, setDropoff] = useState(null);
    const [distance, setDistance] = useState(null);
    const [duration, setDuration] = useState(null); const [selectedType, setSelectedType] = useState("BLS");

    const ambulanceTypes = [
        {
            code: "BASIC",
            title: "Basic Support",
            description: "Standard transport with first-aid trained staff.",
            baseFare: 250,
            perKm: 18,
            icon: "ambulance",
        },
        {
            code: "OXYGEN",
            title: "Oxygen Support",
            description: "Oxygen-equipped ambulance for respiratory emergencies.",
            baseFare: 300,
            perKm: 20,
            icon: "medical-bag",
        },
        {
            code: "ICU",
            title: "ICU Ambulance",
            description: "Advanced Life Support with ICU equipment.",
            baseFare: 400,
            perKm: 25,
            icon: "hospital-box",
        },
        {
            code: "PREGNANT",
            title: "Pregnancy Care",
            description: "Specialized ambulance for maternity and neonatal care.",
            baseFare: 450,
            perKm: 25,
            icon: "baby-face-outline",
        },
    ];
    const selectedAmbulance = ambulanceTypes.find(
        (item) => item.code === selectedType
    );
    const fare =
        distance && selectedAmbulance
            ? Math.round(
                selectedAmbulance.baseFare +
                distance * selectedAmbulance.perKm
            )
            : selectedAmbulance?.baseFare || 0;
    useEffect(() => {
        const calculateRoute = async () => {
            if (!pickup || !dropoff) return;

            const route = await getRoute(pickup, dropoff);

            if (!route) return;

            setDistance(route.distanceKm);
            setDuration(route.durationMin);
        };

        calculateRoute();
    }, [pickup, dropoff]);
    const handleCurrentLocation = async () => {
        try {
            const location = await getCurrentLocation();


            setPickup({
                id: "current-location",
                address: "Current Location",
                latitude: location.latitude,
                longitude: location.longitude,
            });

            console.log(location);
        } catch (error) {
            console.log(error);
        }
    };
    const handleBooking = async () => {
        try {
            if (!pickup || !dropoff) {
                alert("Please select pickup and destination.");
                return;
            }

            const bookingData = {
                pickupLocation: {
                    address: pickup.address,
                    latitude: pickup.latitude,
                    longitude: pickup.longitude,
                },

                dropoffLocation: {
                    address: dropoff.address,
                    latitude: dropoff.latitude,
                    longitude: dropoff.longitude,
                },

                ambulanceType: selectedType,

                distanceKm: distance,

                needs: "",
            };

            const response = await createBooking(bookingData);

            console.log(response);

            router.push({
                pathname: "/user/searching-driver",
                params: {
                    bookingId: response.data._id,
                },
            });
        } catch (err) {
            console.log(err);
            alert("Booking failed.");
        }
    };
    return (
        <SafeAreaView style={styles.container}>

            <UserHeader />

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >

                <SectionCard>
                    <Text style={styles.sectionTitle}>
                        ROUTE DETAILS
                    </Text>

                    <Text style={styles.label}>Pickup Location</Text>

                    <LocationSearch
                        placeholder="Search pickup location..."
                        value={pickup?.address}
                        showCurrentLocation={true}
                        onCurrentLocation={handleCurrentLocation}
                        onSelect={setPickup}
                    />
                    <Text style={styles.label}>Drop-off Location</Text>

                    <LocationSearch
                        placeholder="Search destination..."
                        value={dropoff?.address}
                        onSelect={setDropoff}
                    />
                </SectionCard>
                <DistanceCard
                    distance={distance}
                    duration={duration}
                />
                <SectionCard>
                    <Text style={styles.sectionTitle}>
                        AMBULANCE TYPE
                    </Text>

                    {ambulanceTypes.map((item) => (
                        <AmbulanceTypeCard
                            key={item.code}
                            {...item}
                            selected={selectedType === item.code}
                            onPress={() => setSelectedType(item.code)}
                        />
                    ))}
                </SectionCard>
                <SectionCard>
                    <FareCard
                        distance={distance}
                        fare={fare}
                    />
                </SectionCard>

                <BookingButton
                    title="Confirm Booking"
                    onPress={handleBooking}
                />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9FAFB",
    },

    content: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 120,
    },

    sectionTitle: {
        fontSize: 13,
        fontWeight: "700",
        color: "#9CA3AF",
        marginBottom: 16,
        letterSpacing: 1,
    },
    label: {
        fontSize: 15,
        fontWeight: "600",
        color: "#374151",
        marginBottom: 8,
    },
});