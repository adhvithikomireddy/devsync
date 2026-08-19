import React from 'react';
import { useSocket } from '../context/SocketContext';
import { useProject } from '../context/ProjectContext';
import {
  Users,
  Video,
  FileCode,
  Eye,
  Edit3,
  Radio,
  CheckCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function CollaborationPanel({ onStartMeeting }) {
  const { presenceList } = useSocket();
  const { activeMeeting, openFile, files } = useProject();

  const handleOpenFile = (fileId) => {
    const targetFile = files.find((f) => f._id === fileId);
    if (targetFile) {
      openFile(targetFile);
    }
  };

  return (
    <div className="h-full flex flex-col bg-dark-850 select-none">
      {/* Header */}
      <div className="p-3 border-b border-dark-700 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-dark-100 uppercase tracking-wider">
            Live Team ({presenceList.length})
          </span>
        </div>
      </div>

      {/* Live Meeting Banner */}
      <div className="p-3 border-b border-dark-700/80 bg-dark-800/40">
        {activeMeeting ? (
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1.5 text-xs font-bold text-rose-400">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>Live Meeting Active</span>
              </span>
              <span className="text-[10px] text-dark-400">
                {activeMeeting.participants?.length || 1} in call
              </span>
            </div>
            <button
              onClick={onStartMeeting}
              className="w-full py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm transition-all"
            >
              Join Meeting
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-xs text-dark-400">No active meeting</span>
            {onStartMeeting && (
              <button
                onClick={onStartMeeting}
                className="flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 transition-colors"
              >
                <Video className="w-3 h-3" />
                <span>Start Call</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* "Who's working on what?" Presence List */}
      <div className="p-3 border-b border-dark-700">
        <span className="text-[11px] font-bold text-dark-400 uppercase tracking-wider">
          Who's Working On What?
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {presenceList.map((peer) => {
          const isEditing = peer.activeFile?.mode === 'editing';

          return (
            <div
              key={peer.socketId}
              className="p-3 rounded-xl bg-dark-800 border border-dark-700/80 space-y-2 hover:border-dark-600 transition-colors"
            >
              {/* User identity */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm"
                    style={{ backgroundColor: peer.color || '#3b82f6' }}
                  >
                    {peer.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-dark-100">{peer.name}</p>
                    <p className="text-[10px] text-dark-400">{peer.title || 'Engineer'}</p>
                  </div>
                </div>

                <span className="flex items-center space-x-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Online</span>
                </span>
              </div>

              {/* Active File Link */}
              {peer.activeFile?.fileName ? (
                <div
                  onClick={() => handleOpenFile(peer.activeFile.fileId)}
                  className="flex items-center justify-between p-2 rounded-lg bg-dark-750 hover:bg-dark-700 cursor-pointer text-xs text-dark-200 transition-colors group"
                >
                  <div className="flex items-center space-x-2 truncate">
                    {isEditing ? (
                      <Edit3 className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                    ) : (
                      <Eye className="w-3.5 h-3.5 text-dark-400 shrink-0" />
                    )}
                    <span className="truncate group-hover:text-white">
                      {isEditing ? 'Editing' : 'Viewing'} <span className="font-mono text-brand-400">{peer.activeFile.fileName}</span>
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-[11px] text-dark-500 italic px-1">
                  Viewing workspace overview
                </div>
              )}
            </div>
          );
        })}

        {presenceList.length === 0 && (
          <div className="py-6 text-center text-xs text-dark-500">
            No other collaborators online right now. Invite your team!
          </div>
        )}
      </div>
    </div>
  );
}
