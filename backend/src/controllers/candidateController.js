import Candidate from '../models/Candidate.js';

const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const getCandidates = async (req, res, next) => {
  try {
    const { state } = req.query;
    const filter = state ? { state: new RegExp(`^${escapeRegex(state)}$`, 'i') } : {};

    const candidates = await Candidate.find(filter)
      .select('name party state partySymbol voteCount createdAt')
      .sort({ state: 1, party: 1, name: 1 });

    res.status(200).json({
      success: true,
      candidates,
    });
  } catch (error) {
    next(error);
  }
};
