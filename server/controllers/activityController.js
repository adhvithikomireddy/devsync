const Activity = require('../models/Activity');

// @desc    Get activities for a project
// @route   GET /api/projects/:projectId/activity
// @access  Private
const getProjectActivities = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { limit = 50 } = req.query;

    const activities = await Activity.find({ project: projectId })
      .populate('user', 'name avatar color title')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10));

    return res.status(200).json({
      success: true,
      count: activities.length,
      activities,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving activities',
    });
  }
};

module.exports = { getProjectActivities };
