import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";

dotenv.config();

if (process.env.NODE_ENV === "development") {
  // Set DNS servers to Google's Public DNS to resolve SRV records
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
}

const connectDB = async (): Promise<void> => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI not found");
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Successfully Connected DB");
  } catch (error) {
    console.error("Failed to Connect", error);
    process.exit(1);
  }
};

export default connectDB;
