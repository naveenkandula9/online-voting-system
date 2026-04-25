import mongoose from 'mongoose';

const connectionStates = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

export const getHealth = (_req, res) => {
  const dbState = mongoose.connection.readyState;

  res.status(200).json({
    success: true,
    service: 'distributed-online-voting-api',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: {
      state: connectionStates[dbState] || 'unknown',
      host: mongoose.connection.host || null,
      name: mongoose.connection.name || null,
    },
  });
};
