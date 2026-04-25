import mongoose from 'mongoose';
import { z } from 'zod';

import ActivityLog from '../models/ActivityLog.js';
import Candidate from '../models/Candidate.js';
import Election from '../models/Election.js';
import User from '../models/User.js';
import { logActivity } from '../utils/activityLogger.js';

const candidateSchema = z.object({
  name: z.string().trim().min(2, 'Candidate name must be at least 2 characters'),
  party: z.string().trim().min(2, 'Party must be at least 2 characters'),
  state: z.string().trim().min(2, 'State must be at least 2 characters'),
  partySymbol: z.string().trim().min(1, 'Party symbol image path is required').optional(),
});

const partySymbolMap = {
  AIMIM: '/images/jsp-party.jpg',
  BJP: '/images/bjp.jpg',
  BRS: '/images/brs.jpg',
  INC: '/images/inc.jpg',
  TDP: '/images/tdp.jpg',
  YSRCP: '/images/YSRCPLOGO.jpg',
};

const addPartySymbolFallback = (candidate) => ({
  ...candidate,
  partySymbol: candidate.partySymbol || partySymbolMap[candidate.party.toUpperCase()] || '/images/default-party.png',
});

const electionSchema = z.object({
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
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

const validateObjectId = (id, label) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createHttpError(`Invalid ${label}`, 422);
  }
};

const getElectionDocument = async () => {
  const election = await Election.findOne().sort({ createdAt: -1 });

  if (election) {
    return election;
  }

  return Election.create({
    isActive: false,
    startTime: null,
    endTime: null,
  });
};

export const createCandidate = async (req, res, next) => {
  try {
    const payload = addPartySymbolFallback(parseRequest(candidateSchema, req.body));
    const candidate = await Candidate.create(payload);

    await logActivity({
      action: 'CANDIDATE_CREATED',
      actor: req.user._id,
      actorRole: req.user.role,
      details: { candidateId: candidate._id, name: candidate.name, party: candidate.party, state: candidate.state },
      req,
    });

    res.status(201).json({
      success: true,
      message: 'Candidate added successfully',
      candidate,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCandidate = async (req, res, next) => {
  try {
    validateObjectId(req.params.id, 'candidate id');
    const payload = addPartySymbolFallback(parseRequest(candidateSchema, req.body));

    const candidate = await Candidate.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    if (!candidate) {
      throw createHttpError('Candidate not found', 404);
    }

    await logActivity({
      action: 'CANDIDATE_UPDATED',
      actor: req.user._id,
      actorRole: req.user.role,
      details: { candidateId: candidate._id, name: candidate.name, party: candidate.party, state: candidate.state },
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Candidate updated successfully',
      candidate,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCandidate = async (req, res, next) => {
  try {
    validateObjectId(req.params.id, 'candidate id');
    const candidate = await Candidate.findByIdAndDelete(req.params.id);

    if (!candidate) {
      throw createHttpError('Candidate not found', 404);
    }

    await logActivity({
      action: 'CANDIDATE_DELETED',
      actor: req.user._id,
      actorRole: req.user.role,
      details: { candidateId: candidate._id, name: candidate.name, party: candidate.party, state: candidate.state },
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Candidate deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (_req, res, next) => {
  try {
    const users = await User.find()
      .select('name email phone aadhaar state role isVerified hasVoted createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    next(error);
  }
};

export const getActivityLogs = async (_req, res, next) => {
  try {
    const logs = await ActivityLog.find()
      .populate('actor', 'name email role')
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      logs,
    });
  } catch (error) {
    next(error);
  }
};

export const getElectionStatus = async (_req, res, next) => {
  try {
    const election = await getElectionDocument();

    res.status(200).json({
      success: true,
      election,
    });
  } catch (error) {
    next(error);
  }
};

export const startElection = async (req, res, next) => {
  try {
    const payload = parseRequest(electionSchema, req.body || {});
    const election = await getElectionDocument();

    election.isActive = true;
    election.startTime = payload.startTime ? new Date(payload.startTime) : new Date();
    election.endTime = payload.endTime ? new Date(payload.endTime) : null;
    await election.save();

    await logActivity({
      action: 'ELECTION_STARTED',
      actor: req.user._id,
      actorRole: req.user.role,
      details: { electionId: election._id, startTime: election.startTime, endTime: election.endTime },
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Election started successfully',
      election,
    });
  } catch (error) {
    next(error);
  }
};

export const stopElection = async (req, res, next) => {
  try {
    const election = await getElectionDocument();

    election.isActive = false;
    election.endTime = new Date();
    await election.save();

    await logActivity({
      action: 'ELECTION_STOPPED',
      actor: req.user._id,
      actorRole: req.user.role,
      details: { electionId: election._id, endTime: election.endTime },
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Election stopped successfully',
      election,
    });
  } catch (error) {
    next(error);
  }
};
