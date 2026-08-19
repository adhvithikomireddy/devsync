const express = require('express');
const router = express.Router({ mergeParams: true });
const { getProjectActivities } = require('../controllers/activityController');
const { protect } = require('../middleware/authMiddleware');
const { requireProjectRole } = require('../middleware/permissionMiddleware');

router.use(protect);

router.get(
  '/',
  requireProjectRole(['owner', 'admin', 'editor', 'viewer']),
  getProjectActivities
);

module.exports = router;
