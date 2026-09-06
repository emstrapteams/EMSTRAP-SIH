import { connectEmergencyDB } from "./emergencyDb.js";
import { connectBookingDB } from "./bookingDb.js";
import { connectDisasterDB } from "./disasterDb.js";
const connectDB = async () => {
  try {
    console.log("Connecting databases...");

    await connectEmergencyDB();
    await connectBookingDB();
    await connectDisasterDB();
    console.log("✅ All databases connected");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    throw error;
  }
};

export default connectDB;