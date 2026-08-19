const express = require('express');
const router = express.Router({ mergeParams: true });
const { getProjectChanges, getChangeById } = require('../controllers/changeController');
const { protect } = require('../middleware/authMiddleware');
const { requireProjectRole } = require('../middleware/permissionMiddleware');

router.use(protect);

router.get(
  '/',
  requireProjectRole(['owner', 'admin', 'editor', 'viewer']),
  getProjectChanges
);

router.get(
  '/:changeId',
  requireProjectRole(['owner', 'admin', 'editor', 'viewer']),
  getChangeById
);

module.exports = router;
