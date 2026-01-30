import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import User from "../models/User.js";

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

const forceAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        const mobile = "8530633712";
        const user = await User.findOne({ mobile });
        
        if (user) {
            user.role = "admin";
            await user.save();
            console.log(`✅ SUCCESS: Upgraded ${user.name} (${user.mobile}) to ADMIN.`);
        } else {
            console.log("❌ User NOT FOUND.");
        }
        
        process.exit();
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

forceAdmin();
