const ChatMessage = require('../models/ChatMessage');

// @desc    Get chat message history for project
// @route   GET /api/projects/:projectId/chat
// @access  Private
const getChatMessages = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { limit = 100 } = req.query;

    const messages = await ChatMessage.find({ project: projectId })
      .populate('user', 'name avatar color title')
      .populate('codeReference.changeId')
      .sort({ createdAt: 1 })
      .limit(parseInt(limit, 10));

    return res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving chat history',
    });
  }
};

module.exports = { getChatMessages };
