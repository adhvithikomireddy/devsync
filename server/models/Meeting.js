const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    socketId: String,
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    leftAt: Date,
  },
  { _id: false }
);

const meetingSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    roomId: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['active', 'ended'],
      default: 'active',
    },
    participants: [participantSchema],
    startedAt: {
      type: Date,
      default: Date.now,
    },
    endedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Meeting', meetingSchema);
