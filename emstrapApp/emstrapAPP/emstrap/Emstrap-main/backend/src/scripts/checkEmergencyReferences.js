import "dotenv/config";
import mongoose from "mongoose";

const db = mongoose.createConnection(process.env.MONGO_URI);

try {
    await db.asPromise();

    const c = db.collection("emergencyrequests");

    console.log("Total requests:", await c.countDocuments());

    console.log(
        "With user:",
        await c.countDocuments({ user: { $ne: null } })
    );

    console.log(
        "With hospital:",
        await c.countDocuments({ hospital: { $ne: null } })
    );

    console.log(
        "With ambulance:",
        await c.countDocuments({ ambulance: { $ne: null } })
    );

    console.log(
        "With responder:",
        await c.countDocuments({ responder: { $ne: null } })
    );

    console.log(
        "With duplicateOf:",
        await c.countDocuments({ duplicateOf: { $ne: null } })
    );

    console.log(
        "With declinedBy:",
        await c.countDocuments({
            declinedBy: {
                $exists: true,
                $ne: [],
            },
        })
    );

} catch (error) {
    console.error("Error:", error.message);
    process.exitCode = 1;
} finally {
    await db.close();
}