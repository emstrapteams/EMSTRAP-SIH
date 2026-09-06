import API from "./api";
export const updateDriverStatus = async (status) => {
    const res = await API.put(
        "/api/ambulances/status",
        {
            driverStatus: status,
        }
    );

    return res.data;
};

export const updateDriverLocation = async (
    latitude,
    longitude
) => {

    const res = await API.put(
        "/api/ambulances/location",
        {
            latitude,
            longitude,
        }
    );

    return res.data;
};

export const getCurrentEmergency = async () => {

    const res = await API.get(
        "/api/ambulances/current-emergency"
    );

    return res.data;

};
export const getDriverHistory = async () => {

    const res = await API.get(
        "/api/ambulances/history"
    );

    return res.data.data;

};
export const updateProfile = async (data) => {

    const res = await API.put(

        "/api/ambulances/profile",

        data

    );

    return res.data.driver;

};
export const getPendingEmergencies = async () => {

    const res = await API.get(
        "/api/ambulances/pending"
    );

    return res.data.data;

};