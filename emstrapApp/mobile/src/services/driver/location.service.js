import API from "../api";

export const updateDriverLocation = async (latitude, longitude) => {
    const response = await API.put("/api/driver/location", {
        latitude,
        longitude,
    });

    return response.data;
};