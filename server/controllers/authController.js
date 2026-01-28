import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Group from "../models/Group.js";
import GroupMember from "../models/GroupMember.js";
import Friend from "../models/Friend.js";
import { generateToken } from "../utils/jwt.js";

// 🧾 REGISTER (Signup)
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 🔍 Basic validation
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "All fields (name, email, password) are required." });
    }

    // 🧠 Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists. Please login." });
    }

    // 🔒 Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🆕 Create new user
    const newUser = await User.create({
      name,
      email,
      passwordHash: hashedPassword,
    });

    // 🔑 Generate JWT token
    const token = generateToken(newUser._id);

    console.log(`✅ New user registered: ${newUser.email}`);

    res.status(201).json({
      message: "Signup successful!",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("❌ Error in registerUser:", error.message);
    res
      .status(500)
      .json({ message: "Error registering user", error: error.message });
  }
};

// 🔑 LOGIN (existing user)
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🧠 Check required fields
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    // 🔍 Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found. Please signup first." });
    }

    // 🔑 Compare passwords
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      console.warn(`⚠️ Invalid password for user: ${email}`);
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // 🎟️ Generate token
    const token = generateToken(user._id);

    console.log(`✅ User logged in: ${email}`);

    res.status(200).json({
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("❌ Error in loginUser:", error.message);
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

// 👤 GET PROFILE (for logged-in users)
export const getProfile = async (req, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });

    const user = await User.findById(req.userId)
      .select("-passwordHash -__v");

    if (!user) return res.status(404).json({ error: "User not found" });

    // Fetch groups the same way as getUserGroups
    // Groups user created
    const createdGroups = await Group.find({ createdBy: req.userId })
      .select("groupName destination meetingPoint status createdAt");

    // Groups user is a member of
    const memberGroupsData = await GroupMember.find({ userId: req.userId })
      .populate("groupId", "groupName destination meetingPoint status createdAt");

    const memberGroups = memberGroupsData
      .map((m) => m.groupId)
      .filter(Boolean); // remove nulls

    // Merge + remove duplicates
    const allGroups = [...createdGroups, ...memberGroups].filter(
      (group, index, self) =>
        index === self.findIndex((g) => g._id.toString() === group._id.toString())
    );

    // Get friends count (accepted friends where user is either userId or friendId)
    const friendsCount = await Friend.countDocuments({
      $or: [
        { userId: req.userId, status: "accepted" },
        { friendId: req.userId, status: "accepted" }
      ]
    });

    const obj = user.toObject();
    obj.avatar = obj.avatar || obj.profilePic || "";
    obj.groups = allGroups;
    obj.groupsCount = allGroups.length;
    obj.friendsCount = friendsCount;
    
    // Ensure all fields are included
    return res.json({ 
      user: {
        ...obj,
        name: obj.name || "",
        email: obj.email || "",
        bio: obj.bio || "",
        instagram: obj.instagram || "",
        avatar: obj.avatar || "",
        defaultLocation: obj.defaultLocation || null,
        currentLocation: obj.currentLocation || null,
        groups: obj.groups || [],
        groupsCount: obj.groupsCount || 0,
        friendsCount: obj.friendsCount || 0,
        createdAt: obj.createdAt,
        updatedAt: obj.updatedAt,
      }
    });
  } catch (err) {
    console.error("getProfile error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const updates = {};
    const { name, email, avatar, bio, instagram, defaultLocation } = req.body;

    if (name) updates.name = name;
    if (email) updates.email = email;
    if (avatar !== undefined) updates.avatar = avatar;
    if (bio !== undefined) updates.bio = bio;
    if (instagram !== undefined) updates.instagram = instagram;
    if (defaultLocation && typeof defaultLocation === "object") {
      updates.defaultLocation = {
        lat: defaultLocation.lat,
        lng: defaultLocation.lng,
        updatedAt: new Date(),
      };
    }

    const user = await User.findByIdAndUpdate(req.userId, updates, {
      new: true,
    }).select("-passwordHash -__v");

    if (!user) return res.status(404).json({ error: "User not found" });

    const obj = user.toObject();
    obj.groupsCount = obj.groups?.length ?? obj.groupsCount ?? 0;
    return res.json({ user: obj });
  } catch (err) {
    console.error("updateProfile error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
