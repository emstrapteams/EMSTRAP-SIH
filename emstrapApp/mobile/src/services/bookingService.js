import API from "./api";

export const createBooking = async (bookingData) => {
    const response = await API.post("/api/bookings", bookingData);
    return response.data;
};

export const getBookingDetails = async (bookingId) => {
    const response = await API.get(`/api/bookings/${bookingId}`);
    return response.data;
};