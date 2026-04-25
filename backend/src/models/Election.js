import mongoose from 'mongoose';

const electionSchema = new mongoose.Schema(
  {
    isActive: {
      type: Boolean,
      default: false,
    },
    startTime: {
      type: Date,
      default: null,
    },
    endTime: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const Election = mongoose.model('Election', electionSchema);

export default Election;
