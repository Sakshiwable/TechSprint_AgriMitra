import ExpertProfile from "../models/ExpertProfile.js";
import User from "../models/User.js";
import ConsultationRequest from "../models/ConsultationRequest.js";

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
// Request Consultation (Farmer -> Expert)
export const sendConsultationRequest = async (req, res) => {
  try {
    const { expertId } = req.body;
    const farmerId = req.userId;

    const existingRequest = await ConsultationRequest.findOne({ farmerId, expertId, status: "pending" });
    if (existingRequest) {
      return res.status(400).json({ message: "Request already pending" });
    }

    const request = await ConsultationRequest.create({ farmerId, expertId });
    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: "Error sending request", error: error.message });
  }
};

// Get My Requests (Expert Only)
export const getMyRequests = async (req, res) => {
  try {
    const expertProfile = await ExpertProfile.findOne({ userId: req.userId });
    if (!expertProfile) return res.status(404).json({ message: "Expert profile not found" });

    const requests = await ConsultationRequest.find({ expertId: expertProfile._id, status: "pending" })
      .populate("farmerId", "name avatar");
    
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching requests", error: error.message });
  }
};

// Update Request Status (Expert Only)
export const updateRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body; // approved, rejected

    const request = await ConsultationRequest.findByIdAndUpdate(requestId, { status }, { new: true });
    
    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ message: "Error updating request", error: error.message });
  }
};

// Get Active Consultations (For both Farmer & Expert)
export const getMyConsultations = async (req, res) => {
  try {
    const isExpert = (await ExpertProfile.exists({ userId: req.userId }));
    
    let query = { status: "approved" };
    if (isExpert) {
        const profile = await ExpertProfile.findOne({ userId: req.userId });
        query.expertId = profile._id;
    } else {
        query.farmerId = req.userId;
    }

    const consultations = await ConsultationRequest.find(query)
      .populate("farmerId", "name avatar")
      .populate({
         path: "expertId",
         populate: { path: "userId", select: "name avatar" }
      });

    res.status(200).json(consultations);
  } catch (error) {
    res.status(500).json({ message: "Error fetching consultations", error: error.message });
  }
};
