import Scheme from "../models/Scheme.js";

// Get all schemes (with optional search)
export const getSchemes = async (req, res) => {
  try {
    const { query } = req.query;
    let filter = {};
    if (query) {
      filter = {
        $or: [
          { title: { $regex: query, $options: "i" } },
          { category: { $regex: query, $options: "i" } },
        ],
      };
    }
    const schemes = await Scheme.find(filter).sort({ createdAt: -1 });
    res.status(200).json(schemes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching schemes", error: error.message });
  }
};

// Add a new scheme (Admin only ideally, but for now open with role check if needed)
export const addScheme = async (req, res) => {
  try {
    const { title, description, category, deadline, link } = req.body;
    const newScheme = await Scheme.create({
      title,
      description,
      category,
      deadline,
      link,
      addedBy: req.userId,
    });
    res.status(201).json(newScheme);
  } catch (error) {
    res.status(500).json({ message: "Error adding scheme", error: error.message });
  }
};

// Delete a scheme
export const deleteScheme = async (req, res) => {
  try {
    const { id } = req.params;
    await Scheme.findByIdAndDelete(id);
    res.status(200).json({ message: "Scheme deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting scheme", error: error.message });
  }
};
