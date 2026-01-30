import mongoose from "mongoose";

const LocationSchema = new mongoose.Schema(
  {
    lat: { type: Number },
    lng: { type: Number },
    updatedAt: { type: Date },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, default: "" }, // optional now
    mobile: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    avatar: { type: String, default: "" }, // profile picture URL
    bio: { type: String, default: "" },
    instagram: { type: String, default: "" }, // Instagram username
    
    // Farmer specific details
    state: { type: String, default: "" },
    district: { type: String, default: "" },
    cropType: { type: String, default: "" }, // e.g., Rice, Wheat
    landSize: { type: Number, default: 0 }, // in acres
    category: { type: String, default: "" }, // e.g., Small, Marginal, SC/ST

    defaultLocation: LocationSchema, // user's default location
    currentLocation: LocationSchema, // live/current location if shared
    socketId: String,
    role: { type: String, enum: ["farmer", "expert", "admin"], default: "farmer" },
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group" }],
  },
  { timestamps: true }
);

// optional: virtual for groupsCount
userSchema.virtual("groupsCount").get(function () {
  return Array.isArray(this.groups) ? this.groups.length : 0;
});

userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

export default mongoose.model("User", userSchema);
