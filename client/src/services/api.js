const BASE_URL = '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('devsync_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({
    success: false,
    message: 'Invalid JSON response from server',
  }));

  if (!response.ok) {
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  signup: (userData) => request('/auth/signup', { method: 'POST', body: JSON.stringify(userData) }),
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getMe: () => request('/auth/me'),
  updateProfile: (profileData) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(profileData) }),

  // Projects
  getProjects: () => request('/projects'),
  getProjectById: (id) => request(`/projects/${id}`),
  createProject: (data) => request('/projects', { method: 'POST', body: JSON.stringify(data) }),
  updateProject: (id, data) => request(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProject: (id) => request(`/projects/${id}`, { method: 'DELETE' }),
  getDashboardStats: () => request('/projects/dashboard/stats'),

  // Files
  getFiles: (projectId) => request(`/projects/${projectId}/files`),
  getFile: (projectId, fileId) => request(`/projects/${projectId}/files/${fileId}`),
  createFile: (projectId, data) => request(`/projects/${projectId}/files`, { method: 'POST', body: JSON.stringify(data) }),
  updateFileContent: (projectId, fileId, content) =>
    request(`/projects/${projectId}/files/${fileId}`, { method: 'PUT', body: JSON.stringify({ content }) }),
  renameFile: (projectId, fileId, newName) =>
    request(`/projects/${projectId}/files/${fileId}/rename`, { method: 'PUT', body: JSON.stringify({ newName }) }),
  deleteFile: (projectId, fileId) =>
    request(`/projects/${projectId}/files/${fileId}`, { method: 'DELETE' }),

  // Members & Invitations
  getMembers: (projectId) => request(`/projects/${projectId}/members`),
  inviteMember: (projectId, data) => request(`/projects/${projectId}/members/invite`, { method: 'POST', body: JSON.stringify(data) }),
  updateMemberRole: (projectId, memberId, role) =>
    request(`/projects/${projectId}/members/${memberId}`, { method: 'PUT', body: JSON.stringify({ role }) }),
  removeMember: (projectId, memberId) =>
    request(`/projects/${projectId}/members/${memberId}`, { method: 'DELETE' }),
  getMyInvitations: () => request('/members/invitations/my'),
  acceptInvitation: (invitationId) => request(`/members/invitations/${invitationId}/accept`, { method: 'POST' }),
  rejectInvitation: (invitationId) => request(`/members/invitations/${invitationId}/reject`, { method: 'POST' }),

  // Code Execution
  runCode: (projectId, data) =>
    request(`/projects/${projectId}/run`, { method: 'POST', body: JSON.stringify(data) }),

  // AI Assistant
  queryAI: (data) => request('/ai/query', { method: 'POST', body: JSON.stringify(data) }),

  // Changes & Attribution
  getChanges: (projectId, fileId) =>
    request(`/projects/${projectId}/changes${fileId ? `?fileId=${fileId}` : ''}`),
  getChangeById: (projectId, changeId) => request(`/projects/${projectId}/changes/${changeId}`),

  // Activity Feed
  getActivities: (projectId) => request(`/projects/${projectId}/activity`),

  // Chat
  getChatMessages: (projectId) => request(`/projects/${projectId}/chat`),

  // Notifications
  getNotifications: () => request('/notifications'),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => request('/notifications/read-all', { method: 'PUT' }),
};
