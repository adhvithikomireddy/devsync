const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'File name is required'],
      trim: true,
    },
    path: {
      type: String,
      required: [true, 'File path is required'],
      trim: true,
    },
    language: {
      type: String,
      default: 'plaintext',
    },
    content: {
      type: String,
      default: '',
    },
    isDirectory: {
      type: Boolean,
      default: false,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'File',
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Compound index to ensure uniqueness of path per project
fileSchema.index({ project: 1, path: 1 }, { unique: true });

module.exports = mongoose.model('File', fileSchema);
