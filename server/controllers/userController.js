import User from "../models/User.js";
import Community from "../models/Community.js";
import ConsultationRequest from "../models/ConsultationRequest.js";

// @desc    Get User Profile with aggregated details (History, Communities, Requests)
// @route   GET /api/user/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const userId = req.userId;

    // 1. Fetch Basic User Details
    const user = await User.findById(userId).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "User not found" });

    // 2. Fetch Communities where user is a member
    const joinedCommunities = await Community.find({ 
      members: userId,
      status: "approved" // Only show approved communities
    })
      .select("name description topic image createdAt")
      .sort("-createdAt");

    // Format communities list
    const communities = joinedCommunities.map((comm) => ({
      id: comm._id,
      name: comm.name,
      topic: comm.topic,
      description: comm.description,
      joinedAt: comm.createdAt,
    }));

    // 3. Fetch Consultation Requests
    // If farmer: show outgoing requests
    // If expert: show incoming requests
    let consultationQuery = { farmerId: userId };
    if (user.role === "expert") {
      consultationQuery = { expertId: userId }; // Or should we show both? for now role based.
    }

    const consultations = await ConsultationRequest.find(consultationQuery)
      .populate("expertId", "specialization experience") // populate if model allows, wait ExpertProfile is different
      .populate("farmerId", "name mobile")
      .sort("-createdAt");

    // 4. Construct Response
    res.json({
      user,
      stats: {
        communitiesJoined: communities.length,
        pendingRequests: consultations.filter((c) => c.status === "pending").length,
      },
      communities,
      consultations,
      history: [
        // Mock history for now, or real if we track it
        { action: "Account Created", date: user.createdAt },
        { action: "Last Profile Update", date: user.updatedAt },
      ],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};
