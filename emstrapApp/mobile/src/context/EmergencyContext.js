import React, { createContext, useContext, useState } from "react";

const EmergencyContext = createContext();

export const EmergencyProvider = ({ children }) => {
    const [location, setLocation] = useState(null);
    const [photo, setPhoto] = useState(null);

    const clearEmergency = () => {
        setLocation(null);
        setPhoto(null);
    };

    return (
        <EmergencyContext.Provider
            value={{
                location,
                setLocation,
                photo,
                setPhoto,
                clearEmergency,
            }}
        >
            {children}
        </EmergencyContext.Provider>
    );
};

export const useEmergency = () => useContext(EmergencyContext);