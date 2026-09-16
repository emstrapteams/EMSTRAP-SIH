import "dotenv/config";
import mongoose from "mongoose";

const emergencyDB = mongoose.createConnection(
    process.env.MONGO_URI,
    { serverSelectionTimeoutMS: 10000 }
);

const disasterDB = mongoose.createConnection(
    process.env.MONGO_URI_DISASTER,
    { serverSelectionTimeoutMS: 10000 }
);

const fullDB = mongoose.createConnection(
    process.env.MONGO_URI_FULL_DISASTER,
    { serverSelectionTimeoutMS: 10000 }
);

const closeConnections = async () => {
    await Promise.all([
        emergencyDB.close(),
        disasterDB.close(),
        fullDB.close(),
    ]);
};

const copyCollection = async (
    source,
    destination,
    collectionName
) => {
    const docs = await source
        .collection(collectionName)
        .find({})
        .toArray();

    if (!docs.length) {
        console.log(`   ${collectionName}: 0`);
        return;
    }

    await destination
        .collection(collectionName)
        .insertMany(docs);

    console.log(
        `   ${collectionName}: ${docs.length}`
    );
};

/*
 * Escape email for regex lookup.
 */
const escapeRegex = (value) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/*
 * Copy the complete existing Disaster DB.
 *
 * The destination is empty, so all ObjectIds and
 * internal references remain unchanged.
 */
const copyDisasterDB = async () => {
    console.log("\n================================");
    console.log("1. COPYING DISASTER DB");
    console.log("================================");

    const collections =
        await disasterDB.db.listCollections().toArray();

    for (const { name } of collections) {
        await copyCollection(
            disasterDB,
            fullDB,
            name
        );
    }
};

/*
 * Merge Emergency DB users into the destination users.
 *
 * Existing Disaster users are matched by email.
 * If matched, we record:
 *
 * old Emergency user ID → destination user ID
 *
 * This mapping is later used by emergencyrequests.
 */
const mergeUsers = async () => {
    console.log("\n================================");
    console.log("2. MERGING USERS");
    console.log("================================");

    const sourceUsers =
        await emergencyDB
            .collection("users")
            .find({})
            .toArray();

    const destination =
        fullDB.collection("users");

    const userMap = new Map();

    for (const sourceUser of sourceUsers) {
        let existing = null;

        if (sourceUser.email) {
            existing =
                await destination.findOne({
                    email: {
                        $regex:
                            "^" +
                            escapeRegex(
                                sourceUser.email.trim()
                            ) +
                            "$",
                        $options: "i",
                    },
                });
        }

        if (existing) {
            userMap.set(
                sourceUser._id.toString(),
                existing._id
            );

            console.log(
                `   Existing: ${sourceUser.email}`
            );

            continue;
        }

        await destination.insertOne({
            ...sourceUser,
        });

        userMap.set(
            sourceUser._id.toString(),
            sourceUser._id
        );

        console.log(
            `   Added: ${sourceUser.email || sourceUser._id}`
        );
    }

    console.log(
        `Users processed: ${sourceUsers.length}`
    );

    return userMap;
};

/*
 * Merge Emergency hospitals.
 *
 * Disaster DB currently has zero hospitals,
 * but this remains safe if that changes later.
 */
const mergeHospitals = async () => {
    console.log("\n================================");
    console.log("3. MERGING HOSPITALS");
    console.log("================================");

    const sourceHospitals =
        await emergencyDB
            .collection("hospitals")
            .find({})
            .toArray();

    const destination =
        fullDB.collection("hospitals");

    const hospitalMap = new Map();

    for (const hospital of sourceHospitals) {
        let existing = null;

        if (hospital.email) {
            existing =
                await destination.findOne({
                    email: hospital.email,
                });
        }

        if (existing) {
            hospitalMap.set(
                hospital._id.toString(),
                existing._id
            );

            console.log(
                `   Existing: ${hospital.name}`
            );

            continue;
        }

        const converted = {
            ...hospital,

            hospitalCode:
                hospital.hospitalCode ||
                `LEGACY-${hospital._id
                    .toString()
                    .slice(-8)
                    .toUpperCase()}`,

            contactNumber:
                hospital.contactNumber ||
                hospital.mobile ||
                "",

            emergencyAvailable:
                hospital.emergencyAvailable ??
                hospital.isAvailable ??
                true,

            availableBeds:
                hospital.availableBeds ??
                hospital.emergencyBeds ??
                0,

            emergencyCapacity:
                hospital.emergencyCapacity ??
                hospital.emergencyBeds ??
                0,

            status:
                hospital.status || "ACTIVE",

            currentPatients:
                hospital.currentPatients || [],
        };

        /*
         * Keep original data, but remove fields
         * that belong only to the old schema.
         */
        delete converted.mobile;
        delete converted.isAvailable;

        await destination.insertOne(
            converted
        );

        hospitalMap.set(
            hospital._id.toString(),
            converted._id
        );

        console.log(
            `   Added: ${hospital.name}`
        );
    }

    console.log(
        `Hospitals processed: ${sourceHospitals.length}`
    );

    return hospitalMap;
};

/*
 * Ambulances need their own ID map because
 * emergencyrequests reference them.
 *
 * We keep the original "ambulances" collection
 * unchanged so existing AI/emergency code can
 * continue to understand it.
 */
const copyAmbulances = async () => {
    console.log("\n================================");
    console.log("4. COPYING AMBULANCES");
    console.log("================================");

    const source =
        await emergencyDB
            .collection("ambulances")
            .find({})
            .toArray();

    const destination =
        fullDB.collection("ambulances");

    const ambulanceMap = new Map();

    for (const ambulance of source) {
        await destination.insertOne({
            ...ambulance,
        });

        ambulanceMap.set(
            ambulance._id.toString(),
            ambulance._id
        );
    }

    console.log(
        `Ambulances copied: ${source.length}`
    );

    return ambulanceMap;
};

