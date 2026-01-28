// models/Group.js
import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    groupName: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // who created this group
      required: true,
    },
    destination: {
      name: String, // optional, like "Goa Beach"
      lat: Number,
      lng: Number,
    },
    meetingPoint: {
      name: String,
      lat: Number,
      lng: Number,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    status: {
      type: String,
      default: "active", // can be 'active', 'completed', etc.
    },
  },
  { timestamps: true }
);

export default mongoose.model("Group", groupSchema);
