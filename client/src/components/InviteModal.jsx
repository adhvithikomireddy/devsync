import React, { useState } from 'react';
import { api } from '../services/api';
import { useProject } from '../context/ProjectContext';
import {
  UserPlus,
  X,
  Mail,
  Shield,
  CheckCircle,
} from 'lucide-react';

export default function InviteModal({ onClose, onMemberInvited }) {
  const { project } = useProject();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !project?._id) return;

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await api.inviteMember(project._id, {
        email: email.trim(),
        role,
      });

      if (res.success) {
        setSuccessMsg(res.message || 'Invitation sent successfully!');
        if (onMemberInvited) onMemberInvited();
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError(res.message || 'Failed to send invitation');
      }
    } catch (err) {
      setError(err.message || 'Server error sending invitation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-dark-850 border border-dark-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-dark-700 flex items-center justify-between bg-dark-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-dark-100">Invite Collaborator</h3>
              <p className="text-[11px] text-dark-400">Add a developer to {project?.name}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-dark-400 hover:text-dark-100 hover:bg-dark-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-900/50 text-xs text-rose-400">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-900/50 text-xs text-emerald-400 flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-dark-200">Developer Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-dark-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                autoFocus
                placeholder="colleague@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-dark-900 border border-dark-700 focus:border-brand-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none"
              />
            </div>
          </div>

          {/* Role */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-dark-200">Role & Permissions</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-dark-900 border border-dark-700 focus:border-brand-500 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
            >
              <option value="editor">Editor — Can edit files, execute code & chat</option>
              <option value="admin">Admin — Can manage members & project settings</option>
              <option value="viewer">Viewer — Read-only code access & chat</option>
            </select>
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-dark-750 hover:bg-dark-700 text-dark-200 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !!successMsg}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all"
            >
              {loading ? 'Sending Invitation...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
