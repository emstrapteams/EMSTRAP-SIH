import "dotenv/config";
import { connectDisasterDB } from "../config/disasterDb.js";

import FireStation from "../models/fireStation.model.js";
import Firefighter from "../models/firefighter.model.js";
import RescueTeam from "../models/rescueTeam.model.js";

const seedResponders = async () => {
    try {
        await connectDisasterDB();

        console.log("Creating disaster responder test data...");

        // 1. Fire Station
        let station = await FireStation.findOne({
            stationCode: "FD-BLR-001"
        });

        if (!station) {
            station = await FireStation.create({
                name: "Central Disaster Fire Station",
                stationCode: "FD-BLR-001",
                location: {
                    latitude: 12.9716,
                    longitude: 77.5946
                },
                address: "Central Bangalore",
                contactNumber: "9876543210",
                status: "ACTIVE"
            });

            console.log("✅ Fire station created");
        } else {
            console.log("ℹ️ Fire station already exists");
        }


        // 2. Firefighters
        const firefighterData = [
            {
                name: "Arun Kumar",
                employeeId: "FF-BLR-001",
                mobile: "9876500001",
                email: "arun.ff@example.com",
                station: station._id,
                districtCode: "526",
                specialization: [
                    "FLOOD_RESCUE",
                    "WATER_RESCUE"
                ],
                availability: "AVAILABLE",
                currentLocation: {
                    latitude: 12.9716,
                    longitude: 77.5946
                }
            },
            {
                name: "Rahul Singh",
                employeeId: "FF-BLR-002",
                mobile: "9876500002",
                email: "rahul.ff@example.com",
                station: station._id,
                districtCode: "526",
                specialization: [
                    "SEARCH_AND_RESCUE",
                    "COLLAPSE_RESCUE"
                ],
                availability: "AVAILABLE",
                currentLocation: {
                    latitude: 12.9716,
                    longitude: 77.5946
                }
            }
        ];

        const firefighters = [];

        for (const data of firefighterData) {
            let firefighter = await Firefighter.findOne({
                employeeId: data.employeeId
            });

            if (!firefighter) {
                firefighter = await Firefighter.create(data);
                console.log(`✅ Firefighter created: ${data.name}`);
            } else {
                firefighter.districtCode = data.districtCode;
                await firefighter.save();

                console.log(
                    `ℹ️ Firefighter already exists: ${data.name} — district updated`
                );
            }
            firefighters.push(firefighter);
        }


        // 3. Rescue Team
        let rescueTeam = await RescueTeam.findOne({
            teamCode: "RT-BLR-001"
        });

        if (!rescueTeam) {
            rescueTeam = await RescueTeam.create({
                teamName: "Central Flood Rescue Team",
                teamCode: "RT-BLR-001",
                station: station._id,
                districtCode: "526",
                members: firefighters.map(
                    firefighter => firefighter._id
                ),
                specialization: [
                    "FLOOD_RESCUE",
                    "WATER_RESCUE",
                    "SEARCH_AND_RESCUE"
                ],
                availability: "AVAILABLE",
                currentLocation: {
                    latitude: 12.9716,
                    longitude: 77.5946
                },
                equipment: []
            });

            console.log("✅ Rescue team created");
        } else {
            rescueTeam.districtCode = "526";
            await rescueTeam.save();

            console.log(
                "ℹ️ Rescue team already exists — district updated"
            );
        }


        // 4. Link firefighters and rescue team back to station
        station.firefighters = firefighters.map(
            firefighter => firefighter._id
        );

        station.rescueTeams = [rescueTeam._id];

        await station.save();


        // 5. Link firefighters to rescue team
        await Firefighter.updateMany(
            {
                _id: {
                    $in: firefighters.map(
                        firefighter => firefighter._id
                    )
                }
            },
            {
                $set: {
                    rescueTeam: rescueTeam._id
                }
            }
        );

        console.log("");
        console.log("====================================");
        console.log("✅ DISASTER RESPONDER DATA READY");
        console.log("====================================");
        console.log(`Fire Station : ${station._id}`);
        console.log(`Rescue Team  : ${rescueTeam._id}`);
        console.log(
            `Firefighters : ${firefighters.length}`
        );
        console.log(
            `Team Status  : ${rescueTeam.availability}`
        );
        console.log("====================================");

        process.exit(0);

    } catch (error) {
        console.error(
            "❌ Failed to seed responder data:",
            error
        );

        process.exit(1);
    }
};

seedResponders();