const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    const options = {
      serverSelectionTimeoutMS: 3000,
    };

    // If MONGO_URI is set explicitly and is not localhost (e.g. MongoDB Atlas)
    if (mongoUri && !mongoUri.includes('127.0.0.1') && !mongoUri.includes('localhost')) {
      try {
        console.log(`[DevSync DB] Connecting to Remote MongoDB: ${mongoUri.split('@')[1] || 'Cluster'}`);
        const conn = await mongoose.connect(mongoUri, options);
        console.log(`[DevSync DB] MongoDB Atlas Connected Successfully: ${conn.connection.host}`);
        return conn;
      } catch (remoteErr) {
        console.warn(`[DevSync DB] Remote connection failed (${remoteErr.message}). Starting MongoMemoryServer...`);
      }
    }

    // Try local mongod first
    try {
      const localUri = mongoUri || 'mongodb://127.0.0.1:27017/devsync';
      const conn = await mongoose.connect(localUri, options);
      console.log(`[DevSync DB] Local MongoDB Connected Successfully: ${conn.connection.host}`);
      return conn;
    } catch (localErr) {
      console.log(`[DevSync DB] Local MongoDB daemon not active. Starting Embedded In-Memory MongoDB Server...`);
      
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongod = await MongoMemoryServer.create();
      const memoryUri = mongod.getUri() + 'devsync';
      
      const conn = await mongoose.connect(memoryUri);
      console.log(`[DevSync DB] Embedded In-Memory MongoDB Running & Connected at: ${memoryUri}`);
      return conn;
    }
  } catch (err) {
    console.error(`[DevSync DB Fatal Error]:`, err.message);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
    }
    console.log('[DevSync DB] Database disconnected successfully');
  } catch (err) {
    console.error('[DevSync DB Error]:', err.message);
  }
};

module.exports = { connectDB, disconnectDB };
