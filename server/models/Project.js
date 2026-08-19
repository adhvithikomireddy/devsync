const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'editor', 'viewer'],
      default: 'editor',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a project name'],
      trim: true,
      maxlength: [80, 'Project name cannot exceed 80 characters'],
    },
    description: {
      type: String,
      default: '',
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [memberSchema],
    visibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'private',
    },
    template: {
      type: String,
      enum: ['javascript', 'react', 'nodejs', 'python', 'java', 'c', 'cpp', 'html', 'html-css'],
      default: 'javascript',
    },
    activeMeeting: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Meeting',
      default: null,
    },
  },
  { timestamps: true }
);

// Method to check if user has permission
projectSchema.methods.getUserRole = function (userId) {
  if (this.owner.toString() === userId.toString()) {
    return 'owner';
  }
  const member = this.members.find(
    (m) => m.user._id?.toString() === userId.toString() || m.user.toString() === userId.toString()
  );
  return member ? member.role : null;
};

module.exports = mongoose.model('Project', projectSchema);
