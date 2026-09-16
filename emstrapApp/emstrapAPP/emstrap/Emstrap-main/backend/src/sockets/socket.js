import { Server } from "socket.io";

let io;

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  "https://emstrapteams.netlify.app",
  "https://emstrap.com",
  "https://emstrap-finalworking.netlify.app",
  "https://emstrap-merge.netlify.app",
].filter(Boolean);

// To optimize DB performance, we throttle location updates to once every 5 seconds per request
const lastUpdateMap = new Map();
export const activeDriverLocations = new Map();
export const activePatientLocations = new Map();


export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin) || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
          return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
      },
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true
    },
  });

  io.on("connection", (socket) => {

    console.log("✅ New socket connected:", socket.id);
    console.log("Origin:", socket.handshake.headers.origin);
    console.log("Transport:", socket.conn.transport.name);
    // Ambulance joins a specific room to receive nearby requests
    socket.on("join_ambulance", (data) => {
      console.log("JOIN_AMBULANCE EVENT RECEIVED", socket.id);

      socket.join("ambulance");

      console.log(
        "ROOMS:",
        [...socket.rooms]
      );
    });

    socket.on("leave_ambulance", (data) => {
      socket.leave("ambulance");
      console.log(`Ambulance left: ${socket.id}`);
    });

    // Hospital joins hospital room
    socket.on("join_hospital", (data) => {
      socket.join("hospital");
      if (data.hospitalId) {
        socket.join(`hospital_${data.hospitalId}`);
        console.log(`Hospital ${data.hospitalId} joined its specific room`);
      }
      console.log(`Hospital joined: ${socket.id}`);
    });

    // Police joins police room
    socket.on("join_police", (data) => {
      socket.join("police");

      if (data?.policeId) {
        socket.join(`police_${data.policeId}`);
        console.log(
          `Police officer joined personal room: ${data.policeId}`
        );
      }

      console.log(`Police joined: ${socket.id}`);
    });

    // Ambulance sends live location
    socket.on("update_location", async (data) => {
      // 1. ALWAYS broadcast in real-time (fast, no DB load)
      if (data.requestId) {
        activeDriverLocations.set(data.requestId.toString(), {
          lat: data.lat || data.latitude,
          lng: data.lng || data.longitude
        });
        io.to(`request_${data.requestId}`).emit("ambulance_location", data);


        // 2. Throttled Persist to DB (slow, every 5 seconds)
        try {
          const now = Date.now();
          const lastUpdate = lastUpdateMap.get(`driver_${data.requestId}`) || 0;

          if (now - lastUpdate > 5000) { // 5 seconds throttle
            lastUpdateMap.set(`driver_${data.requestId}`, now);
            const EmergencyRequest =
              (await import("../models/emergencyRequest.model.js")).default;

            const Ambulance =
              (await import("../models/ambulance.model.js")).default;

            const { getBookingConnection } =
              await import("../config/bookingDb.js");

            const { getBookingDriverModel } =
              await import("../models/bookingDriver.model.js");

            // -------------------------
            // First check Emergency DB
            // -------------------------

            const request =
              await EmergencyRequest.findById(data.requestId);

            if (request && request.ambulance) {

              await Ambulance.findByIdAndUpdate(
                request.ambulance,
                {
                  currentLocation: {
                    latitude: data.lat,
                    longitude: data.lng,
                  },
                }
              );

            } else {

              // -------------------------
              // Booking DB
              // -------------------------

              const bookingConnection =
                getBookingConnection();

              const Booking =
                (await import("../models/bookingDbBooking.model.js"))
                  .getBookingDbBookingModel(bookingConnection);

              const BookingDriver =
                getBookingDriverModel(bookingConnection);

              const booking =
                await Booking.findById(data.requestId);

              if (booking && booking.ambulance) {

                await BookingDriver.findByIdAndUpdate(
                  booking.ambulance,
                  {
                    currentLocation: {
                      latitude: data.lat,
                      longitude: data.lng,
                    },
                  }
                );

              }

            }

          }
        } catch (err) {
          console.error("Failed to persist driver location:", err);
        }
      }
    });

    // User sends live location
    socket.on("update_user_location", async (data) => {
      // 1. ALWAYS broadcast in real-time
      if (data.requestId) {
        activePatientLocations.set(data.requestId.toString(), {
          lat: data.lat || data.latitude,
          lng: data.lng || data.longitude
        });
        io.to(`request_${data.requestId}`).emit("user_location", data);


        // 2. Throttled Persist to DB
        try {
          const now = Date.now();
          const lastUpdate = lastUpdateMap.get(`user_${data.requestId}`) || 0;

          if (now - lastUpdate > 5000) {
            lastUpdateMap.set(`user_${data.requestId}`, now);
            const EmergencyRequest = (await import("../models/emergencyRequest.model.js")).default;
            await EmergencyRequest.findByIdAndUpdate(data.requestId, {
              location: {
                latitude: data.latitude,
                longitude: data.longitude
              }
            });
          }
        } catch (err) {
          console.error("Failed to persist user location:", err);
        }
      }
    });

    // User joins a specific request room to track their ambulance
    socket.on("track_request", (data) => {
      console.log("📥 RECEIVED track_request event from socket:", socket.id, "payload:", data);
      if (data && data.requestId) {
        const roomName = `request_${data.requestId}`;
        socket.join(roomName);
        console.log(`✅ Socket ${socket.id} joined room ${roomName}. Current socket rooms:`, [...socket.rooms]);
        const members = io.sockets.adapter.rooms.get(roomName);
        console.log(`Members in ${roomName}:`, members ? [...members] : "EMPTY ROOM");
      } else {
        console.log("⚠️ track_request received without requestId!", data);
      }
    });

    // Firefighter joins personal disaster-warning room
    socket.on("join_firefighter", (data) => {
      if (data?.firefighterId) {
        socket.join(`firefighter_${data.firefighterId}`);
        console.log(
          `Firefighter joined personal room: ${data.firefighterId}`
        );
      }
    });

    // Rescue team joins personal disaster-warning room
    socket.on("join_rescue_team", (data) => {
      if (data?.rescueTeamId) {
        socket.join(`rescue_team_${data.rescueTeamId}`);
        console.log(
          `Rescue team joined personal room: ${data.rescueTeamId}`
        );
      }
    });

    socket.on("disconnecting", (reason) => {
      console.log("❌ Socket disconnecting:", socket.id, "reason:", reason, "rooms before disconnect:", [...socket.rooms]);
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", socket.id, "reason:", reason);
    });
    socket.on("join_private_driver", () => {
      socket.join("private_driver");
      console.log(
        `Private Driver joined: ${socket.id}`
      );
    });
    socket.on("leave_private_driver", () => {
      socket.leave("private_driver");
      console.log(
        `Private Driver left: ${socket.id}`
      );
    });
  });
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket not initialized");
  }
  return io;
};
