import mongoose from "mongoose";

const expertProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    specialty: { type: String, required: true }, // e.g., Agronomist
    experience: { type: String, required: true }, // e.g., "5 years"
    rating: { type: Number, default: 0 },
    isOnline: { type: Boolean, default: false },
    verified: { type: Boolean, default: false }, // Admin approval
  },
  { timestamps: true }
);

export default mongoose.model("ExpertProfile", expertProfileSchema);
