const Meeting = require('../models/Meeting');
const Project = require('../models/Project');
const Activity = require('../models/Activity');

async function getActiveMeeting(projectId) {
  return await Meeting.findOne({ project: projectId, status: 'active' })
    .populate('host', 'name avatar color')
    .populate('participants.user', 'name avatar color');
}

async function startOrJoinMeeting({ projectId, userId, socketId, io }) {
  let meeting = await Meeting.findOne({ project: projectId, status: 'active' });

  if (!meeting) {
    const roomId = `meeting-${projectId}-${Date.now()}`;
    meeting = await Meeting.create({
      project: projectId,
      host: userId,
      roomId,
      status: 'active',
      participants: [{ user: userId, socketId, joinedAt: new Date() }],
      startedAt: new Date(),
    });

    await Project.findByIdAndUpdate(projectId, { activeMeeting: meeting._id });

    const activity = await Activity.create({
      project: projectId,
      user: userId,
      action: 'MEETING_STARTED',
      metadata: { meetingId: meeting._id, roomId },
    });

    if (io) {
      const populatedActivity = await Activity.findById(activity._id).populate('user', 'name avatar color');
      io.to(`project:${projectId}`).emit('activity-recorded', populatedActivity);
    }
  } else {
    // Check if user already in participants
    const existingIndex = meeting.participants.findIndex(
      (p) => p.user.toString() === userId.toString() && !p.leftAt
    );
    if (existingIndex === -1) {
      meeting.participants.push({ user: userId, socketId, joinedAt: new Date() });
      await meeting.save();
    }
  }

  const populated = await Meeting.findById(meeting._id)
    .populate('host', 'name avatar color')
    .populate('participants.user', 'name avatar color');

  if (io) {
    io.to(`project:${projectId}`).emit('meeting-status-changed', populated);
  }

  return populated;
}

async function leaveMeeting({ projectId, userId, io }) {
  const meeting = await Meeting.findOne({ project: projectId, status: 'active' });
  if (!meeting) return null;

  const participant = meeting.participants.find(
    (p) => p.user.toString() === userId.toString() && !p.leftAt
  );

  if (participant) {
    participant.leftAt = new Date();
  }

  // If no more active participants, end meeting
  const activeCount = meeting.participants.filter((p) => !p.leftAt).length;
  if (activeCount === 0) {
    meeting.status = 'ended';
    meeting.endedAt = new Date();
    await meeting.save();
    await Project.findByIdAndUpdate(projectId, { activeMeeting: null });

    const activity = await Activity.create({
      project: projectId,
      user: userId,
      action: 'MEETING_ENDED',
      metadata: { meetingId: meeting._id },
    });

    if (io) {
      const populatedActivity = await Activity.findById(activity._id).populate('user', 'name avatar color');
      io.to(`project:${projectId}`).emit('activity-recorded', populatedActivity);
      io.to(`project:${projectId}`).emit('meeting-status-changed', null);
    }
    return null;
  }

  await meeting.save();
  const populated = await Meeting.findById(meeting._id)
    .populate('host', 'name avatar color')
    .populate('participants.user', 'name avatar color');

  if (io) {
    io.to(`project:${projectId}`).emit('meeting-status-changed', populated);
  }
  return populated;
}

module.exports = { getActiveMeeting, startOrJoinMeeting, leaveMeeting };
