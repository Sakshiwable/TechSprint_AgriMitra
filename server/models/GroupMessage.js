// server/models/GroupMessage.js
import mongoose from "mongoose";

const groupMessageSchema = new mongoose.Schema(
  {
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
    fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String },
    location: {
      lat: Number,
      lng: Number,
    },
    messageType: {
      type: String,
      enum: ["text", "location", "voice"],
      default: "text",
    },
    voiceUrl: {
      type: String, // URL or base64 data URL for voice message
    },
    voiceDuration: {
      type: Number, // Duration in seconds
    },
  },
  { timestamps: true }
);

export default mongoose.model("GroupMessage", groupMessageSchema);
