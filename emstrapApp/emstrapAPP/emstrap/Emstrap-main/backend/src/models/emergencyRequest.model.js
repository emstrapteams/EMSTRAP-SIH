import mongoose from "mongoose";

const emergencyRequestSchema = new mongoose.Schema(
  {
    // Citizen who reported the emergency.
    // Optional so an emergency can still be submitted anonymously.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    // Main image submitted with the emergency.
    imageUrl: {
      type: String,
      required: false,
    },

    // Emergency location captured from GPS.
    location: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
    },

    // Type of disaster/emergency reported by the citizen.
    disasterType: {
      type: String,
      enum: [
        "FLOOD",
        "LANDSLIDE",
        "EARTHQUAKE",
        "CYCLONE_STORM",
        "FIRE",
        "BUILDING_COLLAPSE",
        "ACCIDENT",
        "MEDICAL_EMERGENCY",
        "OTHER",
      ],
      required: true,
    },

    // Optional description from the citizen.
    description: {
      type: String,
      default: "",
    },

    // Future speech-to-text output.
    // Your team can populate this later.
    voiceTranscript: {
      type: String,
      default: "",
    },

    // Optional structured information from the citizen/AI.
    affectedPeople: {
      type: Number,
      default: 0,
      min: 0,
    },

    immediateDanger: {
      type: Boolean,
      default: false,
    },

    requiredResponse: {
      type: [String],
      default: [],
    },

    // Additional uploaded evidence.
    evidence: [
      {
        imageUrl: {
          type: String,
          required: true,
        },

        uploadedAt: {
          type: Date,
          default: Date.now,
        },

        // Kept as an optional interface for your AI team.
        aiAnalysis: {
          predictedClass: {
            type: String,
            default: "",
          },

          confidence: {
            type: Number,
            default: 0,
          },

          severity: {
            type: String,
            enum: [
              "LOW",
              "MODERATE",
              "HIGH",
              "CRITICAL",
            ],
            default: "LOW",
          },

          allProbabilities: {
            type: Object,
            default: {},
          },
        },
      },
    ],

    // AI duplicate-detection fields.
    // Kept so the existing infrastructure can be reused later.
    embedding: {
      type: [Number],
      default: [],
    },

    duplicateDetected: {
      type: Boolean,
      default: false,
    },

    duplicateOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmergencyRequest",
      default: null,
    },

    similarityScore: {
      type: Number,
      default: 0,
    },

    // AI analysis interface.
    // Your AI team can populate this later.
    aiAnalysis: {
      predictedClass: {
        type: String,
        default: "",
      },

      confidence: {
        type: Number,
        default: 0,
      },

      severity: {
        type: String,
        enum: [
          "LOW",
          "MODERATE",
          "HIGH",
          "CRITICAL",
        ],
        default: "LOW",
      },

      allProbabilities: {
        type: Object,
        default: {},
      },
    },

    // Disaster-response lifecycle.
    status: {
      type: String,
      enum: [
        "EMERGENCY_SENT",
        "ACKNOWLEDGED",
        "RESPONSE_INITIATED",
        "RESPONDER_ASSIGNED",
        "EN_ROUTE",
        "ARRIVED",
        "RESOLVED",
        "SEARCHING_FOR_RESPONSE",
        "NO_RESOURCE_AVAILABLE",
        "ESCALATED",
        "CANCELLED",
      ],
      default: "EMERGENCY_SENT",
    },

    // Assigned responder.
    responder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    responderRole: {
      type: String,
      enum: [
        "fire",
        "rescue",
        "police",
        "hospital",
        "disaster_control",
      ],
      default: null,
    },

    // Optional response metadata.
    acknowledgedAt: {
      type: Date,
      default: null,
    },

    responseInitiatedAt: {
      type: Date,
      default: null,
    },

    responderAssignedAt: {
      type: Date,
      default: null,
    },

    arrivedAt: {
      type: Date,
      default: null,
    },

    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const EmergencyRequest =
  mongoose.models.EmergencyRequest ||
  mongoose.model(
    "EmergencyRequest",
    emergencyRequestSchema
  );

export default EmergencyRequest;