import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import User from "../models/User.js";

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/techsprint");
        
        const mobile = "8530633712";
        const user = await User.findOne({ mobile });
        
        if (user) {
            console.log(`✅ User FOUND: ${user.name}`);
            console.log(`📱 Mobile: ${user.mobile}`);
            console.log(`🎭 Role: ${user.role}`);
            console.log(`📧 Email: ${user.email}`);
        } else {
            console.log("❌ User NOT FOUND.");
        }
        
        process.exit();
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

checkUser();
