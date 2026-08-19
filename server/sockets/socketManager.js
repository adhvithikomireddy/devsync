const jwt = require('jsonwebtoken');
const User = require('../models/User');
const registerCollaborationSocket = require('./collaborationSocket');
const registerChatSocket = require('./chatSocket');
const registerMeetingSocket = require('./meetingSocket');
const collaborationService = require('../services/collaborationService');
const meetingService = require('../services/meetingService');

function setupSocketIO(io) {
  // Socket Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) {
        return next(new Error('Authentication error: Token required'));
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'devsync_jwt_super_secret_key_2026_collaborative_workspace_token'
      );

      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.user = user;
      next();
    } catch (err) {
      console.warn('[Socket Auth Error]:', err.message);
      next(new Error('Authentication error: Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`[DevSync Socket] Authenticated client connected: ${socket.user.name} (${socket.id})`);

    // Register modular socket handlers
    registerCollaborationSocket(io, socket);
    registerChatSocket(io, socket);
    registerMeetingSocket(io, socket);

    // Global Disconnect Handler
    socket.on('disconnect', async () => {
      console.log(`[DevSync Socket] Client disconnected: ${socket.user.name} (${socket.id})`);

      // Clean up collaboration presence
      const affectedProjects = collaborationService.removeSocketFromAll(socket.id);
      affectedProjects.forEach((projectId) => {
        const remainingUsers = collaborationService.getProjectUsers(projectId);
        io.to(`project:${projectId}`).emit('presence-update', remainingUsers);
      });

      // Clean up active meeting if connected
      if (socket.meetingProjectId) {
        const meetingRoom = `meeting:${socket.meetingProjectId}`;
        socket.to(meetingRoom).emit('webrtc-peer-left', {
          socketId: socket.id,
          userId: socket.user._id,
        });

        await meetingService.leaveMeeting({
          projectId: socket.meetingProjectId,
          userId: socket.user._id,
          io,
        });
      }
    });
  });
}

module.exports = setupSocketIO;
