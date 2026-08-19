const collaborationService = require('../services/collaborationService');

function registerCollaborationSocket(io, socket) {
  const user = socket.user;

  // Join Project Room
  socket.on('join-project', ({ projectId }) => {
    if (!projectId) return;

    socket.join(`project:${projectId}`);
    socket.projectId = projectId;

    const users = collaborationService.addUser(projectId, socket.id, user);
    io.to(`project:${projectId}`).emit('presence-update', users);

    console.log(`[DevSync Socket] User ${user.name} (${socket.id}) joined project:${projectId}`);
  });

  // Leave Project Room
  socket.on('leave-project', ({ projectId }) => {
    if (!projectId) return;

    socket.leave(`project:${projectId}`);
    const users = collaborationService.removeUser(projectId, socket.id);
    io.to(`project:${projectId}`).emit('presence-update', users);
  });

  // Active File Update (Who is working on what)
  socket.on('file-opened', ({ projectId, fileId, filePath, fileName, mode = 'editing' }) => {
    if (!projectId || !fileId) return;

    socket.join(`project:${projectId}:file:${fileId}`);
    collaborationService.updateUserActiveFile(projectId, socket.id, {
      fileId,
      filePath,
      fileName,
      mode,
    });

    const users = collaborationService.getProjectUsers(projectId);
    io.to(`project:${projectId}`).emit('presence-update', users);
  });

  socket.on('file-closed', ({ projectId, fileId }) => {
    if (!projectId) return;
    if (fileId) {
      socket.leave(`project:${projectId}:file:${fileId}`);
    }

    collaborationService.updateUserActiveFile(projectId, socket.id, null);
    const users = collaborationService.getProjectUsers(projectId);
    io.to(`project:${projectId}`).emit('presence-update', users);
  });

  // Real-time Code Synchronization (Delta / CRDT updates)
  socket.on('code-delta', ({ projectId, fileId, delta, version }) => {
    if (!projectId || !fileId) return;

    // Broadcast to other collaborators in the same file room
    socket.to(`project:${projectId}:file:${fileId}`).emit('code-delta-received', {
      fileId,
      delta,
      version,
      senderId: socket.id,
      userId: user._id,
      userName: user.name,
      userColor: user.color,
    });
  });

  // Cursor & Selection Synchronization
  socket.on('cursor-activity', ({ projectId, fileId, cursor, selection }) => {
    if (!projectId || !fileId) return;

    collaborationService.updateUserCursor(projectId, socket.id, { cursor, selection });

    socket.to(`project:${projectId}:file:${fileId}`).emit('cursor-activity-received', {
      fileId,
      socketId: socket.id,
      userId: user._id,
      userName: user.name,
      userColor: user.color,
      cursor,
      selection,
    });
  });

  // Typing Indicators
  socket.on('typing-start', ({ projectId, fileId, fileName }) => {
    if (!projectId || !fileId) return;
    socket.to(`project:${projectId}:file:${fileId}`).emit('user-typing', {
      fileId,
      fileName,
      userId: user._id,
      userName: user.name,
      userColor: user.color,
    });
  });

  socket.on('typing-stop', ({ projectId, fileId }) => {
    if (!projectId || !fileId) return;
    socket.to(`project:${projectId}:file:${fileId}`).emit('user-stopped-typing', {
      fileId,
      userId: user._id,
    });
  });

  // File System Events
  socket.on('file-tree-changed', ({ projectId, action, file }) => {
    if (!projectId) return;
    socket.to(`project:${projectId}`).emit('file-tree-updated', { action, file });
  });
}

module.exports = registerCollaborationSocket;
