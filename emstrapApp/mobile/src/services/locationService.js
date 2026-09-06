export const searchLocations = async (query) => {
    if (!query || query.trim().length < 3) return [];

    try {
        const url =
            `https://nominatim.openstreetmap.org/search?` +
            `q=${encodeURIComponent(query)}` +
            `&format=json` +
            `&limit=5` +
            `&addressdetails=1`;

        const response = await fetch(url, {
            headers: {
                Accept: "application/json",
                "User-Agent": "EMSTRAP-Mobile",
            },
        });

        const text = await response.text();

        console.log("STATUS:", response.status);
        console.log("BODY:", text);

        const data = JSON.parse(text);

        return data.map((item) => ({
            id: item.place_id.toString(),
            address: item.display_name,
            latitude: Number(item.lat),
            longitude: Number(item.lon),
        }));
    } catch (error) {
        console.error("Location search error:", error);
        return [];
    }
};