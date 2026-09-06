import polyline from "@mapbox/polyline";

export const getRoute = async (pickup, dropoff) => {
    try {
        const url =
            `https://router.project-osrm.org/route/v1/driving/` +
            `${pickup.longitude},${pickup.latitude};` +
            `${dropoff.longitude},${dropoff.latitude}` +
            `?overview=false`;

        const response = await fetch(url);

        const data = await response.json();

        if (!data.routes?.length) return null;

        return {
            distanceKm: Number((data.routes[0].distance / 1000).toFixed(1)),
            durationMin: Math.ceil(data.routes[0].duration / 60),
        };
    } catch (err) {
        console.log(err);
        return null;
    }
};
export const getRoutePolyline = async (
    origin,
    destination
) => {
    try {

        const url =
            `https://router.project-osrm.org/route/v1/driving/` +
            `${origin.longitude},${origin.latitude};` +
            `${destination.longitude},${destination.latitude}` +
            `?overview=full&geometries=polyline`;

        const response = await fetch(url);

        const data = await response.json();

        if (!data.routes?.length) return null;

        const route = data.routes[0];

        return {

            coordinates: polyline
                .decode(route.geometry)
                .map(([latitude, longitude]) => ({
                    latitude,
                    longitude,
                })),

            distanceKm: Number(
                (route.distance / 1000).toFixed(1)
            ),

            durationMin: Math.ceil(
                route.duration / 60
            ),

        };

    } catch (err) {

        console.log(err);

        return null;

    }
};