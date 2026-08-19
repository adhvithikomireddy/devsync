const mongoose = require('mongoose');

const lineChangeSchema = new mongoose.Schema(
  {
    lineNumber: Number,
    type: {
      type: String,
      enum: ['added', 'removed', 'modified'],
    },
    content: String,
  },
  { _id: false }
);

const codeChangeSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    file: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'File',
      required: true,
      index: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    previousContent: {
      type: String,
      default: '',
    },
    newContent: {
      type: String,
      default: '',
    },
    diff: {
      type: String,
      default: '',
    },
    summary: {
      type: String,
      default: '',
    },
    startLine: {
      type: Number,
      default: 1,
    },
    endLine: {
      type: Number,
      default: 1,
    },
    linesAdded: {
      type: Number,
      default: 0,
    },
    linesRemoved: {
      type: Number,
      default: 0,
    },
    lineDetails: [lineChangeSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('CodeChange', codeChangeSchema);
