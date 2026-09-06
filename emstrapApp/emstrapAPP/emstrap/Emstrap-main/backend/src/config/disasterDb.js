import mongoose from "mongoose";

export const disasterDB = mongoose.createConnection(
    process.env.MONGO_URI_DISASTER,
    {
        serverSelectionTimeoutMS: 10000,
    }
);

export const connectDisasterDB = async () => {
    if (!process.env.MONGO_URI_DISASTER) {
        throw new Error("MONGO_URI_DISASTER is not configured");
    }

    await disasterDB.asPromise();

    console.log("✅ Disaster DB connected: EMSTRAP_DISASTER_DB");

    return disasterDB;
};