import mongoose from "mongoose";

const consultationRequestSchema = new mongoose.Schema(
  {
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    expertId: { type: mongoose.Schema.Types.ObjectId, ref: "ExpertProfile", required: true },
    status: { 
      type: String, 
      enum: ["pending", "approved", "rejected", "completed"], 
      default: "pending" 
    },
    message: { type: String }, // Initial message from farmer
  },
  { timestamps: true }
);

// Prevent duplicate pending requests
consultationRequestSchema.index({ farmerId: 1, expertId: 1, status: 1 }, { unique: true, partialFilterExpression: { status: "pending" } });

export default mongoose.model("ConsultationRequest", consultationRequestSchema);
