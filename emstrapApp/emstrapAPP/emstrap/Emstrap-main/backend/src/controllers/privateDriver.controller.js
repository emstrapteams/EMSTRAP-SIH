import bcrypt from "bcryptjs";
import { getBookingConnection } from "../config/bookingDb.js";
import { getBookingDriverModel } from "../models/bookingDriver.model.js";
import Ambulance from "../models/ambulance.model.js";
import { getBookingDbBookingModel } from "../models/bookingDbBooking.model.js";
import { getIO } from "../sockets/socket.js";
export const createPrivateDriver = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            mobile,
            address,
            city,
            vehicleNumber,
        } = req.body;

        const bookingConnection = getBookingConnection();

        const Driver =
            getBookingDriverModel(bookingConnection);

        const existingDriver =
            await Driver.findOne({ email });

        if (existingDriver) {
            return res.status(400).json({
                success: false,
                message: "Driver already exists",
            });
        }

        const role = req.body.role || "private_driver";

        const hashedPassword =
            await bcrypt.hash(password, 10);

        if (role === "ambulance_driver") {

            const existingAmbulance =
                await Ambulance.findOne({ email });

            if (existingAmbulance) {
                return res.status(400).json({
                    success: false,
                    message: "Driver already exists",
                });
            }

            const driver = await Ambulance.create({
                name,
                email,
                password: hashedPassword,
                mobile,
                address,
                city,
                vehicleNumber,
                role: "ambulance_driver",
                isEmailVerified: true,
            });

            return res.status(201).json({
                success: true,
                driver,
            });
        }

        const driver = await Driver.create({
            name,
            email,
            password: hashedPassword,
            mobile,
            address,
            city,
            vehicleNumber,
            role: "private_driver",
            isEmailVerified: true,
        });

        return res.status(201).json({
            success: true,
            driver,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
export const getPrivateDrivers = async (req, res) => {
    try {
        const bookingConnection =
            getBookingConnection();

        const Driver =
            getBookingDriverModel(bookingConnection);

        const drivers =
            await Driver.find().select("-password");

        res.status(200).json({
            success: true,
            drivers,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
export const updatePrivateDriver = async (req, res) => {
    try {
        const { id } = req.params;
        const allowedFields = ["name", "email", "mobile", "address", "city", "vehicleNumber", "driverStatus", "isEmailVerified"];
        const updatePayload = {};

        for (const field of allowedFields) {
            if (typeof req.body[field] !== "undefined") {
                updatePayload[field] = req.body[field];
            }
        }

        if (typeof req.body.password === "string" && req.body.password.trim()) {
            updatePayload.password = await bcrypt.hash(req.body.password, 10);
        }

        const bookingConnection = getBookingConnection();
        const Driver = getBookingDriverModel(bookingConnection);

        const driver = await Driver.findByIdAndUpdate(id, updatePayload, {
            new: true,
            runValidators: true,
        }).select("-password");

        if (!driver) {
            return res.status(404).json({
                success: false,
                message: "Driver not found",
            });
        }

        res.status(200).json({
            success: true,
            driver,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
export const updateDriverLocation = async (req, res) => {
    try {

        if (req.user.role !== "private_driver") {
            return res.status(403).json({
                success: false,
                message: "Private driver access required",
            });
        }

        const { latitude, longitude } = req.body;

        if (latitude == null || longitude == null) {
            return res.status(400).json({
                success: false,
                message: "Latitude and longitude are required",
            });
        }

        const bookingConnection = getBookingConnection();

        const Driver = getBookingDriverModel(bookingConnection);

        const driver = await Driver.findById(req.user._id);

        if (!driver) {
            return res.status(404).json({
                success: false,
                message: "Driver not found",
            });
        }

        driver.currentLocation = {
            latitude,
            longitude,
            updatedAt: new Date(),
        };

        await driver.save();

        const Booking = getBookingDbBookingModel(bookingConnection);

        const activeBooking = await Booking.findOne({
            ambulance: driver._id,
            status: {
                $in: [
                    "ACCEPTED",
                    "ARRIVED",
                    "IN_PROGRESS",
                ],
            },
        });

        if (activeBooking) {

            const io = getIO();

            io.to(`request_${activeBooking._id}`).emit(
                "driver_location_updated",
                {
                    latitude,
                    longitude,
                }
            );
        }

        return res.status(200).json({
            success: true,
            currentLocation: driver.currentLocation,
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};
export const updatePrivateDriverStatus = async (
    req,
    res
) => {

    try {

        if (req.user.role !== "private_driver") {

            return res.status(403).json({
                success: false,
                message: "Private driver access required",
            });

        }

        const { driverStatus } = req.body;

        const bookingConnection =
            getBookingConnection();

        const Driver =
            getBookingDriverModel(
                bookingConnection
            );

        const driver =
            await Driver.findByIdAndUpdate(

                req.user._id,

                {
                    driverStatus,
                },

                {
                    new: true,
                }

            ).select("-password");

        if (!driver) {

            return res.status(404).json({
                success: false,
                message: "Driver not found",
            });

        }

        res.status(200).json({
            success: true,
            driver,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};
export const getCurrentBooking = async (
    req,
    res
) => {

    try {

        const bookingConnection =
            getBookingConnection();

        const Booking =
            getBookingDbBookingModel(
                bookingConnection
            );

        const booking =
            await Booking.findOne({

                ambulance: req.user._id,

                status: {

                    $in: [

                        "ACCEPTED",

                        "ARRIVED",

                        "IN_PROGRESS",

                    ],

                },

            })

                .populate("user")

                .populate("ambulance");

        res.status(200).json({

            success: true,

            booking,

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message,

        });

    }

};
export const deletePrivateDriver = async (
    req,
    res
) => {
    try {
        const { id } = req.params;

        const bookingConnection =
            getBookingConnection();

        const Driver =
            getBookingDriverModel(bookingConnection);

        const driver =
            await Driver.findByIdAndDelete(id);

        if (!driver) {
            return res.status(404).json({
                success: false,
                message: "Driver not found",
            });
        }

        res.status(200).json({
            success: true,
            message:
                "Driver deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
export const updateMyProfile = async (req, res) => {

    try {

        if (req.user.role !== "private_driver") {

            return res.status(403).json({

                success: false,

                message: "Private driver access required",

            });

        }

        const bookingConnection =
            getBookingConnection();

        const Driver =
            getBookingDriverModel(
                bookingConnection
            );

        const driver =
            await Driver.findById(req.user._id);

        if (!driver) {

            return res.status(404).json({

                success: false,

                message: "Driver not found",

            });

        }

        driver.name =
            req.body.name ?? driver.name;

        driver.mobile =
            req.body.mobile ?? driver.mobile;

        driver.city =
            req.body.city ?? driver.city;

        driver.address =
            req.body.address ?? driver.address;

        driver.vehicleNumber =
            req.body.vehicleNumber ??
            driver.vehicleNumber;

        await driver.save();

        res.json({

            success: true,

            driver,

        });

    } catch (err) {

        res.status(500).json({

            success: false,

            message: err.message,

        });

    }

};
export const getPendingBookings = async (req, res) => {

    try {

        const driverId = req.user._id;

        const connection =
            getBookingConnection();

        const Booking =
            getBookingDbBookingModel(connection);

        const thirtyMinutesAgo = new Date(
            Date.now() - 30 * 60 * 1000
        );

        const bookings = await Booking.find({

            status: "PENDING",

            ambulance: null,

            declinedBy: { $ne: driverId },

            createdAt: { $gte: thirtyMinutesAgo },

        })

            .populate("user", "name mobile email")

            .sort({ createdAt: -1 });

        res.json({

            success: true,

            data: bookings,

        });

    } catch (err) {

        res.status(500).json({

            success: false,

            message: err.message,

        });

    }

};