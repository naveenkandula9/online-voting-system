import mongoose from 'mongoose';
import { z } from 'zod';

import Candidate from '../models/Candidate.js';
import Election from '../models/Election.js';
import User from '../models/User.js';
import Vote from '../models/Vote.js';
import { logActivity } from '../utils/activityLogger.js';
import { sendVoteEmail } from '../utils/mailer.js';

const voteSchema = z.object({
  candidateId: z.string().refine((value) => mongoose.Types.ObjectId.isValid(value), {
    message: 'Valid candidateId is required',
  }),
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

const getActiveElection = async () => {
  const now = new Date();
  const election = await Election.findOne().sort({ createdAt: -1 });

  if (!election?.isActive) {
    return null;
  }

  if (election.startTime && election.startTime > now) {
    return null;
  }

  if (election.endTime && election.endTime < now) {
    return null;
  }

  return election;
};

export const castVote = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    const { candidateId } = parseRequest(voteSchema, req.body);
    const authUser = req.user;

    if (!authUser?.isVerified) {
      throw createHttpError('Only verified users can vote', 403);
    }

    if (authUser.hasVoted) {
      throw createHttpError('You have already voted', 409);
    }

    if (!authUser.state) {
      throw createHttpError('User state is required before voting', 400);
    }

    const activeElection = await getActiveElection();

    if (!activeElection) {
      throw createHttpError('Election is not active', 403);
    }

    let savedVote;
    let selectedCandidate;

    await session.withTransaction(async () => {
      const user = await User.findOneAndUpdate(
        {
          _id: authUser._id,
          isVerified: true,
          hasVoted: false,
        },
        {
          hasVoted: true,
        },
        {
          new: true,
          session,
        },
      );

      if (!user) {
        throw createHttpError('You have already voted', 409);
      }

      selectedCandidate = await Candidate.findById(candidateId).session(session);

      if (!selectedCandidate) {
        throw createHttpError('Candidate not found', 404);
      }

      if (selectedCandidate.state.toLowerCase() !== user.state.toLowerCase()) {
        throw createHttpError('You can only vote for candidates from your state', 403);
      }

      savedVote = await Vote.create(
        [
          {
            user: user._id,
            candidate: selectedCandidate._id,
          },
        ],
        { session },
      );

      await Candidate.updateOne(
        { _id: selectedCandidate._id },
        { $inc: { voteCount: 1 } },
        { session },
      );
    });

    await logActivity({
      action: 'VOTE_CAST',
      actor: authUser._id,
      actorRole: authUser.role,
      details: { candidateId: selectedCandidate._id, state: selectedCandidate.state },
      req,
    });

    try {
      await sendVoteEmail(authUser.email);
    } catch (emailError) {
      console.error('Failed to send vote confirmation email:', emailError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Vote cast successfully',
      vote: {
        id: savedVote[0]._id,
        candidate: selectedCandidate._id,
        createdAt: savedVote[0].createdAt,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      next(createHttpError('You have already voted', 409));
      return;
    }

    next(error);
  } finally {
    await session.endSession();
  }
};
