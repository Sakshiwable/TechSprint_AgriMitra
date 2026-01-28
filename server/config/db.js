// config/db.js
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // loads variables from .env file

const connectDB = async () => {
  try {
    // connect to MongoDB using the MONGO_URI in .env
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    process.exit(1); // stop the app if connection fails
  }
};

export default connectDB;
