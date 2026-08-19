const Project = require('../models/Project');
const User = require('../models/User');
const Invitation = require('../models/Invitation');
const Notification = require('../models/Notification');
const Activity = require('../models/Activity');

// @desc    Get project members
// @route   GET /api/projects/:projectId/members
// @access  Private
const getProjectMembers = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId).populate(
      'members.user',
      'name email avatar color title status currentTask taskStatus'
    );

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    return res.status(200).json({
      success: true,
      members: project.members,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving members',
    });
  }
};

// @desc    Invite member to project by email (Creates a pending invitation request)
// @route   POST /api/projects/:projectId/members/invite
// @access  Private (Owner/Admin)
const inviteMember = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { email, role = 'editor' } = req.body;

    if (!email?.trim()) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const project = await Project.findById(projectId).populate('members.user', 'email');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Check if user is already an active member of this project
    const isAlreadyMember = project.members.some(
      (m) => m.user?.email?.toLowerCase() === cleanEmail
    );
    if (isAlreadyMember) {
      return res.status(400).json({
        success: false,
        message: 'User is already an active member of this project',
      });
    }

    // Create or update pending invitation
    const invitation = await Invitation.findOneAndUpdate(
      { project: projectId, inviteeEmail: cleanEmail },
      { inviter: req.user._id, role, status: 'pending' },
      { upsert: true, new: true }
    ).populate('project', 'name description template');

    // If invitee is registered on DevSync, send them an invitation notification
    const targetUser = await User.findOne({ email: cleanEmail });
    if (targetUser) {
      await Notification.create({
        recipient: targetUser._id,
        sender: req.user._id,
        type: 'INVITATION',
        title: `Project Invitation: ${project.name}`,
        message: `${req.user.name} invited you to join "${project.name}" as an ${role}. Please accept or decline the request.`,
        project: project._id,
        link: `/notifications`,
      });
    }

    // Record activity for inviter audit
    await Activity.create({
      project: project._id,
      user: req.user._id,
      action: 'MEMBER_INVITED',
      metadata: {
        inviteeEmail: cleanEmail,
        role,
        invitationId: invitation._id,
      },
    });

    return res.status(200).json({
      success: true,
      message: `Invitation request sent to ${cleanEmail}. The recipient will be added once they accept.`,
      invitation,
    });
  } catch (err) {
    console.error('[Invite Member Error]:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error sending invitation',
    });
  }
};

// @desc    Get all pending invitations for currently logged in user
// @route   GET /api/members/invitations/my
// @access  Private
const getMyInvitations = async (req, res) => {
  try {
    const userEmail = req.user.email.toLowerCase();

    const invitations = await Invitation.find({
      inviteeEmail: userEmail,
      status: 'pending',
    })
      .populate('project', 'name description template owner members')
      .populate('inviter', 'name avatar color title')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: invitations.length,
      invitations,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving your invitations',
    });
  }
};

// @desc    Accept project invitation
// @route   POST /api/members/invitations/:invitationId/accept
// @access  Private
const acceptInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;
    const userEmail = req.user.email.toLowerCase();

    const invitation = await Invitation.findById(invitationId).populate('project');
    if (!invitation) {
      return res.status(404).json({ success: false, message: 'Invitation not found' });
    }

    if (invitation.inviteeEmail.toLowerCase() !== userEmail) {
      return res.status(403).json({
        success: false,
        message: 'This invitation was not sent to your email address',
      });
    }

    if (invitation.status === 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Invitation has already been accepted',
      });
    }

    const project = await Project.findById(invitation.project._id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project no longer exists' });
    }

    // Add member if not already added
    const isMember = project.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      project.members.push({
        user: req.user._id,
        role: invitation.role || 'editor',
        joinedAt: new Date(),
      });
      await project.save();
    }

    // Update invitation status
    invitation.status = 'accepted';
    await invitation.save();

    // Record activity
    await Activity.create({
      project: project._id,
      user: req.user._id,
      action: 'MEMBER_JOINED',
      metadata: {
        memberName: req.user.name,
        role: invitation.role,
      },
    });

    // Notify inviter
    await Notification.create({
      recipient: invitation.inviter,
      sender: req.user._id,
      type: 'GENERAL',
      title: `${req.user.name} accepted your invitation`,
      message: `${req.user.name} accepted your invitation to join "${project.name}".`,
      project: project._id,
      link: `/project/${project._id}`,
    });

    const updatedProject = await Project.findById(project._id)
      .populate('members.user', 'name email avatar color title status')
      .populate('owner', 'name email avatar color title');

    const io = req.app.get('io');
    if (io) {
      io.to(`project:${project._id}`).emit('members-updated', updatedProject.members);
    }

    return res.status(200).json({
      success: true,
      message: `You have joined "${project.name}" as an ${invitation.role}!`,
      project: updatedProject,
    });
  } catch (err) {
    console.error('[Accept Invitation Error]:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error accepting invitation',
    });
  }
};

