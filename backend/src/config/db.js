import mongoose from 'mongoose';

import config from './env.js';

const connectDatabase = async () => {
  if (!config.mongodbUri) {
    throw new Error('MONGODB_URI is required to connect to MongoDB Atlas');
  }

  mongoose.set('strictQuery', true);

  const connection = await mongoose.connect(config.mongodbUri, {
    autoIndex: config.nodeEnv !== 'production',
  });

  console.log(`MongoDB connected: ${connection.connection.host}`);
  return connection;
};

mongoose.connection.on('error', (error) => {
  console.error('MongoDB connection error:', error.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected');
});

export default connectDatabase;
