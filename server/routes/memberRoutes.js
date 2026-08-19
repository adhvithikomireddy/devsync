const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getProjectMembers,
  inviteMember,
  getMyInvitations,
  acceptInvitation,
  rejectInvitation,
  updateMemberRole,
  removeMember,
} = require('../controllers/memberController');
const { protect } = require('../middleware/authMiddleware');
const { requireProjectRole } = require('../middleware/permissionMiddleware');

router.use(protect);

// Global user invitations
router.get('/invitations/my', getMyInvitations);
router.post('/invitations/:invitationId/accept', acceptInvitation);
router.post('/invitations/:invitationId/reject', rejectInvitation);

// Project specific member endpoints
router
  .route('/')
  .get(requireProjectRole(['owner', 'admin', 'editor', 'viewer']), getProjectMembers);

router.post(
  '/invite',
  requireProjectRole(['owner', 'admin']),
  inviteMember
);

router
  .route('/:memberId')
  .put(requireProjectRole(['owner', 'admin']), updateMemberRole)
  .delete(requireProjectRole(['owner', 'admin']), removeMember);

module.exports = router;
