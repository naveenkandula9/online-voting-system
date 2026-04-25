import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    party: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    state: {
      type: String,
      required: true,
      enum: ['Andhra Pradesh', 'Telangana'],
    },
    partySymbol: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    voteCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

candidateSchema.index({ state: 1, party: 1 });

const Candidate = mongoose.model('Candidate', candidateSchema);

export default Candidate;
