import API from "./api";

export const getHospitals = async () => {
    const res = await API.get("/api/hospitals");
    return res.data;
};

export const addHospital = async (payload) => {
    const res = await API.post("/api/hospitals", payload);
    return res.data;
};

export const updateHospital = async (id, payload) => {
    const res = await API.put(`/api/hospitals/${id}`, payload);
    return res.data;
};

export const deleteHospital = async (id) => {
    const res = await API.delete(`/api/hospitals/${id}`);
    return res.data;
};