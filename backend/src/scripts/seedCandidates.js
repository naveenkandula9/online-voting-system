import mongoose from 'mongoose';

import connectDatabase from '../config/db.js';
import Candidate from '../models/Candidate.js';

const candidates = [
  {
    name: 'Nara Chandrababu Naidu',
    party: 'TDP',
    state: 'Andhra Pradesh',
    partySymbol: '/images/tdp.jpg',
  },
  {
    name: 'Y. S. Jagan Mohan Reddy',
    party: 'YSRCP',
    state: 'Andhra Pradesh',
    partySymbol: '/images/YSRCPLOGO.jpg',
  },
  {
    name: 'BJP Candidate',
    party: 'BJP',
    state: 'Andhra Pradesh',
    partySymbol: '/images/bjp.jpg',
  },
  {
    name: 'INC Candidate',
    party: 'INC',
    state: 'Andhra Pradesh',
    partySymbol: '/images/inc.jpg',
  },
  {
    name: 'JSP Candidate',
    party: 'JSP',
    state: 'Andhra Pradesh',
    partySymbol: '/images/jsp-party.jpg',
  },
  {
    name: 'K. Chandrashekar Rao',
    party: 'BRS',
    state: 'Telangana',
    partySymbol: '/images/brs.jpg',
  },
  {
    name: 'INC Candidate',
    party: 'INC',
    state: 'Telangana',
    partySymbol: '/images/inc.jpg',
  },
  {
    name: 'BJP Candidate',
    party: 'BJP',
    state: 'Telangana',
    partySymbol: '/images/bjp.jpg',
  },
  {
    name: 'JSP Candidate',
    party: 'JSP',
    state: 'Telangana',
    partySymbol: '/images/jsp-party.jpg',
  },
];

const seedCandidates = async () => {
  await connectDatabase();

  const deleteResult = await Candidate.deleteMany({});
  const insertedCandidates = await Candidate.insertMany(candidates);

  console.log(`Cleared ${deleteResult.deletedCount} existing candidates.`);
  console.log(`Inserted ${insertedCandidates.length} candidates.`);
};

seedCandidates()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
