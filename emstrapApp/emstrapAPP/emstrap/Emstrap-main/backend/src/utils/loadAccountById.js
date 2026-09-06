import User from "../models/user.model.js";
import Admin from "../models/admin.model.js";
import Hospital from "../models/hospital.model.js";
import Police from "../models/police.model.js";
import Ambulance from "../models/ambulance.model.js";
import { getBookingConnection } from "../config/bookingDb.js";
import { getBookingDriverModel } from "../models/bookingDriver.model.js";

export const loadAccountById = async (id, role) => {
  switch (role) {
    case "admin": {
      const admin = await Admin.findById(id);
      return admin || User.findById(id);
    }
    case "hospital":
    case "hospital_admin":
      return Hospital.findById(id);
    case "police":
    case "police_hq":
      return Police.findById(id);
    case "ambulance_driver":
    case "ambulance":
      return Ambulance.findById(id);
    case "private_driver":
      return getBookingDriverModel(getBookingConnection()).findById(id);
    default:
      return User.findById(id);
  }
};

export const loadAccountByIdForPassword = async (user) => {
  const id = user?._id || user?.id;
  const role = user?.role;

  console.log("CHANGE PASSWORD ACCOUNT:", {
    id,
    role,
  });

  if (!id) {
    return null;
  }

  if (
    role === "ambulance_driver" ||
    role === "ambulance"
  ) {
    return Ambulance
      .findById(id)
      .select("+password");
  }

  if (role === "private_driver") {
    return getBookingDriverModel(
      getBookingConnection()
    )
      .findById(id)
      .select("+password");
  }

  if (
    role === "hospital" ||
    role === "hospital_admin"
  ) {
    return Hospital
      .findById(id)
      .select("+password");
  }

  if (
    role === "police" ||
    role === "police_hq"
  ) {
    const police = await Police
      .findById(id)
      .select("+password");

    if (police) {
      return police;
    }

    // Some existing police accounts are stored
    // in the users collection with role "police".
    return User
      .findById(id)
      .select("+password");
  }

  if (role === "admin") {
    const admin = await Admin
      .findById(id)
      .select("+password");

    if (admin) {
      return admin;
    }

    return User
      .findById(id)
      .select("+password");
  }

  return User
    .findById(id)
    .select("+password");
};

export default loadAccountById;
