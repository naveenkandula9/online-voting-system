import mongoose from 'mongoose';
import { z } from 'zod';

import Complaint from '../models/Complaint.js';
import { logActivity } from '../utils/activityLogger.js';

const complaintSchema = z.object({
  message: z.string().trim().min(10, 'Complaint must be at least 10 characters').max(1000, 'Complaint must be at most 1000 characters'),
});

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

export const createComplaint = async (req, res, next) => {
  try {
    const payload = parseRequest(complaintSchema, req.body);
    const userId = req.user._id;

    const complaint = await Complaint.create({
      user: userId,
      message: payload.message,
      status: 'open',
    });

    await logActivity({
      action: 'COMPLAINT_CREATED',
      actor: userId,
      actorRole: req.user.role,
      details: { complaintId: complaint._id, message: payload.message },
      req,
    });

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      complaint,
    });
  } catch (error) {
    next(error);
  }
};

export const getComplaints = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const complaints = await Complaint.find({ user: userId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      complaints,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find()
      .populate('user', 'name email phone state')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      complaints,
    });
  } catch (error) {
    next(error);
  }
};

export const updateComplaintStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['open', 'in-progress', 'resolved'].includes(status)) {
      throw createHttpError('Invalid status', 400);
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw createHttpError('Invalid complaint ID', 422);
    }

    const complaint = await Complaint.findByIdAndUpdate(
      id,
      { status },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!complaint) {
      throw createHttpError('Complaint not found', 404);
    }

    await logActivity({
      action: 'COMPLAINT_UPDATED',
      actor: req.user._id,
      actorRole: req.user.role,
      details: { complaintId: complaint._id, status },
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Complaint status updated successfully',
      complaint,
    });
  } catch (error) {
    next(error);
  }
};
