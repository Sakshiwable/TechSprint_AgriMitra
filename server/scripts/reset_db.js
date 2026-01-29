import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import ExpertProfile from "../models/ExpertProfile.js";
import ConsultationRequest from "../models/ConsultationRequest.js";
import DirectMessage from "../models/DirectMessage.js";
import Community from "../models/Community.js";
import CommunityMessage from "../models/CommunityMessage.js";
import connectDB from "../config/db.js";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const resetData = async () => {
  try {
    await connectDB();
    console.log("🔥 Converting database to clean slate...");

    await User.deleteMany({});
    console.log("✅ Users deleted");
    
    await ExpertProfile.deleteMany({});
    console.log("✅ Expert Profiles deleted");
    
    await ConsultationRequest.deleteMany({});
    console.log("✅ Consultation Requests deleted");
    
    await DirectMessage.deleteMany({});
    console.log("✅ Direct Messages deleted");

    await Community.deleteMany({});
    console.log("✅ Communities deleted");

    await CommunityMessage.deleteMany({});
    console.log("✅ Community Messages deleted");

    console.log("✨ Database clean complete! Please restart the app and register updated users.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error cleaning data:", error);
    process.exit(1);
  }
};

resetData();
