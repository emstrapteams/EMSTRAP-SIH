import "dotenv/config";
import mongoose from "mongoose";
import { disasterDB, connectDisasterDB } from "../config/disasterDb.js";
import { connectEmergencyDB } from "../config/emergencyDb.js";

const inspectDatabase = async (name, connection) => {
    console.log(`\n================ ${name} ================`);

    const collections = await connection.db
        .listCollections()
        .toArray();

    if (collections.length === 0) {
        console.log("No collections found.");
        return;
    }

    for (const collection of collections) {
        const count = await connection.db
            .collection(collection.name)
            .countDocuments();

        console.log(`${collection.name}: ${count}`);
    }
};

const main = async () => {
    try {
        console.log("Connecting to databases...");

        await connectEmergencyDB();
        await connectDisasterDB();

        await inspectDatabase(
            "EMERGENCY DB",
            mongoose.connection
        );

        await inspectDatabase(
            "DISASTER DB",
            disasterDB
        );

        console.log("\n✅ Inventory completed.");
    } catch (error) {
        console.error("\n❌ Inventory failed:", error);
    } finally {
        await mongoose.disconnect();
        await disasterDB.close();
    }
};

main();