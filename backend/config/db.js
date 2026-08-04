const mongoose = require("mongoose");
const logger = require("./logger");

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    logger.warn("MONGO_URI is not defined. Skipping database connection.");
    return null;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    logger.info(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error({ err: error }, "Error connecting to MongoDB");
    throw error;
  }
};

module.exports = connectDB;