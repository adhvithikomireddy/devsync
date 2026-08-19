const CodeChange = require('../models/CodeChange');

// @desc    Get code changes for project or specific file
// @route   GET /api/projects/:projectId/changes
// @access  Private
const getProjectChanges = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { fileId, limit = 50 } = req.query;

    const filter = { project: projectId };
    if (fileId) {
      filter.file = fileId;
    }

    const changes = await CodeChange.find(filter)
      .populate('user', 'name avatar color title')
      .populate('file', 'name path language')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit, 10));

    return res.status(200).json({
      success: true,
      count: changes.length,
      changes,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving code change history',
    });
  }
};

// @desc    Get single code change with diff details
// @route   GET /api/projects/:projectId/changes/:changeId
// @access  Private
const getChangeById = async (req, res) => {
  try {
    const { projectId, changeId } = req.params;

    const change = await CodeChange.findOne({ _id: changeId, project: projectId })
      .populate('user', 'name avatar color title')
      .populate('file', 'name path language');

    if (!change) {
      return res.status(404).json({ success: false, message: 'Code change not found' });
    }

    return res.status(200).json({ success: true, change });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving change details',
    });
  }
};

module.exports = { getProjectChanges, getChangeById };
