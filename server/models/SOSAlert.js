// server/models/SOSAlert.js
import mongoose from "mongoose";

const LocationSchema = new mongoose.Schema(
  {
    lat: { type: Number },
    lng: { type: Number },
  },
  { _id: false }
);

const sosAlertSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    location: LocationSchema, // Location when SOS was triggered
    status: {
      type: String,
      enum: ["active", "resolved", "cancelled"],
      default: "active",
    },
    resolvedAt: { type: Date },
    cancelledAt: { type: Date },
    message: { type: String, default: "" }, // Optional message
  },
  { timestamps: true }
);

export default mongoose.model("SOSAlert", sosAlertSchema);




