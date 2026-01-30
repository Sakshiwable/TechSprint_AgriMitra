import mongoose from "mongoose";

const schemeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true }, // e.g., Financial, Insurance, Subsidy
    eligibility: { type: String, default: "" }, // e.g., "Small farmers, Logic based check later"
    benefits: { type: String, default: "" }, // e.g., "Rs 6000 per year"
    requiredDocuments: [{ type: String }], // Array of doc names
    applicationProcess: { type: String, default: "" }, // Step by step text or HTML
    deadline: { type: String, default: "Open all year" },
    link: { type: String, default: "" }, // External government link
    
    // New fields for Data Collector Architecture
    verified: { type: Boolean, default: false }, // Must be approved by Admin
    state: { type: String, default: "All India" }, // Region wise
    source: { type: String, default: "Manual" }, // e.g. "India.gov.in"
    
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Scheme", schemeSchema);
