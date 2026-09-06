import API from "./api";

export const updateDriverStatus = async (
    status
) => {

    const res = await API.put(
        "/api/private-drivers/status",
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
        "/api/private-drivers/location",
        {
            latitude,
            longitude,
        }
    );

    return res.data;

};

export const getCurrentBooking = async () => {

    const res = await API.get(
        "/api/private-drivers/current-booking"
    );

    return res.data;

};

export const updateProfile = async (data) => {

    const res = await API.put(

        "/api/private-drivers/profile",

        data

    );

    return res.data.driver;

};
export const getPendingBookings = async () => {

    const res = await API.get(
        "/api/private-drivers/pending"
    );

    return res.data.data;

};