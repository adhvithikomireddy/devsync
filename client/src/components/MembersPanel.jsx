import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Users,
  UserPlus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Eye,
  Trash2,
  Check,
} from 'lucide-react';

export default function MembersPanel({ onOpenInvite }) {
  const { project, userRole } = useProject();
  const { presenceList } = useSocket();
  const { user: currentUser } = useAuth();

  const [members, setMembers] = useState(project?.members || []);
  const canManage = ['owner', 'admin'].includes(userRole);

  const getRoleIcon = (role) => {
    switch (role) {
      case 'owner':
        return <ShieldAlert className="w-3.5 h-3.5 text-amber-400" title="Project Owner" />;
      case 'admin':
        return <ShieldCheck className="w-3.5 h-3.5 text-brand-400" title="Admin" />;
      case 'editor':
        return <Shield className="w-3.5 h-3.5 text-emerald-400" title="Editor" />;
      case 'viewer':
      default:
        return <Eye className="w-3.5 h-3.5 text-dark-400" title="Viewer (Read-Only)" />;
    }
  };

  const handleRoleChange = async (memberUserId, newRole) => {
    if (!project?._id || !canManage) return;

    try {
      const res = await api.updateMemberRole(project._id, memberUserId, newRole);
      if (res.success && res.members) {
        setMembers(res.members);
      }
    } catch (err) {
      alert(`Failed to update role: ${err.message}`);
    }
  };

  const handleRemoveMember = async (memberUserId, memberName) => {
    if (!project?._id || !canManage) return;
    if (!confirm(`Remove ${memberName} from this project?`)) return;

    try {
      const res = await api.removeMember(project._id, memberUserId);
      if (res.success && res.members) {
        setMembers(res.members);
      }
    } catch (err) {
      alert(`Failed to remove member: ${err.message}`);
    }
  };

  return (
    <div className="h-full flex flex-col bg-dark-850 select-none">
      {/* Header */}
      <div className="p-3 border-b border-dark-700 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-brand-400" />
          <span className="text-xs font-bold text-dark-100 uppercase tracking-wider">
            Project Members ({members.length})
          </span>
        </div>

        {canManage && onOpenInvite && (
          <button
            onClick={onOpenInvite}
            className="flex items-center space-x-1 text-xs px-2.5 py-1 rounded-md bg-brand-600 hover:bg-brand-500 text-white transition-colors shadow-sm"
          >
            <UserPlus className="w-3 h-3" />
            <span>Invite</span>
          </button>
        )}
      </div>

      {/* Members List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {members.map((m, i) => {
          const memberUser = m.user || {};
          const isOnline = presenceList.some((p) => p.userId === memberUser._id);
          const isMe = memberUser._id === currentUser?._id;
          const isOwnerMember = m.role === 'owner';

          return (
            <div
              key={memberUser._id || i}
              className="p-2.5 rounded-xl bg-dark-800 border border-dark-700/80 hover:border-dark-600 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="relative shrink-0">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm"
                    style={{ backgroundColor: memberUser.color || '#3b82f6' }}
                  >
                    {memberUser.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-dark-800 ${
                      isOnline ? 'bg-emerald-500' : 'bg-dark-500'
                    }`}
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center space-x-1.5 truncate">
                    <span className="text-xs font-semibold text-dark-100 truncate">
                      {memberUser.name} {isMe && '(You)'}
                    </span>
                  </div>
                  <p className="text-[10px] text-dark-400 truncate">
                    {memberUser.title || memberUser.email}
                  </p>
                </div>
              </div>

              {/* Role & Actions */}
              <div className="flex items-center space-x-1.5 shrink-0">
                {canManage && !isOwnerMember && !isMe ? (
                  <select
                    value={m.role}
                    onChange={(e) => handleRoleChange(memberUser._id, e.target.value)}
                    className="bg-dark-750 border border-dark-600 rounded px-1.5 py-0.5 text-[11px] text-dark-200 outline-none cursor-pointer"
                  >
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                  </select>
                ) : (
                  <div className="flex items-center space-x-1 text-[11px] font-medium text-dark-300 capitalize px-2 py-0.5 rounded bg-dark-750 border border-dark-700">
                    {getRoleIcon(m.role)}
                    <span>{m.role}</span>
                  </div>
                )}

                {canManage && !isOwnerMember && !isMe && (
                  <button
                    onClick={() => handleRemoveMember(memberUser._id, memberUser.name)}
                    className="p-1 text-dark-400 hover:text-rose-400 rounded hover:bg-dark-700"
                    title="Remove member"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
