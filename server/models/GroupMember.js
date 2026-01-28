// models/GroupMember.js
import mongoose from "mongoose";

const groupMemberSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "member"],
      default: "member",
    },

    lastLocation: {
      lat: { type: Number },
      lng: { type: Number },
      updatedAt: { type: Date },
    },

    eta: {
      type: Number, // minutes
      default: 0,
    },

    routeDeviation: {
      type: Boolean,
      default: false,
    },

    // 🔴 NEW — prevents repeated off-route alerts
    offRouteAlertSent: {
      type: Boolean,
      default: false,
    },

    // 🔴 NEW — prevents repeated delay alerts
    delayAlertSent: {
      type: Boolean,
      default: false,
    },

    // 🔴 NEW — throttle TomTom API calls
    lastRouteCheck: {
      type: Date,
      default: null,
    },

    isOnline: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Ensure one user per group
groupMemberSchema.index({ groupId: 1, userId: 1 }, { unique: true });

export default mongoose.model("GroupMember", groupMemberSchema);
