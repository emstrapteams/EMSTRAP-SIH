import mongoose from "mongoose";

const disasterUri =
    process.env.MONGO_URI_FULL_DISASTER ||
    process.env.MONGO_URI_DISASTER;

export const disasterDB = mongoose.createConnection(
    disasterUri,
    {
        serverSelectionTimeoutMS: 10000,
    }
);

export const connectDisasterDB = async () => {
    if (!disasterUri) {
        throw new Error(
            "MONGO_URI_FULL_DISASTER or MONGO_URI_DISASTER is not configured"
        );
    }

    await disasterDB.asPromise();

    console.log(
        "Disaster DB connected: EMSTRAP_FULL_DISASTER_DB"
    );

    return disasterDB;
};