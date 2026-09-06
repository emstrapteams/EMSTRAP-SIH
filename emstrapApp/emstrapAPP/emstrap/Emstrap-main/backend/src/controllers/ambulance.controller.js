import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import EmergencyRequest from "../models/emergencyRequest.model.js";
import { getIO } from "../sockets/socket.js";
import Ambulance from "../models/ambulance.model.js";
const driverStatuses = ["LIVE", "OFFLINE"];

const validateAmbulancePayload = (payload, isPartial = false) => {
  const requiredFields = ["name", "vehicleNumber", "mobile", "address", "city", "email"];
  if (!isPartial) {
    requiredFields.push("password");
  }

  for (const field of requiredFields) {
    if (!isPartial && !String(payload[field] || "").trim()) {
      return `${field} is required`;
    }
  }

  if (payload.driverStatus && !driverStatuses.includes(payload.driverStatus)) {
    return "Invalid driver status";
  }

  return null;
};

export const getAmbulances = async (req, res) => {
  try {
    const ambulances = await Ambulance.find({ role: 'ambulance_driver' }).select("-password").sort({ createdAt: -1 });
    return res.status(200).json({ success: true, ambulances });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching ambulance drivers", error: error.message });
  }
};

export const getAmbulanceById = async (req, res) => {
  try {
    const ambulance = await Ambulance.findOne({ _id: req.params.id, role: 'ambulance_driver' }).select("-password");

    if (!ambulance) {
      return res.status(404).json({ success: false, message: "Ambulance driver not found" });
    }

    return res.status(200).json({ success: true, ambulance });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching ambulance driver", error: error.message });
  }
};

export const createAmbulance = async (req, res) => {
  try {
    const validationError = validateAmbulancePayload(req.body);
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const ambulance = await Ambulance.create({
      name: req.body.name,
      vehicleNumber: req.body.vehicleNumber,
      mobile: req.body.mobile,
      address: req.body.address,
      city: req.body.city,
      email: req.body.email,
      password: hashedPassword,
      driverStatus: req.body.driverStatus || "OFFLINE",
      role: 'ambulance_driver',
      isEmailVerified: true,
    });

    return res.status(201).json({ success: true, message: "Ambulance driver created successfully", ambulance });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ success: false, message: "A user with this email or vehicle number already exists" });
    }

    return res.status(500).json({ success: false, message: "Error creating ambulance driver", error: error.message });
  }
};

export const updateAmbulance = async (req, res) => {
  try {
    const validationError = validateAmbulancePayload(req.body, true);
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const updatePayload = {};
    for (const field of ["name", "vehicleNumber", "mobile", "address", "city", "email", "password", "driverStatus"]) {
      if (typeof req.body[field] !== "undefined") {
        if (field === "password" && req.body[field]) {
          updatePayload.password = await bcrypt.hash(req.body.password, 10);
          continue;
        }
        updatePayload[field] = req.body[field];
      }
    }

    const ambulance = await Ambulance.findOneAndUpdate(
      { _id: req.params.id, role: 'ambulance_driver' },
      updatePayload,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!ambulance) {
      return res.status(404).json({ success: false, message: "Ambulance driver not found" });
    }

    return res.status(200).json({ success: true, message: "Ambulance driver updated successfully", ambulance });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ success: false, message: "A user with this email or vehicle number already exists" });
    }

    return res.status(500).json({ success: false, message: "Error updating ambulance driver", error: error.message });
  }
};

export const deleteAmbulance = async (req, res) => {
  try {
    const ambulance = await Ambulance.findByIdAndDelete(
      req.params.id
    );

    if (!ambulance) {
      return res.status(404).json({ success: false, message: "Ambulance driver not found" });
    }

    return res.status(200).json({ success: true, message: "Ambulance driver deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error deleting ambulance driver", error: error.message });
  }
};

