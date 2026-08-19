const meetingService = require('../services/meetingService');

function registerMeetingSocket(io, socket) {
  const user = socket.user;

  // Join meeting room & start signaling
  socket.on('webrtc-join-room', async ({ projectId, roomId }) => {
    if (!projectId) return;

    const meetingRoom = `meeting:${projectId}`;
    socket.join(meetingRoom);
    socket.meetingProjectId = projectId;

    await meetingService.startOrJoinMeeting({
      projectId,
      userId: user._id,
      socketId: socket.id,
      io,
    });

    // Notify other peers in meeting room that a new peer joined
    socket.to(meetingRoom).emit('webrtc-peer-joined', {
      socketId: socket.id,
      user: {
        _id: user._id,
        name: user.name,
        avatar: user.avatar,
        color: user.color,
      },
    });

    console.log(`[DevSync WebRTC] User ${user.name} joined meeting room: ${meetingRoom}`);
  });

  // Forward SDP Offer to specific target peer
  socket.on('webrtc-offer', ({ targetSocketId, sdp }) => {
    if (!targetSocketId) return;
    io.to(targetSocketId).emit('webrtc-offer', {
      senderSocketId: socket.id,
      user: {
        _id: user._id,
        name: user.name,
        avatar: user.avatar,
        color: user.color,
      },
      sdp,
    });
  });

  // Forward SDP Answer to specific target peer
  socket.on('webrtc-answer', ({ targetSocketId, sdp }) => {
    if (!targetSocketId) return;
    io.to(targetSocketId).emit('webrtc-answer', {
      senderSocketId: socket.id,
      sdp,
    });
  });

  // Forward ICE candidate to specific target peer
  socket.on('webrtc-ice-candidate', ({ targetSocketId, candidate }) => {
    if (!targetSocketId) return;
    io.to(targetSocketId).emit('webrtc-ice-candidate', {
      senderSocketId: socket.id,
      candidate,
    });
  });

  // Broadcast media toggle (Audio mute, Video camera on/off, Screen share)
  socket.on('webrtc-media-toggle', ({ projectId, isAudioMuted, isVideoOff, isScreenSharing }) => {
    if (!projectId) return;
    socket.to(`meeting:${projectId}`).emit('webrtc-peer-media-toggled', {
      socketId: socket.id,
      userId: user._id,
      isAudioMuted,
      isVideoOff,
      isScreenSharing,
    });
  });

  // Leave meeting
  socket.on('webrtc-leave-room', async ({ projectId }) => {
    if (!projectId) return;
    const meetingRoom = `meeting:${projectId}`;
    socket.leave(meetingRoom);

    socket.to(meetingRoom).emit('webrtc-peer-left', {
      socketId: socket.id,
      userId: user._id,
    });

    await meetingService.leaveMeeting({
      projectId,
      userId: user._id,
      io,
    });
  });
}

module.exports = registerMeetingSocket;
