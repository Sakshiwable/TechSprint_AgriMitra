import Community from "../models/Community.js";
import CommunityMessage from "../models/CommunityMessage.js";
import User from "../models/User.js";
import { getIO } from "../sockets/index.js";

// Create a new Community Request
export const requestCommunity = async (req, res) => {
  try {
    const { name, topic, description, image } = req.body;

    const newCommunity = await Community.create({
      name,
      topic,
      description,
      image,
      createdBy: req.userId,
      status: "pending", // Default status
      members: [req.userId], // Creator is the first member
    });

    res.status(201).json({ message: "Community requested successfully. Pending approval.", community: newCommunity });
  } catch (error) {
    res.status(500).json({ message: "Error creating community", error: error.message });
  }
};

// Get All Approved Communities
export const getCommunities = async (req, res) => {
  try {
    const communities = await Community.find({ status: "approved" })
      .populate("members", "name avatar") // Show some member info
      .sort({ createdAt: -1 });
    res.status(200).json(communities);
  } catch (error) {
    res.status(500).json({ message: "Error fetching communities", error: error.message });
  }
};

// Join Community
export const joinCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;
    const community = await Community.findById(communityId);

    if (!community) return res.status(404).json({ message: "Community not found" });

    if (community.members.includes(req.userId)) {
      return res.status(400).json({ message: "Already a member" });
    }

    community.members.push(req.userId);
    await community.save();

    res.status(200).json({ message: "Joined community successfully", community });
  } catch (error) {
    res.status(500).json({ message: "Error joining community", error: error.message });
  }
};

// Get Community Details
export const getCommunityDetails = async (req, res) => {
  try {
    const { communityId } = req.params;
    const community = await Community.findById(communityId).populate("members", "name avatar");
    if (!community) return res.status(404).json({ message: "Community not found" });

    res.status(200).json(community);
  } catch (error) {
    res.status(500).json({ message: "Error fetching community details", error: error.message });
  }
};

// 💬 Get Messages for a Community
export const getCommunityMessages = async (req, res) => {
  try {
    const { communityId } = req.params;
    const messages = await CommunityMessage.find({ communityId })
      .populate("sender", "name avatar")
      .sort({ createdAt: 1 }); // Oldest first
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages", error: error.message });
  }
};

// 📩 Send a Message to a Community
export const sendCommunityMessage = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { content, messageType } = req.body;

    if (!content) return res.status(400).json({ message: "Message content required" });

    const newMessage = await CommunityMessage.create({
      communityId,
      sender: req.userId,
      content,
      messageType: messageType || "text",
    });

    // Populate sender details for immediate frontend display
    await newMessage.populate("sender", "name avatar");

    // Real-time emission
    const io = getIO();
    if (io) {
      io.to(communityId).emit("newCommunityMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: "Error sending message", error: error.message });
  }
};


// ADMIN: Get Pending Communities
export const getPendingCommunities = async (req, res) => {
  try {
    const communities = await Community.find({ status: "pending" }).populate("createdBy", "name mobile");
    res.status(200).json(communities);
  } catch (error) {
    res.status(500).json({ message: "Error fetching pending communities", error: error.message });
  }
};

// ADMIN: Approve Community
export const approveCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const community = await Community.findByIdAndUpdate(id, { status: "approved" }, { new: true });
    res.status(200).json({ message: "Community approved", community });
  } catch (error) {
    res.status(500).json({ message: "Error approving community", error: error.message });
  }
};
