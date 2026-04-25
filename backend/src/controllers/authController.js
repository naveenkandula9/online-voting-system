import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

import config from '../config/env.js';
import Otp from '../models/Otp.js';
import User from '../models/User.js';
import { logActivity } from '../utils/activityLogger.js';

const aadhaarSchema = z.string().regex(/^\d{12}$/, 'Aadhaar must be exactly 12 digits');
const phoneSchema = z.string().regex(/^\d{10}$/, 'Phone must be exactly 10 digits');
const stateSchema = z.enum(['Andhra Pradesh', 'Telangana'], {
  errorMap: () => ({ message: 'State must be Andhra Pradesh or Telangana' }),
});
const dobSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth is required')
  .transform((value, context) => {
    const [year, month, day] = value.split('-').map(Number);
    const dob = new Date(Date.UTC(year, month - 1, day));

    if (
      Number.isNaN(dob.getTime()) ||
      dob.getUTCFullYear() !== year ||
      dob.getUTCMonth() !== month - 1 ||
      dob.getUTCDate() !== day
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Enter a valid date of birth',
      });

      return z.NEVER;
    }

    return dob;
  });

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Enter a valid email address').toLowerCase(),
  phone: phoneSchema,
  aadhaar: aadhaarSchema,
  dob: dobSchema,
  state: stateSchema,
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firebasePhoneVerified: z.boolean().optional(),
  firebaseUid: z.string().trim().optional(),
  firebasePhoneNumber: z.string().trim().optional(),
  firebaseIdToken: z.string().trim().optional(),
});

const sendOtpSchema = z.object({
  phone: phoneSchema,
});

const verifyOtpSchema = z.object({
  phone: phoneSchema,
  otp: z.string().regex(/^\d{6}$/, 'OTP must be exactly 6 digits'),
});

const loginSchema = z.object({
  identifier: z.string().trim().min(1, 'Email or phone is required'),
  password: z.string().min(1, 'Password is required'),
});

const sendSuccess = (res, statusCode, message, data = {}) => {
  res.status(statusCode).json({
    success: true,
    message,
    ...data,
  });
};

const createHttpError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const parseRequest = (schema, body) => {
  const result = schema.safeParse(body);

  if (!result.success) {
    const message = result.error.errors.map((issue) => issue.message).join(', ');
    throw createHttpError(message, 422);
  }

  return result.data;
};

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const calculateAge = (dob) => {
  const today = new Date();

  if (!(dob instanceof Date) || Number.isNaN(dob.getTime()) || dob > today) {
    return null;
  }

  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  return age;
};

const signToken = (user) => {
  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
    },
    config.jwt.accessSecret,
    {
      expiresIn: config.jwt.accessExpiresIn,
    },
  );
};

const buildUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  aadhaar: user.aadhaar,
  dob: user.dob,
  state: user.state,
  role: user.role,
  isVerified: user.isVerified,
  hasVoted: user.hasVoted,
});

export const register = async (req, res, next) => {
  try {
    const payload = parseRequest(registerSchema, req.body);
    const age = calculateAge(payload.dob);

    if (age === null || age < 18) {
      return res.status(400).json({
        message: 'User must be at least 18 years old',
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email: payload.email }, { phone: payload.phone }, { aadhaar: payload.aadhaar }],
    });

    if (existingUser) {
      throw createHttpError('Email, phone, or Aadhaar is already registered', 409);
    }

    const verifiedOtp = await Otp.findOne({
      phone: payload.phone,
      verifiedAt: { $ne: null },
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    const passwordHash = await bcrypt.hash(payload.password, 12);

    const user = await User.create({
      ...payload,
      password: passwordHash,
      isVerified: Boolean(verifiedOtp || payload.firebasePhoneVerified),
    });

    if (verifiedOtp) {
      await Otp.deleteMany({ phone: payload.phone });
    }

    await logActivity({
      action: 'USER_REGISTERED',
      actor: user._id,
      actorRole: user.role,
      details: {
        email: user.email,
        phone: user.phone,
        state: user.state,
        dob: user.dob,
        isVerified: user.isVerified,
      },
      req,
    });

    sendSuccess(res, 201, verifiedOtp ? 'Registration completed successfully' : 'Registration created. Please verify OTP.', {
      user: buildUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

export const sendOtp = async (req, res, next) => {
  try {
    const { phone } = parseRequest(sendOtpSchema, req.body);
    const user = await User.findOne({ phone });

    if (user?.isVerified) {
      throw createHttpError('Phone number is already verified', 409);
    }

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + config.otp.ttlMinutes * 60 * 1000);

    await Otp.findOneAndUpdate(
      { phone },
      {
        phone,
        otpHash,
        expiresAt,
        verifiedAt: null,
        attempts: 0,
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    );

    console.log(`Mock SMS OTP for ${phone}: ${otp}`);

    sendSuccess(res, 200, 'OTP sent successfully');
  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (req, res, next) => {
  try {
    const { phone, otp } = parseRequest(verifyOtpSchema, req.body);

    const otpRecord = await Otp.findOne({
      phone,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      throw createHttpError('OTP is invalid or expired', 400);
    }

    if (otpRecord.attempts >= 5) {
      throw createHttpError('Too many incorrect OTP attempts. Please request a new OTP.', 429);
    }

    const isOtpValid = await bcrypt.compare(otp, otpRecord.otpHash);

    if (!isOtpValid) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      throw createHttpError('Invalid OTP', 400);
    }

    otpRecord.verifiedAt = new Date();
    await otpRecord.save();

    const user = await User.findOneAndUpdate(
      { phone },
      { isVerified: true },
      { new: true },
    );

    sendSuccess(res, 200, 'OTP verified successfully', {
      user: user ? buildUserResponse(user) : null,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { identifier, password } = parseRequest(loginSchema, req.body);
    const normalizedIdentifier = identifier.toLowerCase();

    const user = await User.findOne({
      $or: [{ email: normalizedIdentifier }, { phone: identifier }],
    }).select('+password');

    if (!user) {
      throw createHttpError('Invalid credentials', 401);
    }

    if (!user.isVerified) {
      throw createHttpError('Please verify your phone number before login', 403);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw createHttpError('Invalid credentials', 401);
    }

    const token = signToken(user);

    sendSuccess(res, 200, 'Login successful', {
      token,
      user: buildUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};
