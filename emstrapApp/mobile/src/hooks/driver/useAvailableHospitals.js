import { useEffect, useState } from "react";

import { getAvailableHospitals } from "../../services/driverEmergencyService";

export default function useAvailableHospitals() {

    const [loading, setLoading] = useState(true);

    const [hospitals, setHospitals] = useState([]);

    useEffect(() => {

        loadHospitals();

    }, []);

    async function loadHospitals() {

        try {

            const res = await getAvailableHospitals();

            setHospitals(
                res.hospitals ||
                res.data?.hospitals ||
                []
            );

        } catch (err) {

            console.log(err);

        } finally {

            setLoading(false);

        }

    }

    return {

        hospitals,

        loading,

        refresh: loadHospitals,

    };

}