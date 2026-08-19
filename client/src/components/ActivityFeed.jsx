import React from 'react';
import { useProject } from '../context/ProjectContext';
import { timeAgo } from '../utils/formatters';
import {
  Activity as ActivityIcon,
  FilePlus,
  FileEdit,
  Trash2,
  UserPlus,
  Video,
  Play,
  Shield,
  Folder,
} from 'lucide-react';

export default function ActivityFeed() {
  const { activities, files, openFile } = useProject();

  const getActionDetails = (action, metadata = {}) => {
    switch (action) {
      case 'PROJECT_CREATED':
        return {
          icon: <Folder className="w-3.5 h-3.5 text-brand-400" />,
          text: `created the project workspace with ${metadata.template || 'javascript'} template`,
        };
      case 'FILE_CREATED':
        return {
          icon: <FilePlus className="w-3.5 h-3.5 text-emerald-400" />,
          text: `created ${metadata.isDirectory ? 'folder' : 'file'} "${metadata.fileName}"`,
          fileId: metadata.fileId,
        };
      case 'FILE_UPDATED':
        return {
          icon: <FileEdit className="w-3.5 h-3.5 text-brand-400" />,
          text: `edited "${metadata.fileName}" (${metadata.summary || 'modified'})`,
          fileId: metadata.fileId,
        };
      case 'FILE_DELETED':
        return {
          icon: <Trash2 className="w-3.5 h-3.5 text-rose-400" />,
          text: `deleted "${metadata.fileName}"`,
        };
      case 'FILE_RENAMED':
        return {
          icon: <FileEdit className="w-3.5 h-3.5 text-amber-400" />,
          text: `renamed "${metadata.oldPath}" to "${metadata.newName}"`,
          fileId: metadata.fileId,
        };
      case 'MEMBER_JOINED':
        return {
          icon: <UserPlus className="w-3.5 h-3.5 text-emerald-400" />,
          text: `joined the project as ${metadata.role}`,
        };
      case 'ROLE_CHANGED':
        return {
          icon: <Shield className="w-3.5 h-3.5 text-purple-400" />,
          text: `role was updated to ${metadata.newRole}`,
        };
      case 'MEETING_STARTED':
        return {
          icon: <Video className="w-3.5 h-3.5 text-rose-400" />,
          text: `started a live video meeting`,
        };
      case 'MEETING_ENDED':
        return {
          icon: <Video className="w-3.5 h-3.5 text-dark-400" />,
          text: `ended the video meeting`,
        };
      case 'CODE_EXECUTED':
        return {
          icon: <Play className="w-3.5 h-3.5 text-emerald-400" />,
          text: `ran "${metadata.fileName}" (${metadata.language}) [${metadata.executionTime}s]`,
        };
      default:
        return {
          icon: <ActivityIcon className="w-3.5 h-3.5 text-dark-400" />,
          text: action.toLowerCase().replace(/_/g, ' '),
        };
    }
  };

  const handleFileClick = (fileId) => {
    if (!fileId) return;
    const targetFile = files.find((f) => f._id === fileId);
    if (targetFile) {
      openFile(targetFile);
    }
  };

  return (
    <div className="h-full flex flex-col bg-dark-900 font-sans text-xs select-none p-3 overflow-y-auto space-y-2">
      <div className="flex items-center justify-between pb-2 border-b border-dark-800">
        <span className="text-[11px] font-bold text-dark-400 uppercase tracking-wider">
          Project Activity Timeline
        </span>
        <span className="text-[11px] text-dark-500">{activities.length} Events</span>
      </div>

      <div className="space-y-2 select-text">
        {activities.map((act) => {
          const user = act.user || { name: 'Teammate', color: '#3b82f6' };
          const { icon, text, fileId } = getActionDetails(act.action, act.metadata);

          return (
            <div
              key={act._id}
              onClick={() => handleFileClick(fileId)}
              className={`p-3 rounded-xl bg-dark-850 border border-dark-700/80 transition-colors flex items-start space-x-3 ${
                fileId ? 'hover:border-brand-500/40 cursor-pointer' : ''
              }`}
            >
              <div className="mt-0.5 p-1.5 rounded-lg bg-dark-800 border border-dark-700 shrink-0">
                {icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-dark-100">{user.name}</span>
                  <span className="text-[10px] text-dark-500">{timeAgo(act.createdAt)}</span>
                </div>
                <p className="text-dark-300 mt-0.5 leading-relaxed">{text}</p>
              </div>
            </div>
          );
        })}

        {activities.length === 0 && (
          <div className="py-8 text-center text-xs text-dark-500">
            No activity recorded yet.
          </div>
        )}
      </div>
    </div>
  );
}
