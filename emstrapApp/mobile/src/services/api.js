import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export const API_URL =
    "https://emstrap-mobile-backend.onrender.com";
const API = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

API.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem("authToken");

    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export const getErrorMessage = (
    error,
    fallback = "Something went wrong"
) =>
    error?.response?.data?.message ||
    error?.message ||
    fallback;

export const getOverviewStats = async () => {
    const res = await API.get("/api/overview-stats");
    return res.data;
};

export const getActiveEmergencies = async () => {
    const res = await API.get("/api/emergency");
    return res.data;
};

export const getActiveBookings = async () => {
    const res = await API.get("/api/bookings");
    return res.data;
};

export const getAdminStats = async (range = "1D") => {
    const res = await API.get("/api/admin/stats", {
        params: { range },
    });

    return res.data;
};

export const getAIStats = async () => {
    try {
        const res = await API.get("/api/admin/ai-stats");
        return res.data;
    } catch (error) {
        return {
            success: false,
            aiDisabled: true,
            stats: {
                fires: 0,
                accidents: 0,
                medical: 0,
                nonEmergency: 0,
                critical: 0,
                high: 0,
                moderate: 0,
                low: 0,
                averageConfidence: 0,
            },
        };
    }
};

export const getPoliceEmergencies = async () => {
    const res = await API.get(
        "/api/police/emergencies"
    );

    return res.data;
};

export const getPoliceCases = async () => {
    const res = await API.get("/api/police/cases");
    return res.data;
};

export const updatePoliceCaseStatus = async (
    caseId,
    status
) => {
    const res = await API.put(
        `/api/police/cases/${caseId}/status`,
        { status }
    );

    return res.data;
};

export const getPoliceOverviewStats = async () => {
    const res = await API.get(
        "/api/police/overview-stats"
    );

    return res.data;
};

export const getPoliceChartStats = async (
    range = "1D"
) => {
    const res = await API.get(
        `/api/admin/police/stats?range=${range}`
    );

    return res.data;
};

export const changePasswordAPI = async (
    currentPassword,
    newPassword
) => {
    const res = await API.put(
        "/auth/change-password",
        {
            currentPassword,
            newPassword,
        }
    );

    return res.data;
};
// ============================================
// HOSPITAL APIs
// ============================================

export const getHospitals = async () => {
    const res = await API.get(
        "/api/hospitals"
    );

    return res.data;
};

export const getAvailableHospitals = async () => {
    const res = await API.get(
        "/api/hospitals/available"
    );

    return res.data;
};

export const getHospitalById = async (
    hospitalId
) => {
    const res = await API.get(
        `/api/hospitals/${hospitalId}`
    );

    return res.data;
};

export const updateEmergencyBeds = async (
    emergencyBeds
) => {
    const res = await API.patch(
        "/api/hospitals/update-beds",
        {
            emergencyBeds,
        }
    );

    return res.data;
};
// HOSPITAL APIs

export const getAlerts = async () => {
    const res = await API.get("/api/alerts");
    return res.data;
};

export const getStats = async () => {
    const res = await API.get("/api/stats");
    return res.data;
};

export const updateHospitalAlertStatus = async (
    id,
    status
) => {
    const res = await API.put(
        `/api/emergencies/${id}/status`,
        { status }
    );

    return res.data;
};
export const getCurrentUser = async () => {
    const res = await API.get("/auth/me");
    return res.data;
};
export const getHospitalPatients = async () => {
    const res = await API.get(
        "/api/hospitals/patients"
    );

    return res.data;
};
export const updateHospitalProfile = async (data) => {
    const res = await API.put(
        "/api/hospitals/profile",
        data
    );

    return res.data;
};

export const resolveHospitalCase = async (id) => {
    const res = await API.put(
        `/api/hospitals/patients/${id}/resolve`
    );

    return res.data;
};
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

// ============================================
// PRIVATE DRIVER APIs
// ============================================

export const updateDriverLocation = async (
    latitude,
    longitude
) => {
    const res = await API.put(
        "/api/driver/location",
        {
            latitude,
            longitude,
        }
    );

    return res.data;
};
API.interceptors.response.use(
    (response) => response,
    (error) => {

        console.log("════════════════════");
        console.log("❌ API ERROR");
        console.log("METHOD:", error.config?.method?.toUpperCase());
        console.log("URL:", error.config?.url);
        console.log("STATUS:", error.response?.status);
        console.log("BODY:", error.response?.data);
        console.log("════════════════════");

        return Promise.reject(error);
    }
);
export default API;