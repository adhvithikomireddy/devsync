const { executeCode } = require('../services/executionService');
const Activity = require('../models/Activity');

// @desc    Execute code in sandboxed runner
// @route   POST /api/projects/:projectId/run
// @access  Private (Editor/Admin/Owner)
const runCode = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { language, code, fileName, stdin } = req.body;

    if (!code || !language) {
      return res.status(400).json({
        success: false,
        message: 'Language and code are required for execution',
      });
    }

    const result = await executeCode({
      language,
      code,
      fileName,
      stdin,
    });

    // Record activity for audit
    await Activity.create({
      project: projectId,
      user: req.user._id,
      action: 'CODE_EXECUTED',
      metadata: {
        fileName: fileName || 'snippet',
        language,
        exitCode: result.exitCode,
        executionTime: result.executionTime,
      },
    });

    return res.status(200).json({
      success: true,
      result,
    });
  } catch (err) {
    console.error('[Execution Controller Error]:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Execution engine encountered an unexpected error',
      result: {
        stdout: '',
        stderr: err.message,
        exitCode: 1,
        executionTime: '0.000',
      },
    });
  }
};

module.exports = { runCode };
