import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Group from "../models/Group.js";
import GroupMember from "../models/GroupMember.js";
import Friend from "../models/Friend.js";
import DirectMessage from "../models/DirectMessage.js";
import Community from "../models/Community.js";
import CommunityMessage from "../models/CommunityMessage.js";
import ExpertProfile from "../models/ExpertProfile.js";
import ConsultationRequest from "../models/ConsultationRequest.js";
import Scheme from "../models/Scheme.js";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

const resetDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/techsprint");
        console.log("🔥 Connected to DB. Starting cleanup...");

        // Clear User Data
        await User.deleteMany({});
        console.log("✅ Users deleted");

        await ExpertProfile.deleteMany({});
        console.log("✅ Expert Profiles deleted");

        // Clear Social Data
        await Group.deleteMany({});
        await GroupMember.deleteMany({});
        console.log("✅ Groups & Members deleted");

        await Friend.deleteMany({});
        console.log("✅ Friend connections deleted");

        // Clear Messages
        await DirectMessage.deleteMany({});
        await CommunityMessage.deleteMany({});
        console.log("✅ Messages deleted");

        // Clear Communities? (Maybe keep if they are system managed, but likely user created)
        await Community.deleteMany({});
        console.log("✅ Communities deleted");
        
        await ConsultationRequest.deleteMany({});
        console.log("✅ Consultation requests deleted");

        // Clear Schemes? User said "re enter MY data", usually schemes are admin/system. 
        // But to be clean, let's wipe and re-seed schemes to ensure no duplicates if I re-run seed.
        await Scheme.deleteMany({});
        console.log("✅ Schemes cleared (will re-seed)");

        console.log("✨ Database verified clean.");
        process.exit();
    } catch (error) {
        console.error("❌ Error resetting DB:", error);
        process.exit(1);
    }
};

resetDb();
