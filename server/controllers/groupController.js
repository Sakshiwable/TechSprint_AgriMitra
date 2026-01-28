// controllers/groupController.js
import Group from "../models/Group.js";
import GroupMember from "../models/GroupMember.js";
import FriendRequest from "../models/FriendRequest.js";
import User from "../models/User.js";
import { sendInviteEmail } from "../utils/mailer.js"; 

// 🧾 Create a new group
export const createGroup = async (req, res) => {
  try {
    const { groupName, destination } = req.body;

    // create new group
    const group = await Group.create({
      groupName,
      destination,
      createdBy: req.userId,
      members: [req.userId],
    });

    // make creator an admin in GroupMember
    await GroupMember.create({
      groupId: group._id,
      userId: req.userId,
      role: "admin",
      isOnline: false,
    });

    res.status(201).json({ message: "Group created successfully!", group });
  } catch (error) {
    res.status(500).json({ message: "Error creating group", error: error.message });
  }
};

// 💌 Send invite to friend (using groupName instead of groupId)
export const inviteFriend = async (req, res) => {
  try {
    const { groupName, email } = req.body;

    // 1️⃣ Find the group
    const group = await Group.findOne({ groupName });
    if (!group) return res.status(404).json({ message: "Group not found." });

    // 2️⃣ Find the user
    const friend = await User.findOne({ email });
    if (!friend) return res.status(404).json({ message: "User not found." });

    // 3️⃣ Check if invite already exists
    const existingInvite = await FriendRequest.findOne({
      fromUserId: req.userId,
      toUserId: friend._id,
      groupId: group._id,
    });
    if (existingInvite)
      return res.status(400).json({ message: "Invite already sent." });

    // 4️⃣ Create invite
    await FriendRequest.create({
      fromUserId: req.userId,
      toUserId: friend._id,
      groupId: group._id,
      status: "pending",
    });

    // 5️⃣ Send email notification
    await sendInviteEmail(friend.email, groupName, req.user?.name || "Your friend");

    res.status(201).json({
      message: `Invitation sent for group '${groupName}' and email delivered to ${friend.email}!`,
    });
  } catch (error) {
    console.error("❌ Error sending invite:", error.message);
    res.status(500).json({ message: "Error sending invite", error: error.message });
  }
};


// ✅ Accept group invite
export const acceptInvite = async (req, res) => {
  try {
    const { inviteId, groupId } = req.body;

    // Mark invite as accepted
    await FriendRequest.findByIdAndUpdate(inviteId, { status: "accepted" });

    // Add the user to the group
    await GroupMember.create({
      groupId,
      userId: req.userId,
      role: "member",
    });

    res.status(200).json({ message: "Invite accepted and joined group!" });
  } catch (error) {
    console.error("❌ Error accepting invite:", error.message);
    res.status(500).json({ message: "Error accepting invite" });
  }
};


// 👥 Get all members of a group
export const getGroupMembers = async (req, res) => {
  try {
    const { groupId } = req.params;

    const members = await GroupMember.find({ groupId })
      .populate("userId", "name email") // ✅ important
      .sort({ role: 1 }); // admins first

    if (!members) {
      return res.status(404).json({ message: "No members found" });
    }

    res.status(200).json({ members });
  } catch (error) {
    console.error("Error fetching group members:", error.message);
    res.status(500).json({ message: "Failed to load group members" });
  }
};

// 📋 Get group by ID
export const getGroupById = async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await Group.findById(groupId);
    
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user is member
    const member = await GroupMember.findOne({
      groupId,
      userId: req.userId,
    });

    if (!member) {
      return res.status(403).json({ message: "You are not a member of this group" });
    }

    res.status(200).json({ group, isAdmin: member.role === "admin" });
  } catch (error) {
    console.error("❌ Error fetching group:", error.message);
    res.status(500).json({ message: "Error fetching group", error: error.message });
  }
};

// 🎯 Update group destination (admin only)
export const updateGroupDestination = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { destination } = req.body;

    // Check if user is admin of the group
    const member = await GroupMember.findOne({
      groupId,
      userId: req.userId,
    });

    if (!member || member.role !== "admin") {
      return res.status(403).json({ message: "Only admins can update destination" });
    }

    const group = await Group.findByIdAndUpdate(
      groupId,
      { destination },
      { new: true }
    );

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.status(200).json({ message: "Destination updated successfully", group });
  } catch (error) {
    console.error("❌ Error updating destination:", error.message);
    res.status(500).json({ message: "Error updating destination", error: error.message });
  }
};

// ✅ Get all groups created by or joined by the user
export const getUserGroups = async (req, res) => {
  try {
    const userId = req.userId;

    // Groups user created
    const createdGroups = await Group.find({ createdBy: userId });

    // Groups user is a member of
    const memberGroupsData = await GroupMember.find({ userId })
      .populate("groupId");

    const memberGroups = memberGroupsData
      .map((m) => m.groupId)
      .filter(Boolean); // remove nulls

    // Merge + remove duplicates
    const allGroups = [...createdGroups, ...memberGroups].filter(
      (group, index, self) =>
        index === self.findIndex((g) => g._id.toString() === group._id.toString())
    );

    res.status(200).json({ groups: allGroups });
  } catch (error) {
    console.error("❌ Error fetching user groups:", error.message);
    res.status(500).json({ message: "Error fetching groups", error: error.message });
  }
};

// 👥 Get all group members from all user's groups (for friends page)
export const getAllGroupMembers = async (req, res) => {
  try {
    const userId = req.userId;

    // Get all groups user is part of
    const createdGroups = await Group.find({ createdBy: userId }).select("_id");
    const memberGroupsData = await GroupMember.find({ userId }).select("groupId");
    
    const allGroupIds = [
      ...createdGroups.map(g => g._id),
      ...memberGroupsData.map(m => m.groupId)
    ];

    // Remove duplicates
    const uniqueGroupIds = [...new Set(allGroupIds.map(id => id.toString()))];

    // Get all members from all these groups
    const allMembers = await GroupMember.find({
      groupId: { $in: uniqueGroupIds }
    })
      .populate("userId", "name email avatar bio instagram")
      .select("userId role isOnline groupId");

    // Create a map to store unique members (by userId)
    const membersMap = new Map();

    allMembers.forEach((member) => {
      const memberUserId = member.userId?._id?.toString() || member.userId?.id?.toString();
      
      // Skip the current user
      if (memberUserId === userId.toString()) {
        return;
      }

      if (memberUserId && member.userId) {
        if (!membersMap.has(memberUserId)) {
          membersMap.set(memberUserId, {
            _id: member.userId._id || member.userId.id,
            name: member.userId.name || "Unknown",
            email: member.userId.email || "",
            avatar: member.userId.avatar || "",
            bio: member.userId.bio || "",
            instagram: member.userId.instagram || "",
            isOnline: member.isOnline || false,
            role: member.role || "member",
            groups: []
          });
        }
        
        // Add group info to member's groups array
        const memberData = membersMap.get(memberUserId);
        if (member.groupId && !memberData.groups.some(g => g._id === member.groupId.toString())) {
          memberData.groups.push({ _id: member.groupId });
        }
      }
    });

    // Convert map to array
    const uniqueMembers = Array.from(membersMap.values());

    res.status(200).json({ friends: uniqueMembers });
  } catch (error) {
    console.error("❌ Error fetching all group members:", error.message);
    res.status(500).json({ message: "Error fetching group members", error: error.message });
  }
};