import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { timeAgo } from '../utils/formatters';
import {
  Send,
  Code2,
  ExternalLink,
  MessageSquare,
  Paperclip,
  Check,
} from 'lucide-react';

export default function TeamChat({ onOpenDiff }) {
  const { socket } = useSocket();
  const { project, activeFile, openFile, files } = useProject();
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [includeCodeReference, setIncludeCodeReference] = useState(false);
  const messagesEndRef = useRef(null);

  // Load chat history
  useEffect(() => {
    if (!project?._id) return;

    async function loadChatHistory() {
      try {
        const res = await api.getChatMessages(project._id);
        if (res.success && res.messages) {
          setMessages(res.messages);
        }
      } catch (err) {
        console.warn('[TeamChat] Failed to load messages:', err.message);
      }
    }

    loadChatHistory();
  }, [project?._id]);

  // Listen for real-time messages
  useEffect(() => {
    if (!socket || !project?._id) return;

    function onNewMessage(msg) {
      setMessages((prev) => [...prev, msg]);
    }

    socket.on('new-message', onNewMessage);
    return () => {
      socket.off('new-message', onNewMessage);
    };
  }, [socket, project?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !socket || !project?._id) return;

    const codeRef =
      includeCodeReference && activeFile
        ? {
            fileId: activeFile._id,
            filePath: activeFile.path,
            snippet: activeFile.name,
          }
        : null;

    socket.emit('send-message', {
      projectId: project._id,
      message: inputText.trim(),
      codeReference: codeRef,
    });

    setInputText('');
    setIncludeCodeReference(false);
  };

  const handleOpenReference = (fileId) => {
    const targetFile = files.find((f) => f._id === fileId);
    if (targetFile) {
      openFile(targetFile);
    }
  };

  return (
    <div className="h-full flex flex-col bg-dark-900 font-sans text-xs select-none">
      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 select-text">
        {messages.map((m) => {
          const isMe = m.user?._id === user?._id || m.user === user?._id;
          const sender = m.user || { name: 'Collaborator', color: '#3b82f6' };

          return (
            <div
              key={m._id || m.createdAt}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center space-x-1.5 mb-1 px-1">
                <span className="font-semibold text-[11px] text-dark-300">
                  {isMe ? 'You' : sender.name}
                </span>
                <span className="text-[10px] text-dark-500">{timeAgo(m.createdAt)}</span>
              </div>

              <div
                className={`max-w-[85%] p-3 rounded-2xl space-y-2 shadow-sm ${
                  isMe
                    ? 'bg-brand-600 text-white rounded-tr-none'
                    : 'bg-dark-800 text-dark-100 border border-dark-700/80 rounded-tl-none'
                }`}
              >
                <p className="leading-relaxed whitespace-pre-wrap">{m.message}</p>

                {/* Code Attachment Snippet */}
                {m.codeReference && (
                  <div
                    onClick={() => handleOpenReference(m.codeReference.fileId)}
                    className={`flex items-center justify-between p-2 rounded-xl text-[11px] cursor-pointer transition-colors ${
                      isMe
                        ? 'bg-brand-700/60 hover:bg-brand-700 text-white'
                        : 'bg-dark-750 hover:bg-dark-700 text-brand-400 border border-dark-600'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 truncate">
                      <Code2 className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate font-mono">{m.codeReference.filePath}</span>
                    </div>
                    <ExternalLink className="w-3 h-3 shrink-0 ml-2" />
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {messages.length === 0 && (
          <div className="py-12 text-center text-xs text-dark-500">
            No messages yet. Send a message to start team conversation!
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSend} className="p-3 border-t border-dark-700 bg-dark-850 space-y-2">
        {activeFile && (
          <div className="flex items-center justify-between text-[11px] px-1 text-dark-400">
            <label className="flex items-center space-x-1.5 cursor-pointer hover:text-dark-200">
              <input
                type="checkbox"
                checked={includeCodeReference}
                onChange={(e) => setIncludeCodeReference(e.target.checked)}
                className="rounded bg-dark-800 border-dark-600 text-brand-500 focus:ring-0"
              />
              <span>Attach reference to active file: <strong className="font-mono text-dark-300">{activeFile.name}</strong></span>
            </label>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message or mention (@Rahul)..."
            className="flex-1 bg-dark-900 border border-dark-700 focus:border-brand-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