/*
 * Copy non-overlapping Emergency collections.
 *
 * bookings is deliberately excluded.
 */
const copyOtherEmergencyCollections = async () => {
    console.log("\n================================");
    console.log("5. COPYING OTHER EMERGENCY DATA");
    console.log("================================");

    const collections = [
        "polices",
        "government_ambulances",
        "alert_histories",
        "alert_images",
        "police_alerts",
        "emergency_alerts",
        "emergency_responders",
        "incidenttimelines",
        "payments",
        "ai_severities",
        "firealerts",
        "image_comparisons",
        "admins",
        "ambulance_recommendations",
    ];

    for (const name of collections) {
        await copyCollection(
            emergencyDB,
            fullDB,
            name
        );
    }
};

/*
 * Copy emergencyrequests.
 *
 * IMPORTANT:
 * We preserve the complete old document,
 * including:
 *
 * - embedding
 * - aiAnalysis
 * - duplicateDetected
 * - similarityScore
 * - evidence
 *
 * References are remapped where necessary.
 */
const copyEmergencyRequests = async (
    userMap,
    hospitalMap,
    ambulanceMap
) => {
    console.log("\n================================");
    console.log("6. COPYING EMERGENCY REQUESTS");
    console.log("================================");

    const sourceRequests =
        await emergencyDB
            .collection("emergencyrequests")
            .find({})
            .sort({ createdAt: 1 })
            .toArray();

    const destination =
        fullDB.collection("emergencyrequests");

    /*
     * Old request ID → destination request ID.
     *
     * We preserve the original ID because the
     * destination collection is new and empty.
     */
    const requestMap = new Map();

    for (const request of sourceRequests) {
        requestMap.set(
            request._id.toString(),
            request._id
        );
    }

    const converted = sourceRequests.map(
        (request) => {
            const doc = {
                ...request,
            };

            /*
             * User reference.
             */
            if (request.user) {
                const mapped =
                    userMap.get(
                        request.user.toString()
                    );

                if (mapped) {
                    doc.user = mapped;
                }
            }

            /*
             * Hospital reference.
             */
            if (request.hospital) {
                const mapped =
                    hospitalMap.get(
                        request.hospital.toString()
                    );

                if (mapped) {
                    doc.hospital = mapped;
                }
            }

            /*
             * Ambulance reference.
             */
            if (request.ambulance) {
                const mapped =
                    ambulanceMap.get(
                        request.ambulance.toString()
                    );

                if (mapped) {
                    doc.ambulance = mapped;
                }
            }

            /*
             * Declined users.
             */
            if (
                Array.isArray(
                    request.declinedBy
                )
            ) {
                doc.declinedBy =
                    request.declinedBy.map(
                        (id) =>
                            userMap.get(
                                id.toString()
                            ) || id
                    );
            }

            /*
             * Duplicate emergency reference.
             */
            if (request.duplicateOf) {
                doc.duplicateOf =
                    requestMap.get(
                        request.duplicateOf.toString()
                    ) || request.duplicateOf;
            }

            return doc;
        }
    );

    if (converted.length) {
        await destination.insertMany(
            converted
        );
    }

    console.log(
        `Emergency requests copied: ${converted.length}`
    );

    return requestMap;
};

const verifyCounts = async () => {
    console.log("\n================================");
    console.log("7. FINAL VERIFICATION");
    console.log("================================");

    const collections =
        await fullDB.db.listCollections().toArray();

    let total = 0;

    for (const { name } of collections) {
        const count =
            await fullDB
                .collection(name)
                .countDocuments();

        total += count;

        console.log(
            `   ${name}: ${count}`
        );
    }

    console.log(
        `\nTotal documents: ${total}`
    );

    return total;
};

const main = async () => {
    try {
        console.log(
            "========================================"
        );
        console.log(
            "EMSTRAP FULL DISASTER DB MIGRATION"
        );
        console.log(
            "========================================"
        );

        await Promise.all([
            emergencyDB.asPromise(),
            disasterDB.asPromise(),
            fullDB.asPromise(),
        ]);

        console.log(
            "✅ All databases connected"
        );

        /*
         * SAFETY CHECK
         */
        const existing =
            await fullDB.db
                .listCollections()
                .toArray();

        if (existing.length > 0) {
            throw new Error(
                "Destination database is NOT EMPTY. Migration aborted."
            );
        }

        console.log(
            "✅ Destination database is empty"
        );

        /*
         * Copy existing Disaster DB first.
         */
        await copyDisasterDB();

        /*
         * Merge overlapping collections.
         */
        const userMap =
            await mergeUsers();

        const hospitalMap =
            await mergeHospitals();

        const ambulanceMap =
            await copyAmbulances();

        /*
         * Copy remaining Emergency data.
         */
        await copyOtherEmergencyCollections();

        /*
         * Finally copy requests with
         * reference mappings.
         */
        await copyEmergencyRequests(
            userMap,
            hospitalMap,
            ambulanceMap
        );

        await verifyCounts();

        console.log(
            "\n========================================"
        );
        console.log(
            "✅ MIGRATION SUCCESSFUL"
        );
        console.log(
            "========================================"
        );

        console.log(
            "\n❌ bookings was NOT migrated."
        );

        console.log(
            "✅ Source databases were not modified."
        );

    } catch (error) {
        console.error(
            "\n❌ MIGRATION FAILED"
        );

        console.error(error);

        process.exitCode = 1;
    } finally {
        await closeConnections();
    }
};

await main();