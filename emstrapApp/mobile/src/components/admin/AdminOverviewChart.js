import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
} from "react-native";

import { LineChart } from "react-native-gifted-charts";

const RANGE_OPTIONS = [
    "1D",
    "1M",
    "3M",
    "6M",
    "1Y",
];

const METRICS = [
    {
        key: "users",
        label: "Users",
        color: "#6366f1",
    },
    {
        key: "bookings",
        label: "Bookings",
        color: "#10b981",
    },
    {
        key: "hospitals",
        label: "Hospitals",
        color: "#3b82f6",
    },
    {
        key: "emergencies",
        label: "Emergencies",
        color: "#ef4444",
    },
    {
        key: "police",
        label: "Police",
        color: "#8b5cf6",
    },
];

const makeData = (chartData, key) =>
    chartData.map((item) => ({
        value: Number(item[key]) || 0,
        label: item.label || "",
    }));

export default function AdminOverviewChart({
    chartData = [],
    selectedRange,
    onRangeChange,
}) {
    const hasData = chartData.length > 0;

    const chartWidth = Math.max(
        Dimensions.get("window").width - 80,
        chartData.length * 65
    );

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.title}>
                    Combined Overview
                </Text>

                <Text style={styles.subtitle}>
                    All admin metrics in one view
                </Text>
            </View>

            {/* Range buttons */}

            <View style={styles.rangeContainer}>
                {RANGE_OPTIONS.map((range) => {
                    const active =
                        selectedRange === range;

                    return (
                        <TouchableOpacity
                            key={range}
                            style={[
                                styles.rangeButton,
                                active &&
                                styles.rangeButtonActive,
                            ]}
                            onPress={() =>
                                onRangeChange(range)
                            }
                        >
                            <Text
                                style={[
                                    styles.rangeText,
                                    active &&
                                    styles.rangeTextActive,
                                ]}
                            >
                                {range}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {!hasData ? (
                <View style={styles.empty}>
                    <Text style={styles.emptyText}>
                        No chart data available.
                    </Text>
                </View>
            ) : (
                <>
                    {/* Legend */}

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={
                            styles.legend
                        }
                    >
                        {METRICS.map((metric) => (
                            <View
                                key={metric.key}
                                style={
                                    styles.legendItem
                                }
                            >
                                <View
                                    style={[
                                        styles.legendDot,
                                        {
                                            backgroundColor:
                                                metric.color,
                                        },
                                    ]}
                                />

                                <Text
                                    style={
                                        styles.legendText
                                    }
                                >
                                    {metric.label}
                                </Text>
                            </View>
                        ))}
                    </ScrollView>

                    {/* Chart */}

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={
                            false
                        }
                    >
                        <LineChart
                            data={makeData(
                                chartData,
                                "users"
                            )}
                            data2={makeData(
                                chartData,
                                "bookings"
                            )}
                            data3={makeData(
                                chartData,
                                "hospitals"
                            )}
                            data4={makeData(
                                chartData,
                                "emergencies"
                            )}
                            data5={makeData(
                                chartData,
                                "police"
                            )}

                            color1="#6366f1"
                            color2="#10b981"
                            color3="#3b82f6"
                            color4="#ef4444"
                            color5="#8b5cf6"

                            thickness={2}
                            thickness2={2}
                            thickness3={2}
                            thickness4={2}
                            thickness5={2}

                            hideDataPoints

                            curved

                            width={chartWidth}

                            height={260}

                            spacing={65}

                            initialSpacing={20}
                            endSpacing={20}

                            noOfSections={5}

                            yAxisThickness={0}
                            xAxisThickness={1}

                            xAxisColor="#e5e7eb"

                            yAxisTextStyle={{
                                color: "#9ca3af",
                                fontSize: 10,
                            }}

                            xAxisLabelTextStyle={{
                                color: "#9ca3af",
                                fontSize: 10,
                            }}

                            rulesColor="#f1f5f9"

                            rulesType="dashed"

                            isAnimated
                        />
                    </ScrollView>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        borderRadius: 18,
        padding: 16,
        marginTop: 20,

        elevation: 2,

        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },

    header: {
        marginBottom: 15,
    },

    title: {
        fontSize: 18,
        fontWeight: "800",
        color: "#111827",
    },

    subtitle: {
        marginTop: 3,
        color: "#9ca3af",
        fontSize: 12,
    },

    rangeContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginBottom: 18,
    },

    rangeButton: {
        paddingHorizontal: 14,
        paddingVertical: 7,

        backgroundColor: "#f3f4f6",

        borderRadius: 20,

        marginRight: 7,
        marginBottom: 7,
    },

    rangeButtonActive: {
        backgroundColor: "#4f46e5",
    },

    rangeText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#6b7280",
    },

    rangeTextActive: {
        color: "#fff",
    },

    legend: {
        paddingBottom: 18,
    },

    legendItem: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 16,
    },

    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 5,
    },

    legendText: {
        color: "#4b5563",
        fontSize: 11,
        fontWeight: "600",
    },

    empty: {
        height: 200,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f9fafb",
        borderRadius: 14,
    },

    emptyText: {
        color: "#9ca3af",
        fontSize: 14,
    },
});