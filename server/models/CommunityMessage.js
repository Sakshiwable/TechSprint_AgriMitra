import mongoose from "mongoose";

const communityMessageSchema = new mongoose.Schema({
  communityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Community",
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  messageType: {
    type: String,
    enum: ["text", "image", "audio"],
    default: "text",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("CommunityMessage", communityMessageSchema);