// @desc    Decline/Reject project invitation
// @route   POST /api/members/invitations/:invitationId/reject
// @access  Private
const rejectInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;
    const userEmail = req.user.email.toLowerCase();

    const invitation = await Invitation.findById(invitationId);
    if (!invitation) {
      return res.status(404).json({ success: false, message: 'Invitation not found' });
    }

    if (invitation.inviteeEmail.toLowerCase() !== userEmail) {
      return res.status(403).json({
        success: false,
        message: 'This invitation was not sent to your email address',
      });
    }

    invitation.status = 'rejected';
    await invitation.save();

    return res.status(200).json({
      success: true,
      message: 'Invitation declined.',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error declining invitation',
    });
  }
};

// @desc    Update a member's role
// @route   PUT /api/projects/:projectId/members/:memberId
// @access  Private (Owner/Admin)
const updateMemberRole = async (req, res) => {
  try {
    const { projectId, memberId } = req.params;
    const { role } = req.body;

    if (!['admin', 'editor', 'viewer'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const member = project.members.find(
      (m) => m.user.toString() === memberId || m._id?.toString() === memberId
    );

    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found in project' });
    }

    if (member.role === 'owner' || project.owner.toString() === member.user.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot modify project owner role' });
    }

    member.role = role;
    await project.save();

    await Notification.create({
      recipient: member.user,
      sender: req.user._id,
      type: 'ROLE_CHANGED',
      title: `Role updated in ${project.name}`,
      message: `Your role was updated to "${role}"`,
      project: project._id,
      link: `/project/${project._id}`,
    });

    await Activity.create({
      project: project._id,
      user: req.user._id,
      action: 'ROLE_CHANGED',
      metadata: { targetUserId: member.user, newRole: role },
    });

    const updatedProject = await Project.findById(projectId).populate(
      'members.user',
      'name email avatar color title status'
    );

    const io = req.app.get('io');
    if (io) {
      io.to(`project:${projectId}`).emit('members-updated', updatedProject.members);
    }

    return res.status(200).json({
      success: true,
      message: 'Member role updated',
      members: updatedProject.members,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error updating member role',
    });
  }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:projectId/members/:memberId
// @access  Private (Owner/Admin)
const removeMember = async (req, res) => {
  try {
    const { projectId, memberId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.owner.toString() === memberId) {
      return res.status(400).json({ success: false, message: 'Cannot remove the project owner' });
    }

    project.members = project.members.filter(
      (m) => m.user.toString() !== memberId && m._id?.toString() !== memberId
    );
    await project.save();

    await Activity.create({
      project: project._id,
      user: req.user._id,
      action: 'MEMBER_REMOVED',
      metadata: { removedUserId: memberId },
    });

    const updatedProject = await Project.findById(projectId).populate(
      'members.user',
      'name email avatar color title status'
    );

    const io = req.app.get('io');
    if (io) {
      io.to(`project:${projectId}`).emit('members-updated', updatedProject.members);
    }

    return res.status(200).json({
      success: true,
      message: 'Member removed from project',
      members: updatedProject.members,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error removing member',
    });
  }
};

module.exports = {
  getProjectMembers,
  inviteMember,
  getMyInvitations,
  acceptInvitation,
  rejectInvitation,
  updateMemberRole,
  removeMember,
};
