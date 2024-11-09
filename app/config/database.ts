import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

mongoose.Promise = global.Promise;

const connectToDatabase = async (): Promise<void> => {
  try {
    const connection = await mongoose.connect(
      `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}`
    );
    console.info(`MongoDB connected to ${connection.connection.host}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export default connectToDatabase;
