const { queryAI: runAIQuery } = require('../services/aiService');

// @desc    Process AI coding request (chat, explain, debug, optimize, tests, docs)
// @route   POST /api/ai/query
// @access  Private
const queryAI = async (req, res) => {
  try {
    const { prompt = '', context = {}, action = 'chat' } = req.body;

    const result = await runAIQuery({
      prompt,
      context,
      action,
    });

    return res.status(200).json({
      success: true,
      action: result.action || action,
      reply: result.reply || result,
      engine: result.engine || 'DevSync Intelligence',
    });
  } catch (err) {
    console.error('[AI Controller Error]:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Error processing AI query',
    });
  }
};

module.exports = { queryAI };
