import React, { useEffect, useRef } from "react";
import { StyleSheet } from "react-native";
import MapView, {
    Marker,
    Polyline,
} from "react-native-maps";

export default function DriverMap({

    driverLocation,

    patient,

    route,

}) {

    const mapRef = useRef(null);

    useEffect(() => {

        if (
            !driverLocation ||
            !patient
        )
            return;

        mapRef.current?.fitToCoordinates(
            [

                driverLocation,

                {
                    latitude: patient.latitude,
                    longitude: patient.longitude,
                },

            ],

            {

                edgePadding: {

                    top: 120,

                    bottom: 120,

                    left: 80,

                    right: 80,

                },

                animated: true,

            }

        );

    }, [driverLocation, patient]);

    if (!driverLocation || !patient)
        return null;

    return (

        <MapView

            ref={mapRef}

            style={styles.map}

            initialRegion={{

                latitude:
                    driverLocation.latitude,

                longitude:
                    driverLocation.longitude,

                latitudeDelta: 0.05,

                longitudeDelta: 0.05,

            }}

        >

            <Marker

                coordinate={driverLocation}

                title="Driver"

                pinColor="blue"

            />

            <Marker

                coordinate={{

                    latitude:
                        patient.latitude,

                    longitude:
                        patient.longitude,

                }}

                title="Patient"

                pinColor="red"

            />

            {route.length > 0 && (

                <Polyline

                    coordinates={route}

                    strokeWidth={6}

                    strokeColor="#2563EB"

                />

            )}

        </MapView>

    );

}

const styles = StyleSheet.create({

    map: {

        flex: 1,

    },

});