import { useLocalSearchParams } from "expo-router";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    RefreshControl,
} from "react-native";

import useTracking from "../src/hooks/useTracking";
import EmergencyHeader from "../src/components/common/EmergencyHeader";
import LoadingScreen from "../src/components/tracking/LoadingScreen";
import StatusCard from "../src/components/tracking/StatusCard";
import EmergencyCard from "../src/components/tracking/EmergencyCard";
import AmbulanceCard from "../src/components/tracking/AmbulanceCard";
import HospitalCard from "../src/components/tracking/HospitalCard";
import Timeline from "../src/components/tracking/Timeline";
import CancelButton from "../src/components/tracking/CancelButton";
import LiveMap from "../src/components/tracking/LiveMap";
import EvidenceCard from "../src/components/tracking/EvidenceCard";
export default function TrackingScreen() {
    const { requestId } = useLocalSearchParams();

    const {
        emergency,
        loading,
        error,
        refresh,
        refreshing,
    } = useTracking(requestId);

    if (loading) {
        return <LoadingScreen />;
    }

    if (error) {
        return (
            <SafeAreaView style={styles.center}>
                <Text style={styles.error}>{error}</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>

            <EmergencyHeader />
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={refresh}
                    />
                }
            >
                <StatusCard emergency={emergency} />

                <EvidenceCard
                    emergencyId={emergency?._id}
                    evidence={emergency?.evidence || []}
                    onUploaded={refresh}
                />

                <EmergencyCard emergency={emergency} />

                <AmbulanceCard emergency={emergency} />

                <HospitalCard emergency={emergency} />

                <LiveMap emergency={emergency} />

                <Timeline emergency={emergency} />

                <CancelButton
                    emergency={emergency}
                    onCancel={refresh}
                />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },

    content: {
        paddingHorizontal: 16,
        paddingBottom: 40,
        paddingTop: 12,
        gap: 16,
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    error: {
        fontSize: 16,
        color: "red",
    },
});