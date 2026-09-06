import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
} from "react-native";

import { getAIStats } from "../../services/api";
import AdminSurface from "./AdminSurface";

function Stat({ title, value, color }) {
    return (
        <View style={styles.statCard}>
            <Text style={styles.statTitle}>{title}</Text>
            <Text style={[styles.statValue, { color }]}>
                {value}
            </Text>
        </View>
    );
}

export default function AIEmergencyPanel() {
    const [loading, setLoading] = useState(true);

    const [aiDisabled, setAiDisabled] = useState(false);

    const [stats, setStats] = useState({
        fires: 0,
        accidents: 0,
        nonEmergency: 0,
        critical: 0,
        high: 0,
        averageConfidence: 0,
    });

    useEffect(() => {
        load();
    }, []);

    async function load() {
        try {
            const res = await getAIStats();

            if (res.success) {
                setStats(res.stats);
                setAiDisabled(false);
            } else if (res.aiDisabled) {
                setAiDisabled(true);
            }
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
        }
    }

    return (
        <AdminSurface style={{ marginTop: 16 }}>

            <View style={styles.header}>

                <View>

                    <Text style={styles.title}>
                        AI Emergency Intelligence
                    </Text>

                    <Text style={styles.subtitle}>
                        Live Emergency Classification Analytics
                    </Text>

                </View>

                <Text
                    style={{
                        color: aiDisabled ? "red" : "green",
                        fontWeight: "bold",
                    }}
                >
                    {aiDisabled ? "DISABLED" : "ACTIVE"}
                </Text>

            </View>

            {loading ? (

                <ActivityIndicator
                    size="large"
                    style={{ marginTop: 25 }}
                />

            ) : aiDisabled ? (

                <View style={styles.disabledBox}>
                    <Text style={styles.disabledTitle}>
                        AI Disabled
                    </Text>

                    <Text style={styles.disabledText}>
                        FastAPI AI service is currently unavailable.
                    </Text>
                </View>

            ) : (

                <View style={styles.grid}>

                    <Stat
                        title="Fires"
                        value={stats.fires}
                        color="#dc2626"
                    />

                    <Stat
                        title="Accidents"
                        value={stats.accidents}
                        color="#ea580c"
                    />

                    <Stat
                        title="Non Emergency"
                        value={stats.nonEmergency}
                        color="#16a34a"
                    />

                    <Stat
                        title="Critical"
                        value={stats.critical}
                        color="#b91c1c"
                    />

                    <Stat
                        title="High"
                        value={stats.high}
                        color="#d97706"
                    />

                    <Stat
                        title="AI Confidence"
                        value={`${stats.averageConfidence}%`}
                        color="#2563eb"
                    />

                </View>

            )}

        </AdminSurface>
    );
}

const styles = StyleSheet.create({

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    title: {
        fontSize: 20,
        fontWeight: "bold",
    },

    subtitle: {
        color: "#666",
        marginTop: 3,
    },

    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginTop: 20,
    },

    statCard: {
        width: "48%",
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 15,
        marginBottom: 12,
        elevation: 2,
    },

    statTitle: {
        color: "#777",
        fontSize: 13,
    },

    statValue: {
        marginTop: 10,
        fontSize: 28,
        fontWeight: "bold",
    },

    disabledBox: {
        alignItems: "center",
        padding: 30,
    },

    disabledTitle: {
        fontSize: 20,
        fontWeight: "bold",
    },

    disabledText: {
        color: "#666",
        textAlign: "center",
        marginTop: 10,
    },

});