import ExpertProfile from "../models/ExpertProfile.js";
import User from "../models/User.js";

// Get all verified experts
export const getExperts = async (req, res) => {
  try {
    const experts = await ExpertProfile.find({ verified: true }).populate("userId", "name avatar mobile");
    res.status(200).json(experts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching experts", error: error.message });
  }
};

// Request to be an expert updates profile
export const requestExpertStatus = async (req, res) => {
  try {
    const { specialty, experience } = req.body;
    
    // Check if profile exists
    let profile = await ExpertProfile.findOne({ userId: req.userId });
    if (profile) {
      return res.status(400).json({ message: "Expert profile already exists." });
    }

    profile = await ExpertProfile.create({
      userId: req.userId,
      specialty,
      experience,
      verified: false, // Pending admin approval
    });

    res.status(201).json({ message: "Expert request submitted", profile });
  } catch (error) {
    res.status(500).json({ message: "Error requesting expert status", error: error.message });
  }
};

// Admin: Approve expert
export const approveExpert = async (req, res) => {
  try {
    const { id } = req.params; // ExpertProfile ID
    const profile = await ExpertProfile.findByIdAndUpdate(id, { verified: true }, { new: true });
    
    // Update User Role to expert
    await User.findByIdAndUpdate(profile.userId, { role: "expert" });

    res.status(200).json({ message: "Expert approved", profile });
  } catch (error) {
    res.status(500).json({ message: "Error approving expert", error: error.message });
  }
};

// Admin: Get pending experts
export const getPendingExperts = async (req, res) => {
  try {
    const experts = await ExpertProfile.find({ verified: false }).populate("userId", "name email mobile");
    res.status(200).json(experts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching pending experts", error: error.message });
  }
};
