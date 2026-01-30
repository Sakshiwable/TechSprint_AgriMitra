import mongoose from "mongoose";
import Community from "../models/Community.js";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/techsprint";

async function debugCommunities() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    // Find the Wheat Community
    const wheatCommunity = await Community.findOne({ name: /wheat/i });
    
    if (!wheatCommunity) {
      console.log("❌ Wheat Community not found");
      await mongoose.disconnect();
      return;
    }

    console.log("📋 Wheat Community:");
    console.log("  ID:", wheatCommunity._id);
    console.log("  Name:", wheatCommunity.name);
    console.log("  Status:", wheatCommunity.status);
    console.log("  Topic:", wheatCommunity.topic);
    console.log("  Members Count:", wheatCommunity.members.length);
    console.log("  Members IDs:", wheatCommunity.members.map(m => m.toString()));

    // Find user "Aarya M"
    const aaryaUser = await User.findOne({ name: /aarya/i });
    
    if (!aaryaUser) {
      console.log("\n❌ Aarya M user not found");
      await mongoose.disconnect();
      return;
    }

    console.log("\n👤 Aarya M User:");
    console.log("  ID:", aaryaUser._id.toString());
    console.log("  Name:", aaryaUser.name);
    console.log("  Mobile:", aaryaUser.mobile);
    
    // Check if this ID is in the community members
    const isMember = wheatCommunity.members.some(m => m.toString() === aaryaUser._id.toString());
    console.log("\n✅ Is Aarya member of Wheat Community?", isMember);

    if (isMember) {
      // Test the exact query used in the controller
      console.log("\n🔍 Testing Controller Query:");
      const testResults = await Community.find({ 
        members: aaryaUser._id,
        status: "approved"
      }).select("name topic");
      
      console.log("  Communities found:", testResults.length);
      testResults.forEach(c => {
        console.log(`    - ${c.name} (${c.topic})`);
      });
    }

    await mongoose.disconnect();
    console.log("\n✅ Done");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

debugCommunities();
