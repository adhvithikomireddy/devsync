/**
 * Collaboration State Manager
 * Tracks presence, active files, typing states, and cursor awareness across connected sockets
 */
class CollaborationService {
  constructor() {
    // Map of projectId -> Map of socketId -> UserPresence
    this.projectPresence = new Map();
    // Map of fileId -> Set of socketIds editing/viewing
    this.filePresence = new Map();
  }

  addUser(projectId, socketId, user) {
    if (!this.projectPresence.has(projectId)) {
      this.projectPresence.set(projectId, new Map());
    }

    const projectMap = this.projectPresence.get(projectId);
    const presenceData = {
      socketId,
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      color: user.color || '#3b82f6',
      title: user.title || 'Engineer',
      status: 'online',
      activeFile: null, // { fileId, filePath, fileName, mode: 'editing' | 'viewing' }
      cursor: null,     // { lineNumber, column }
      selection: null,  // { startLineNumber, startColumn, endLineNumber, endColumn }
      joinedAt: Date.now(),
      lastActive: Date.now(),
    };

    projectMap.set(socketId, presenceData);
    return this.getProjectUsers(projectId);
  }

  updateUserActiveFile(projectId, socketId, fileData) {
    const projectMap = this.projectPresence.get(projectId);
    if (!projectMap || !projectMap.has(socketId)) return null;

    const userPresence = projectMap.get(socketId);
    userPresence.activeFile = fileData; // { fileId, filePath, fileName, mode }
    userPresence.lastActive = Date.now();
    return userPresence;
  }

  updateUserCursor(projectId, socketId, cursorData) {
    const projectMap = this.projectPresence.get(projectId);
    if (!projectMap || !projectMap.has(socketId)) return null;

    const userPresence = projectMap.get(socketId);
    userPresence.cursor = cursorData.cursor;
    userPresence.selection = cursorData.selection;
    userPresence.lastActive = Date.now();
    return userPresence;
  }

  removeUser(projectId, socketId) {
    const projectMap = this.projectPresence.get(projectId);
    if (!projectMap) return [];

    projectMap.delete(socketId);
    if (projectMap.size === 0) {
      this.projectPresence.delete(projectId);
    }
    return this.getProjectUsers(projectId);
  }

  removeSocketFromAll(socketId) {
    const affectedProjects = [];
    for (const [projectId, projectMap] of this.projectPresence.entries()) {
      if (projectMap.has(socketId)) {
        projectMap.delete(socketId);
        affectedProjects.push(projectId);
        if (projectMap.size === 0) {
          this.projectPresence.delete(projectId);
        }
      }
    }
    return affectedProjects;
  }

  getProjectUsers(projectId) {
    const projectMap = this.projectPresence.get(projectId);
    if (!projectMap) return [];
    return Array.from(projectMap.values());
  }
}

module.exports = new CollaborationService();
