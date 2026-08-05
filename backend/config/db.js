const mongoose = require("mongoose");
const logger = require("./logger");

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    logger.error("MONGO_URI is not defined.");
    throw new Error("MONGO_URI is not defined. Cannot start server without a database connection.");
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