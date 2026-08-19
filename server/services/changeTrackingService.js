const CodeChange = require('../models/CodeChange');
const Activity = require('../models/Activity');
const File = require('../models/File');
const { computeDiff } = require('../utils/diffHelper');

/**
 * Record a code change event with computed diffs and activity log
 */
async function recordCodeChange({ projectId, fileId, userId, previousContent, newContent, io = null }) {
  if (previousContent === newContent) {
    return null; // No change
  }

  try {
    const file = await File.findById(fileId);
    if (!file) return null;

    const diffResult = computeDiff(previousContent, newContent, file.name);

    // Only record if there are line changes
    if (diffResult.linesAdded === 0 && diffResult.linesRemoved === 0) {
      return null;
    }

    const codeChange = await CodeChange.create({
      project: projectId,
      file: fileId,
      filePath: file.path,
      user: userId,
      timestamp: new Date(),
      previousContent,
      newContent,
      diff: diffResult.diff,
      summary: diffResult.summary,
      startLine: diffResult.startLine,
      endLine: diffResult.endLine,
      linesAdded: diffResult.linesAdded,
      linesRemoved: diffResult.linesRemoved,
      lineDetails: diffResult.lineDetails,
    });

    const populatedChange = await CodeChange.findById(codeChange._id).populate('user', 'name avatar color title');

    // Create activity record
    const activity = await Activity.create({
      project: projectId,
      user: userId,
      action: 'FILE_UPDATED',
      metadata: {
        fileId,
        fileName: file.name,
        filePath: file.path,
        summary: diffResult.summary,
        startLine: diffResult.startLine,
        endLine: diffResult.endLine,
        changeId: codeChange._id,
      },
    });

    const populatedActivity = await Activity.findById(activity._id).populate('user', 'name avatar color title');

    // Broadcast change and activity via Socket.IO if available
    if (io) {
      io.to(`project:${projectId}`).emit('code-change-recorded', populatedChange);
      io.to(`project:${projectId}`).emit('activity-recorded', populatedActivity);
    }

    return populatedChange;
  } catch (err) {
    console.error('[ChangeTrackingService Error]:', err.message);
    return null;
  }
}

module.exports = { recordCodeChange };
