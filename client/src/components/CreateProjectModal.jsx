import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  FolderPlus,
  X,
  Code2,
  Lock,
  Globe,
  Check,
} from 'lucide-react';

const TEMPLATES = [
  { id: 'html', name: 'HTML / CSS / JS', desc: 'Frontend Web with Live Preview' },
  { id: 'javascript', name: 'JavaScript', desc: 'Node / JS Vanilla starter' },
  { id: 'react', name: 'React', desc: 'Vite React JSX project' },
  { id: 'nodejs', name: 'Node.js', desc: 'Backend HTTP microservice' },
  { id: 'python', name: 'Python', desc: 'Python 3 application & math suite' },
  { id: 'java', name: 'Java', desc: 'Java class with Main entry' },
  { id: 'c', name: 'C Language', desc: 'Standard C gcc sandbox' },
  { id: 'cpp', name: 'C++', desc: 'Modern C++ with STL vectors' },
];

export default function CreateProjectModal({ onClose, onCreated }) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState('private');
  const [template, setTemplate] = useState('javascript');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a project name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.createProject({
        name: name.trim(),
        description: description.trim(),
        visibility,
        template,
      });

      if (res.success && res.project) {
        if (onCreated) onCreated(res.project);
        onClose();
        navigate(`/project/${res.project._id}`);
      } else {
        setError(res.message || 'Failed to create project');
      }
    } catch (err) {
      setError(err.message || 'Server error creating project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-dark-850 border border-dark-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-dark-700 flex items-center justify-between bg-dark-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600/20 border border-brand-500/30 flex items-center justify-center">
              <FolderPlus className="w-4 h-4 text-brand-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-dark-100">Create New Project</h3>
              <p className="text-[11px] text-dark-400">Initialize a collaborative engineering workspace</p>
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

          {/* Project Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-dark-200">
              Project Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. auth-service or cloud-dashboard"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-dark-900 border border-dark-700 focus:border-brand-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-dark-200">Description</label>
            <textarea
              rows={2}
              placeholder="Brief summary of what your team will build..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-dark-900 border border-dark-700 focus:border-brand-500 rounded-xl px-3 py-2 text-xs text-white outline-none resize-none"
            />
          </div>

          {/* Template Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-dark-200">Environment Template</label>
            <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
              {TEMPLATES.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                    template === t.id
                      ? 'bg-brand-600/15 border-brand-500 text-brand-400'
                      : 'bg-dark-900 border-dark-750 text-dark-300 hover:border-dark-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{t.name}</span>
                    {template === t.id && <Check className="w-3.5 h-3.5 text-brand-400" />}
                  </div>
                  <p className="text-[10px] text-dark-400 mt-0.5">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Visibility */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-dark-200">Visibility</label>
            <div className="flex space-x-3">
              <label
                onClick={() => setVisibility('private')}
                className={`flex-1 flex items-center space-x-2 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                  visibility === 'private'
                    ? 'bg-brand-600/10 border-brand-500 text-brand-400'
                    : 'bg-dark-900 border-dark-750 text-dark-400'
                }`}
              >
                <Lock className="w-4 h-4" />
                <div>
                  <p className="text-xs font-semibold text-white">Private</p>
                  <p className="text-[10px]">Only invited members</p>
                </div>
              </label>

              <label
                onClick={() => setVisibility('public')}
                className={`flex-1 flex items-center space-x-2 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                  visibility === 'public'
                    ? 'bg-brand-600/10 border-brand-500 text-brand-400'
                    : 'bg-dark-900 border-dark-750 text-dark-400'
                }`}
              >
                <Globe className="w-4 h-4" />
                <div>
                  <p className="text-xs font-semibold text-white">Public</p>
                  <p className="text-[10px]">Anyone can view</p>
                </div>
              </label>
            </div>
          </div>

          {/* Submit Button */}
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
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-500/20 disabled:opacity-50 transition-all"
            >
              {loading ? 'Creating Workspace...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
