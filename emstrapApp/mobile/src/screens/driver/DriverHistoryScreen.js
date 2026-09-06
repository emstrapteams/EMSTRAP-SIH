import React, { useEffect, useState } from "react";
import {
    SafeAreaView,
    FlatList,
    Text,
    StyleSheet,
} from "react-native";

import DriverHeader from "../../components/driver/DriverHeader";
import HistoryCard from "../../components/driver/HistoryCard";

import { getDriverHistory } from "../../services/driverService";

export default function DriverHistoryScreen() {

    const [history, setHistory] = useState([]);

    useEffect(() => {

        loadHistory();

    }, []);

    async function loadHistory() {

        try {

            const data =
                await getDriverHistory();

            setHistory(data);

        } catch (err) {

            console.log(err);

        }

    }

    return (

        <SafeAreaView style={styles.container}>

            <DriverHeader />

            <FlatList

                data={history}

                keyExtractor={(item) => item._id}

                renderItem={({ item }) => (

                    <HistoryCard trip={item} />

                )}

                ListEmptyComponent={

                    <Text style={styles.empty}>

                        No completed emergencies.

                    </Text>

                }

            />

        </SafeAreaView>

    );

}

const styles = StyleSheet.create({

    container: {

        flex: 1,

        backgroundColor: "#F8FAFC",

    },

    empty: {

        marginTop: 100,

        textAlign: "center",

        color: "#6B7280",

        fontSize: 16,

    },

});