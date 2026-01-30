import Scheme from "../models/Scheme.js";
import User from "../models/User.js";

// 🔄 Refresh Schemes from Gov Portals (via Python Service)
import axios from "axios";

export const refreshSchemes = async (req, res) => {
  try {
    // 1. Fetch from Python Scraper
    // Note: Ensure Python service is running on port 5000
    const response = await axios.get("http://localhost:5000/schemes/live");
    const liveSchemes = response.data;

    if (!Array.isArray(liveSchemes)) {
        return res.status(500).json({ message: "Invalid data from scraper" });
    }

    // 2. Upsert into DB
    let count = 0;
    for (const s of liveSchemes) {
      if (!s.title) continue;
      
      // Check duplicate by title + link
      const exists = await Scheme.findOne({ title: s.title });
      if (!exists) {
        await Scheme.create({
          title: s.title,
          description: s.description || "Fetched from government portal",
          category: s.category || "General",
          link: s.link || "",
          deadline: s.deadline || "Check Portal",
          eligibility: "Check official website",
          benefits: "See details on portal"
        });
        count++;
      }
    }

    res.json({ message: `Scraped and added ${count} new schemes.`, totalScraped: liveSchemes.length });

  } catch (error) {
    console.error("Scrape error:", error.message);
    res.status(500).json({ message: "Error scraping schemes. Ensure Python service is running.", error: error.message });
  }
};

// 📜 Get All Schemes (Public: Verified Only)
export const getAllSchemes = async (req, res) => {
  try {
    const { category, state, crop, search } = req.query;
    
    // Default: Only Verified Schemes for public
    let query = { verified: true };

    if (category) query.category = category;
    
    // State Filter (Regex for flexibility)
    if (state) query.state = { $regex: state, $options: "i" };

    const schemes = await Scheme.find(query).sort({ createdAt: -1 });
    res.json(schemes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching schemes", error: error.message });
  }
};

// 👮 Get Pending/All Schemes (Admin)
export const getAdminSchemes = async (req, res) => {
    try {
        const { status } = req.query; // 'pending', 'verified', 'all'
        let query = {};
        if (status === 'pending') query.verified = false;
        if (status === 'verified') query.verified = true;
        
        const schemes = await Scheme.find(query).sort({ createdAt: -1 });
        res.json(schemes);
    } catch (error) {
        res.status(500).json({ message: "Error fetching admin schemes", error: error.message });
    }
}

// ✅ Verify/Approve Scheme
export const verifyScheme = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body; // Allow updating details while approving
        updates.verified = true;
        
        const scheme = await Scheme.findByIdAndUpdate(id, updates, { new: true });
        res.json(scheme);
    } catch (error) {
        res.status(500).json({ message: "Validation failed", error: error.message });
    }
}

// 🎯 Smart Recommendations
export const recommendSchemes = async (req, res) => {
  try {
    const userId = req.userId; // Provided by auth middleware
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🧠 Logic: Filter schemes based on user profile
    // This is a simple keyword match for now. In real world, use a rule engine or more complex queries.
    
    const allSchemes = await Scheme.find();
    
    const recommended = allSchemes.filter(scheme => {
      let score = 0;
      const textToCheck = (scheme.description + " " + scheme.eligibility + " " + scheme.title).toLowerCase();

      // Match State
      if (user.state && textToCheck.includes(user.state.toLowerCase())) score += 5;
      
      // Match Crop
      if (user.cropType && textToCheck.includes(user.cropType.toLowerCase())) score += 5;
      
      // Match Category
      if (user.category && textToCheck.includes(user.category.toLowerCase())) score += 3;

      // Generic central schemes (if they mention "all india" or no specific state??)
      // For now, just return things with score > 0 OR if it looks like a central scheme
      if (textToCheck.includes("central") || textToCheck.includes("pm")) score += 2;

      return score > 0;
    });

    // If no specific recommendations, return latest few
    if (recommended.length === 0) {
      return res.json(allSchemes.slice(0, 5));
    }

    // Sort by relevance (simplistic)
    res.json(recommended);

  } catch (error) {
    res.status(500).json({ message: "Error generating recommendations", error: error.message });
  }
};

// ➕ Add Scheme (Admin only usually)
export const createScheme = async (req, res) => {
  try {
    const scheme = await Scheme.create(req.body);
    res.status(201).json(scheme);
  } catch (error) {
    res.status(500).json({ message: "Error creating scheme", error: error.message });
  }
};

// 🔍 Get Single Scheme
export const getSchemeById = async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) return res.status(404).json({ message: "Scheme not found" });
    res.json(scheme);
  } catch (error) {
    res.status(500).json({ message: "Error fetching scheme details", error: error.message });
  }
};

// 🗑️ Delete Scheme
export const deleteScheme = async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) return res.status(404).json({ message: "Scheme not found" });

    await scheme.deleteOne();
    res.json({ message: "Scheme removed" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting scheme", error: error.message });
  }
};
