process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-key";

const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

const connectTestDB = async () => {
  try {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  } catch (error) {
    if (mongoServer) {
      await mongoServer.stop();
      mongoServer = undefined;
    }
    throw error;
  }
};

const closeTestDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.dropDatabase();
    }
  } finally {
    try {
      await mongoose.connection.close();
    } finally {
      if (mongoServer) {
        await mongoServer.stop();
        mongoServer = undefined;
      }
    }
  }
};

const clearTestDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

module.exports = { connectTestDB, closeTestDB, clearTestDB };