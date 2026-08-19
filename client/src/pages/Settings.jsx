import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import {
  Settings as SettingsIcon,
  Trash2,
  Save,
  AlertTriangle,
  CheckCircle,
  Lock,
  Globe,
} from 'lucide-react';

export default function Settings() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState('private');
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('viewer');
  const [savedMsg, setSavedMsg] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      if (!projectId) return;
      try {
        const res = await api.getProjectById(projectId);
        if (res.success && res.project) {
          setProject(res.project);
          setName(res.project.name);
          setDescription(res.project.description || '');
          setVisibility(res.project.visibility || 'private');
          setUserRole(res.userRole || 'viewer');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [projectId]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const res = await api.updateProject(projectId, {
        name: name.trim(),
        description: description.trim(),
        visibility,
      });

      if (res.success) {
        setSavedMsg('Project settings updated successfully!');
        setTimeout(() => setSavedMsg(null), 3000);
      }
    } catch (err) {
      alert(`Error updating project: ${err.message}`);
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm(`Are you absolutely sure you want to permanently delete "${project?.name}"? All files, changes, and history will be wiped.`)) {
      return;
    }

    try {
      const res = await api.deleteProject(projectId);
      if (res.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      alert(`Error deleting project: ${err.message}`);
    }
  };

  const isOwner = userRole === 'owner';

  return (
    <div className="min-h-screen bg-dark-900 text-dark-100 flex flex-col select-none">
      <Navbar currentProject={project} />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-10 max-w-4xl mx-auto w-full space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Project Settings</h1>
            <p className="text-xs text-dark-400">Configure workspace parameters and ownership permissions.</p>
          </div>

          {savedMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-900/50 text-xs text-emerald-400 flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{savedMsg}</span>
            </div>
          )}

          {/* General Settings */}
          <form onSubmit={handleSave} className="bg-dark-850 border border-dark-700/80 rounded-2xl p-6 shadow-xl space-y-5">
            <h3 className="text-sm font-bold text-white border-b border-dark-700 pb-3">General Settings</h3>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-dark-200">Project Name</label>
              <input
                type="text"
                required
                disabled={!isOwner}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-dark-900 border border-dark-700 focus:border-brand-500 rounded-xl px-3 py-2 text-xs text-white outline-none disabled:opacity-60"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-dark-200">Description</label>
              <textarea
                rows={3}
                disabled={!isOwner}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-dark-900 border border-dark-700 focus:border-brand-500 rounded-xl px-3 py-2 text-xs text-white outline-none resize-none disabled:opacity-60"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-dark-200">Visibility</label>
              <select
                value={visibility}
                disabled={!isOwner}
                onChange={(e) => setVisibility(e.target.value)}
                className="w-full bg-dark-900 border border-dark-700 focus:border-brand-500 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer disabled:opacity-60"
              >
                <option value="private">Private (Only invited collaborators)</option>
                <option value="public">Public (Anyone with link can view)</option>
              </select>
            </div>

            {isOwner && (
              <div className="pt-3 border-t border-dark-700 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            )}
          </form>

          {/* Danger Zone */}
          {isOwner && (
            <div className="bg-rose-950/20 border border-rose-900/50 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center space-x-2 text-rose-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-sm font-bold">Danger Zone</h3>
              </div>

              <p className="text-xs text-dark-300">
                Permanently delete this project and all of its files, version history, chat logs, and active meetings. This action cannot be undone.
              </p>

              <button
                onClick={handleDeleteProject}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Project Workspace</span>
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
