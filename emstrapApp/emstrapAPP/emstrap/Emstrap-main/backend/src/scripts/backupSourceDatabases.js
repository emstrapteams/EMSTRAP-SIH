import "dotenv/config";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";

const sources = [
    {
        name: "EMSTRAP-Emergency",
        uri: process.env.MONGO_URI,
        folder: "mongo-backup-emergency",
    },
    {
        name: "EMSTRAP_DISASTER_DB",
        uri: process.env.MONGO_URI_DISASTER,
        folder: "mongo-backup-disaster",
    },
];

async function backupDatabase(source) {
    console.log(`\nBacking up ${source.name}...`);

    const db = mongoose.createConnection(source.uri, {
        serverSelectionTimeoutMS: 10000,
    });

    await db.asPromise();

    const collections = await db.db.listCollections().toArray();

    const backupDir = path.resolve(
        source.folder
    );

    fs.mkdirSync(backupDir, {
        recursive: true,
    });

    let totalDocuments = 0;

    for (const collection of collections) {
        const name = collection.name;

        const documents = await db
            .collection(name)
            .find({})
            .toArray();

        const file = path.join(
            backupDir,
            `${name}.json`
        );

        fs.writeFileSync(
            file,
            JSON.stringify(documents, null, 2)
        );

        console.log(
            `   ${name}: ${documents.length}`
        );

        totalDocuments += documents.length;
    }

    await db.close();

    console.log(
        `✅ ${source.name} backup complete`
    );

    console.log(
        `   Collections: ${collections.length}`
    );

    console.log(
        `   Documents: ${totalDocuments}`
    );
}

async function main() {
    try {
        console.log(
            "========================================"
        );
        console.log(
            "EMSTRAP DATABASE BACKUP"
        );
        console.log(
            "========================================"
        );

        for (const source of sources) {
            await backupDatabase(source);
        }

        console.log(
            "\n✅ ALL BACKUPS COMPLETE"
        );
    } catch (error) {
        console.error(
            "\n❌ BACKUP FAILED:"
        );

        console.error(error.message);

        process.exitCode = 1;
    }
}

await main();