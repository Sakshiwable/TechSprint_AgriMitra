import mongoose from "mongoose";
import dotenv from "dotenv";
import Scheme from "../models/Scheme.js";

dotenv.config();

mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/techsprint", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB connected for seeding"));

const schemes = [
  {
    title: "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
    description: "Income support of Rs 6000/- per year in three equal installments to all land holding farmer families.",
    category: "Financial Assistance",
    eligibility: "All land holding farmer families having cultivable landholding in their names.",
    benefits: "Rs. 6000 per year",
    requiredDocuments: ["Aadhaar Card", "Land Ownership Documents", "Bank Account Details"],
    applicationProcess: "1. Visit pmkisan.gov.in\n2. Click on 'New Farmer Registration'\n3. Fill details and submit.",
    deadline: "Open all year",
    link: "https://pmkisan.gov.in/"
  },
  {
    title: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    description: "Crop insurance scheme to provide financial support to farmers suffering crop loss/damage arising out of unforeseen events.",
    category: "Insurance",
    eligibility: "Farmers growing notified crops in notified areas including sharecroppers and tenant farmers.",
    benefits: "Insurance cover for crop loss",
    requiredDocuments: ["Land Possession Certificate", "Aadhaar Card", "Bank Account Details", "Sowing Certificate"],
    applicationProcess: "Apply through bank branches or CSC centers or directly on the PMFBY portal.",
    deadline: "Kharif: July 31, Rabi: Dec 31",
    link: "https://pmfby.gov.in/"
  },
  {
    title: "Kisan Credit Card (KCC)",
    description: "Adequate and timely credit support from the banking system under a single window with flexible and simplified procedure.",
    category: "Loan/Credit",
    eligibility: "All farmers, tenant farmers, Oral lessees & Share Croppers etc.",
    benefits: "Credit limit based on crop pattern, collateral free loan up to 1.6 Lakhs.",
    requiredDocuments: ["ID Proof", "Address Proof", "Land Documents"],
    applicationProcess: "Visit nearest bank branch.",
    deadline: "Open all year",
    link: "https://www.myscheme.gov.in/schemes/kcc"
  }
];

const seedSchemes = async () => {
  try {
    await Scheme.deleteMany();
    await Scheme.insertMany(schemes);
    console.log("✅ Schemes seeded successfully");
    process.exit();
  } catch (error) {
    console.error("❌ Error seeding schemes", error);
    process.exit(1);
  }
};

seedSchemes();
