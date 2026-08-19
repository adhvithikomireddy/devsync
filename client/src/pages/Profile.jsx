import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { formatDate } from '../utils/formatters';
import {
  User,
  Mail,
  Briefcase,
  Activity,
  Palette,
  CheckCircle,
  Save,
  Check,
} from 'lucide-react';

const COLOR_PALETTE = [
  '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b',
  '#ec4899', '#06b6d4', '#14b8a6', '#f97316'
];

export default function Profile() {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [title, setTitle] = useState(user?.title || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [status, setStatus] = useState(user?.status || 'online');
  const [currentTask, setCurrentTask] = useState(user?.currentTask || '');
  const [taskStatus, setTaskStatus] = useState(user?.taskStatus || 'In Progress');
  const [color, setColor] = useState(user?.color || '#3b82f6');
  const [loading, setLoading] = useState(false);
  const [savedMsg, setSavedMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSavedMsg(null);

    const res = await updateProfile({
      name,
      title,
      bio,
      status,
      currentTask,
      taskStatus,
      color,
    });

    if (res.success) {
      setSavedMsg('Profile updated successfully!');
      setTimeout(() => setSavedMsg(null), 3000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-dark-900 text-dark-100 flex flex-col select-none">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-10 max-w-4xl mx-auto w-full space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Developer Profile & Presence</h1>
            <p className="text-xs text-dark-400">Manage your collaborator identity, status, and cursor color.</p>
          </div>

          {savedMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-900/50 text-xs text-emerald-400 flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{savedMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-dark-850 border border-dark-700/80 rounded-2xl p-6 shadow-xl space-y-6">
            {/* Avatar & Identity Preview */}
            <div className="flex items-center space-x-4 pb-6 border-b border-dark-700">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg"
                style={{ backgroundColor: color }}
              >
                {name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">{name || 'Your Name'}</h3>
                <p className="text-xs text-dark-400">{user?.email}</p>
                <div className="flex items-center space-x-2 text-[11px] text-dark-500">
                  <span>Joined {formatDate(user?.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-dark-200">Display Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-dark-900 border border-dark-700 focus:border-brand-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-dark-200">Role / Job Title</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Backend Engineer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-dark-900 border border-dark-700 focus:border-brand-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-dark-200">Availability Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-dark-900 border border-dark-700 focus:border-brand-500 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
                >
                  <option value="online">🟢 Online</option>
                  <option value="away">🟡 Away</option>
                  <option value="dnd">🔴 Do Not Disturb</option>
                  <option value="offline">⚪ Offline</option>
                </select>
              </div>

              {/* Task Status */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-dark-200">Task Status</label>
                <select
                  value={taskStatus}
                  onChange={(e) => setTaskStatus(e.target.value)}
                  className="w-full bg-dark-900 border border-dark-700 focus:border-brand-500 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
                >
                  <option value="In Progress">In Progress</option>
                  <option value="Testing">Testing</option>
                  <option value="Review">Code Review</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Current Working Task */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-dark-200">
                Currently Working On (Displayed to teammates)
              </label>
              <input
                type="text"
                placeholder="e.g. Refactoring auth middleware & JWT validation"
                value={currentTask}
                onChange={(e) => setCurrentTask(e.target.value)}
                className="w-full bg-dark-900 border border-dark-700 focus:border-brand-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>

            {/* Bio */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-dark-200">Bio</label>
              <textarea
                rows={2}
                placeholder="A few words about what you love building..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-dark-900 border border-dark-700 focus:border-brand-500 rounded-xl px-3 py-2 text-xs text-white outline-none resize-none"
              />
            </div>

            {/* Cursor Color Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-dark-200">
                Collaborative Cursor & Presence Color
              </label>
              <div className="flex items-center space-x-3">
                {COLOR_PALETTE.map((c) => (
                  <div
                    key={c}
                    onClick={() => setColor(c)}
                    className="w-8 h-8 rounded-full cursor-pointer flex items-center justify-center transition-transform hover:scale-110 shadow-md"
                    style={{ backgroundColor: c }}
                  >
                    {color === c && <Check className="w-4 h-4 text-white" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-dark-700 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-500/20 disabled:opacity-50 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Saving Changes...' : 'Save Profile'}</span>
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
