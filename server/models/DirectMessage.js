// server/models/DirectMessage.js
import mongoose from "mongoose";

const directMessageSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
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
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index for efficient querying
directMessageSchema.index({ fromUserId: 1, toUserId: 1, createdAt: -1 });

export default mongoose.model("DirectMessage", directMessageSchema);

