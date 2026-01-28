// config/db.js
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // loads variables from .env file

const connectDB = async () => {
  try {
    // ensure MONGO_URI is provided
    const uri = process.env.MONGO_URI;
    if (!uri) {
      console.error(
        "❌ MONGO_URI not found. Create a .env file with MONGO_URI=<your connection string>"
      );
      process.exit(1);
    }

    // connect to MongoDB using the MONGO_URI from .env
    const conn = await mongoose.connect(uri, {
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
