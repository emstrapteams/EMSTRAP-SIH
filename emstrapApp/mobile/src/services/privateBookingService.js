import API from "./api";

/* ----------------------------- */
/* AVAILABLE BOOKINGS            */
/* ----------------------------- */

export async function getAvailableBookings() {

    const res = await API.get(
        "/api/bookings/available"
    );

    return res.data.data;

}

/* ----------------------------- */
/* ACCEPT                        */
/* ----------------------------- */

export async function acceptBooking(id) {

    const res = await API.put(
        `/api/bookings/${id}/accept`
    );

    return res.data.data;

}

/* ----------------------------- */
/* DECLINE                       */
/* ----------------------------- */

export async function declineBooking(id) {

    const res = await API.put(
        `/api/bookings/${id}/decline`
    );

    return res.data.data;

}

/* ----------------------------- */
/* ARRIVED                       */
/* ----------------------------- */

export async function arriveBooking(id) {

    const res = await API.put(
        `/api/bookings/${id}/arrive`
    );

    return res.data.data;

}

/* ----------------------------- */
/* START TRIP                    */
/* ----------------------------- */

export async function startBookingTrip(id) {

    const res = await API.put(
        `/api/bookings/${id}/start`
    );

    return res.data.data;

}

/* ----------------------------- */
/* COMPLETE                      */
/* ----------------------------- */

export async function completeBooking(id) {

    const res = await API.put(
        `/api/bookings/${id}/complete`
    );

    return res.data.data;

}
export async function getBookingHistory() {

    const res = await API.get(
        "/api/bookings/history"
    );
    console.log(res.data);

    return res.data.data;

}