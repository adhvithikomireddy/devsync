const mongoose = require('mongoose');

const codeReferenceSchema = new mongoose.Schema(
  {
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'File',
    },
    filePath: String,
    startLine: Number,
    endLine: Number,
    snippet: String,
    changeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CodeChange',
    },
  },
  { _id: false }
);

const chatMessageSchema = new mongoose.Schema(
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
    message: {
      type: String,
      required: [true, 'Message content is required'],
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    codeReference: codeReferenceSchema,
  },
  { timestamps: true }
);

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
