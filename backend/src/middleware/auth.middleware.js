import jwt from 'jsonwebtoken';

import config from '../config/env.js';
import User from '../models/User.js';

const createHttpError = (message, statusCode = 401) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const protect = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw createHttpError('Authentication token is required', 401);
    }

    const decoded = jwt.verify(token, config.jwt.accessSecret);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw createHttpError('User account no longer exists', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      next(createHttpError('Invalid or expired authentication token', 401));
      return;
    }

    next(error);
  }
};

export const requireAdmin = (req, _res, next) => {
  if (req.user?.role !== 'admin') {
    const error = new Error('Admin access required');
    error.statusCode = 403;
    next(error);
    return;
  }

  next();
};
