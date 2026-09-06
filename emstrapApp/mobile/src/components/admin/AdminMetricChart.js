import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Dimensions,
} from "react-native";

import { LineChart } from "react-native-gifted-charts";

export default function AdminMetricChart({
    title,
    subtitle,
    data = [],
    dataKey,
    color,
}) {
    const chartData = data.map((item) => ({
        value: Number(item[dataKey]) || 0,
        label: item.label || "",
    }));

    const chartWidth = Math.max(
        Dimensions.get("window").width - 90,
        chartData.length * 60
    );

    return (
        <View style={styles.card}>
            <Text style={styles.title}>
                {title}
            </Text>

            {subtitle ? (
                <Text style={styles.subtitle}>
                    {subtitle}
                </Text>
            ) : null}

            {chartData.length === 0 ? (
                <View style={styles.empty}>
                    <Text style={styles.emptyText}>
                        No data available
                    </Text>
                </View>
            ) : (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                >
                    <LineChart
                        data={chartData}
                        color={color}
                        thickness={3}
                        curved
                        hideDataPoints={false}
                        dataPointsColor={color}
                        dataPointsRadius={3}

                        width={chartWidth}
                        height={220}
                        spacing={60}

                        initialSpacing={20}
                        endSpacing={20}

                        noOfSections={4}

                        yAxisThickness={0}
                        xAxisThickness={1}
                        xAxisColor="#e5e7eb"

                        rulesColor="#f1f5f9"
                        rulesType="dashed"

                        yAxisTextStyle={{
                            color: "#9ca3af",
                            fontSize: 10,
                        }}

                        xAxisLabelTextStyle={{
                            color: "#9ca3af",
                            fontSize: 10,
                        }}

                        isAnimated
                    />
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        borderRadius: 18,
        padding: 16,
        marginTop: 18,

        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },

    title: {
        fontSize: 18,
        fontWeight: "800",
        color: "#111827",
    },

    subtitle: {
        marginTop: 4,
        marginBottom: 18,
        color: "#9ca3af",
        fontSize: 12,
    },

    empty: {
        height: 160,
        justifyContent: "center",
        alignItems: "center",
    },

    emptyText: {
        color: "#9ca3af",
    },
});