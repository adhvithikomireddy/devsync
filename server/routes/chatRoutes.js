const express = require('express');
const router = express.Router({ mergeParams: true });
const { getChatMessages } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');
const { requireProjectRole } = require('../middleware/permissionMiddleware');

router.use(protect);

router.get(
  '/',
  requireProjectRole(['owner', 'admin', 'editor', 'viewer']),
  getChatMessages
);

module.exports = router;
