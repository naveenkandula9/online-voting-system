import Candidate from '../models/Candidate.js';
import Vote from '../models/Vote.js';

export const getResults = async (_req, res, next) => {
  try {
    const candidates = await Candidate.find()
      .select('name party state partySymbol voteCount')
      .sort({ voteCount: -1, state: 1, name: 1 });

    const stateWiseResults = await Candidate.aggregate([
      {
        $group: {
          _id: '$state',
          totalVotes: { $sum: '$voteCount' },
          candidates: {
            $push: {
              id: '$_id',
              name: '$name',
              party: '$party',
              partySymbol: '$partySymbol',
              voteCount: '$voteCount',
            },
          },
        },
      },
      { $sort: { totalVotes: -1, _id: 1 } },
    ]);

    const totalVotes = await Vote.countDocuments();

    res.status(200).json({
      success: true,
      totalVotes,
      candidates,
      stateWiseResults: stateWiseResults.map((stateResult) => ({
        state: stateResult._id,
        totalVotes: stateResult.totalVotes,
        candidates: stateResult.candidates.sort((a, b) => b.voteCount - a.voteCount),
      })),
    });
  } catch (error) {
    next(error);
  }
};
