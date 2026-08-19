const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'PROJECT_CREATED',
        'FILE_CREATED',
        'FILE_UPDATED',
        'FILE_DELETED',
        'FILE_RENAMED',
        'MEMBER_JOINED',
        'MEMBER_INVITED',
        'MEMBER_REMOVED',
        'ROLE_CHANGED',
        'MEETING_STARTED',
        'MEETING_ENDED',
        'CODE_EXECUTED',
        'STATUS_UPDATED',
      ],
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: false }
);

module.exports = mongoose.model('Activity', activitySchema);
