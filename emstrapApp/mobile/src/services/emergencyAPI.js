export const precheckEmergency = async (data) => {
    const res = await API.post(
        "/api/emergency/precheck",
        data
    );

    return res.data;
};

export const createEmergency = async (data) => {
    const res = await API.post(
        "/api/emergency",
        data
    );

    return res.data;
};

export const getEmergencyDetails = async (id) => {
    const res = await API.get(
        `/api/emergency/${id}`
    );

    return res.data;
};

export const cancelEmergencyByUser = async (
    id
) => {
    const res = await API.put(
        `/api/emergency/${id}/user-cancel`
    );

    return res.data;
};

export const uploadEvidence = async (
    requestId,
    imageUrl
) => {
    const res = await API.post(
        `/api/emergency/${requestId}/evidence`,
        {
            imageUrl,
        }
    );

    return res.data;
};