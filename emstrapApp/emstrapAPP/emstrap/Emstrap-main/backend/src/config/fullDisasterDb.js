import mongoose from "mongoose";

export const fullDisasterDB = mongoose.createConnection(
    process.env.MONGO_URI_FULL_DISASTER,
    {
        serverSelectionTimeoutMS: 10000,
    }
);

export const connectFullDisasterDB = async () => {
    if (!process.env.MONGO_URI_FULL_DISASTER) {
        throw new Error(
            "MONGO_URI_FULL_DISASTER is not configured"
        );
    }

    await fullDisasterDB.asPromise();

    console.log(
        "✅ Full Disaster DB connected: EMSTRAP_FULL_DISASTER_DB"
    );

    return fullDisasterDB;
};