const ChatMessage = require('../models/ChatMessage');
const Notification = require('../models/Notification');
const Project = require('../models/Project');

function registerChatSocket(io, socket) {
  const user = socket.user;

  socket.on('send-message', async ({ projectId, message, codeReference }) => {
    if (!projectId || !message?.trim()) return;

    try {
      const chatMessage = await ChatMessage.create({
        project: projectId,
        user: user._id,
        message: message.trim(),
        codeReference: codeReference || null,
      });

      const populatedMessage = await ChatMessage.findById(chatMessage._id).populate(
        'user',
        'name avatar color title'
      );

      // Broadcast to project room
      io.to(`project:${projectId}`).emit('new-message', populatedMessage);

      // Check for user mentions (e.g. @Rahul or @someone)
      const mentionMatches = message.match(/@([a-zA-Z0-9_-]+)/g);
      if (mentionMatches) {
        const project = await Project.findById(projectId).populate('members.user', 'name email');
        if (project) {
          mentionMatches.forEach(async (mention) => {
            const cleanName = mention.substring(1).toLowerCase();
            const targetMember = project.members.find(
              (m) => m.user?.name?.toLowerCase().includes(cleanName) && m.user._id.toString() !== user._id.toString()
            );
            if (targetMember) {
              await Notification.create({
                recipient: targetMember.user._id,
                sender: user._id,
                type: 'CHAT_MENTION',
                title: `${user.name} mentioned you in ${project.name}`,
                message: message.slice(0, 100),
                project: projectId,
                link: `/project/${projectId}`,
              });
            }
          });
        }
      }
    } catch (err) {
      console.error('[ChatSocket Error]:', err.message);
    }
  });
}

module.exports = registerChatSocket;