export const acceptEmergencyRequest = async (req, res) => {
  try {
    const { requestId } = req.body;

    // 1️⃣ Lock emergency request atomically
    const request = await EmergencyRequest.findOneAndUpdate(
      { _id: requestId, status: "PENDING" },
      {
        status: "AMBULANCE_ACCEPTED",
        ambulance: req.user._id,
      },
      { new: true }
    );

    if (!request) {
      return res.status(400).json({
        message: "Request already accepted",
      });
    }

    // 2️⃣ Lock ambulance atomically
    const ambulance = await Ambulance.findOneAndUpdate(
      { _id: req.user._id, role: 'ambulance_driver', isOnTrip: false },
      { isOnTrip: true },
      { new: true }
    );

    if (!ambulance) {
      return res.status(400).json({
        message: "Already on trip",
      });
    }

    // 3️⃣ Emit real-time updates
    const io = getIO();

    io.to("ambulance").emit("remove_emergency", requestId);
    io.to(request.user.toString()).emit("ambulance_assigned", request);

    res.status(200).json(request);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const updateDriverStatus = async (req, res) => {

  try {
    console.log("========== UPDATE DRIVER STATUS ==========");
    console.log(req.user);
    console.log("Role:", req.user?.role);
    console.log("ID:", req.user?._id);
    if (req.user.role !== "ambulance_driver") {

      return res.status(403).json({
        success: false,
        message: "Ambulance driver access required",
      });

    }

    const { driverStatus } = req.body;

    const ambulance = await Ambulance.findByIdAndUpdate(

      req.user._id,

      {
        driverStatus,
      },

      {
        new: true,
      }

    ).select("-password");

    return res.status(200).json({

      success: true,

      ambulance,

    });

  } catch (error) {

    return res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};
export const updateDriverLocation = async (req, res) => {

  try {
    console.log("========== UPDATE DRIVER LOCATION ==========");
    console.log(req.user);
    console.log(req.body);

    if (req.user.role !== "ambulance_driver") {

      return res.status(403).json({

        success: false,

        message: "Ambulance driver access required",

      });

    }

    const {

      latitude,

      longitude,

    } = req.body;

    const ambulance = await Ambulance.findById(req.user._id);

    ambulance.currentLocation = {

      latitude,

      longitude,

      updatedAt: new Date(),

    };

    await ambulance.save();

    const io = getIO();

    io.emit("ambulance_location_updated", {

      ambulanceId: ambulance._id,

      latitude,

      longitude,

    });

    return res.status(200).json({

      success: true,

      currentLocation: ambulance.currentLocation,

    });

  } catch (error) {

    return res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};
export const getCurrentEmergency = async (req, res) => {

  try {

    const emergency =
      await EmergencyRequest.findOne({

        ambulance: req.user._id,

        status: {

          $in: [

            "AMBULANCE_ACCEPTED",

            "ARRIVED",

            "IN_PROGRESS",

          ],

        },

      })

        .populate("hospital")

        .populate("user");

    return res.status(200).json({

      success: true,

      emergency,

    });

  } catch (error) {

    return res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};
export const getDriverHistory = async (req, res) => {

  try {

    const history = await EmergencyRequest.find({

      ambulance: req.user._id,

      status: {

        $in: [

          "AMBULANCE_ACCEPTED",

          "ARRIVED",

          "IN_PROGRESS",

          "COMPLETED",

        ],

      },

    })

      .populate("user", "name mobile email")

      .populate("hospital", "hospitalName")

      .sort({

        updatedAt: -1,

      });

    res.json({

      success: true,

      data: history,

    });

  } catch (err) {

    res.status(500).json({

      success: false,

      message: err.message,

    });

  }

};
export const updateMyProfile = async (req, res) => {

  try {

    if (req.user.role !== "ambulance_driver") {

      return res.status(403).json({

        success: false,

        message: "Ambulance driver access required",

      });

    }

    const ambulance =
      await Ambulance.findById(req.user._id);

    if (!ambulance) {

      return res.status(404).json({

        success: false,

        message: "Driver not found",

      });

    }

    ambulance.name =
      req.body.name ?? ambulance.name;

    ambulance.mobile =
      req.body.mobile ?? ambulance.mobile;

    ambulance.city =
      req.body.city ?? ambulance.city;

    ambulance.address =
      req.body.address ?? ambulance.address;

    ambulance.vehicleNumber =
      req.body.vehicleNumber ??
      ambulance.vehicleNumber;

    await ambulance.save();

    res.json({

      success: true,

      driver: ambulance,

    });

  } catch (err) {

    res.status(500).json({

      success: false,

      message: err.message,

    });

  }

};
export const getPendingEmergencies = async (req, res) => {

  try {

    const driverId = req.user._id;

    const thirtyMinutesAgo = new Date(
      Date.now() - 30 * 60 * 1000
    );

    const emergencies = await EmergencyRequest.find({

      status: "PENDING",

      ambulance: null,

      duplicateDetected: { $ne: true },

      declinedBy: { $ne: driverId },

      createdAt: { $gte: thirtyMinutesAgo },

    })

      .populate("user", "name mobile")

      .sort({ createdAt: -1 });

    res.json({

      success: true,

      data: emergencies,

    });

  } catch (err) {

    res.status(500).json({

      success: false,

      message: err.message,

    });

  }

};