import "dotenv/config";

import {
    connectFullDisasterDB,
    fullDisasterDB
} from "../config/fullDisasterDb.js";

try {
    console.log("Connecting to Full Disaster DB...");

    await connectFullDisasterDB();

    console.log("✅ Connection successful");
    console.log("Database:", fullDisasterDB.name);

    await fullDisasterDB.close();

    console.log("🔌 Connection closed");

    process.exit(0);
} catch (error) {
    console.error("❌ Connection failed:", error.message);
    process.exit(1);
}