import "dotenv/config";
import mongoose from "mongoose";

import User from "../models/user.model.js";
import DisasterUser from "../models/disasterUser.model.js";

import { disasterDB, connectDisasterDB } from "../config/disasterDb.js";
import { connectEmergencyDB } from "../config/emergencyDb.js";


const migrateUsers = async () => {
    try {
        console.log("======================================");
        console.log(" Starting User Migration");
        console.log(" Emergency DB → Disaster DB");
        console.log("======================================");

        // Connect to both databases
        await connectEmergencyDB();
        await connectDisasterDB();

        console.log("✅ Both databases connected");

        // Only migrate normal citizens
        const users = await User.find({ role: "user" }).lean();

        console.log(`👤 Citizens found in Emergency DB: ${users.length}`);

        let created = 0;
        let updated = 0;
        let skipped = 0;

        for (const user of users) {
            if (!user.email) {
                console.log(`⚠️ Skipping user without email: ${user._id}`);
                skipped++;
                continue;
            }

            const userData = {
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                password: user.password,

                isEmailVerified: user.isEmailVerified,

                emailVerificationToken: user.emailVerificationToken,
                emailVerificationExpires: user.emailVerificationExpires,

                passwordResetToken: user.passwordResetToken,
                passwordResetExpires: user.passwordResetExpires,

                address: user.address,
                city: user.city,

                currentLocation: user.currentLocation,

                // Can be populated later from the user's actual district
                districtCode: (() => {
                    const city = String(user.city || "")
                        .trim()
                        .toLowerCase();

                    const bengaluruCities = [
                        "bangalore",
                        "bengaluru",
                        "banglore",
                        "blore"
                    ];

                    return bengaluruCities.includes(city)
                        ? "526"
                        : null;
                })()
            };

            const existingUser = await DisasterUser.findOne({
                email: user.email
            });

            if (existingUser) {
                await DisasterUser.updateOne(
                    { email: user.email },
                    { $set: userData }
                );

                updated++;
            } else {
                await DisasterUser.create(userData);
                created++;
            }
        }

        console.log("");
        console.log("======================================");
        console.log(" Migration Complete");
        console.log("======================================");
        console.log(`👤 Total citizens : ${users.length}`);
        console.log(`🆕 Created        : ${created}`);
        console.log(`🔄 Updated        : ${updated}`);
        console.log(`⚠️ Skipped        : ${skipped}`);
        console.log("======================================");

    } catch (error) {
        console.error("❌ Migration failed:");
        console.error(error);
    } finally {
        // Close Disaster DB
        if (disasterDB?.readyState === 1) {
            await disasterDB.close();
            console.log("🔌 Disaster DB disconnected");
        }

        // Close Emergency DB
        if (mongoose.connection?.readyState === 1) {
            await mongoose.connection.close();
            console.log("🔌 Emergency DB disconnected");
        }
    }
};


migrateUsers();