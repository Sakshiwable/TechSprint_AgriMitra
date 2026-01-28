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
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    avatar: { type: String, default: "" }, // profile picture URL
    bio: { type: String, default: "" },
    instagram: { type: String, default: "" }, // Instagram username
    defaultLocation: LocationSchema, // user's default location
    currentLocation: LocationSchema, // live/current location if shared
    socketId: String,
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
