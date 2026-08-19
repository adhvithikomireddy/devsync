const express = require('express');
const router = express.Router({ mergeParams: true });
const { runCode } = require('../controllers/executionController');
const { protect } = require('../middleware/authMiddleware');
const { requireProjectRole } = require('../middleware/permissionMiddleware');

router.use(protect);

router.post(
  '/run',
  requireProjectRole(['owner', 'admin', 'editor']),
  runCode
);

module.exports = router;
