import API from "./api";

export const acceptEmergency = async (id) => {
    const { data } = await API.put(
        `/api/emergency/${id}/accept`
    );
    return data;
};

export const declineEmergency = async (id) => {
    const { data } = await API.put(
        `/api/emergency/${id}/decline`
    );
    return data;
};

export const markArrived = async (id) => {
    const { data } = await API.put(
        `/api/emergency/${id}/mark-arrived`
    );
    return data;
};

export const assignHospital = async (
    id,
    hospitalId
) => {
    const { data } = await API.put(
        `/api/emergency/${id}/assign-hospital`,
        {
            hospitalId,
        }
    );

    return data;
};

export const completeEmergency = async (id) => {
    const { data } = await API.put(
        `/api/emergency/${id}/complete`
    );

    return data;
};

export const getDriverHistory = async () => {
    const { data } = await API.get(
        "/api/emergency/driver/history"
    );

    return data;
};
export const getAvailableHospitals = async () => {

    const { data } = await API.get(
        "/api/hospitals/available"
    );

    return data;

};