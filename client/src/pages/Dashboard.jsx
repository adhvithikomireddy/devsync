import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ProjectCard from '../components/ProjectCard';
import CreateProjectModal from '../components/CreateProjectModal';
import {
  Folder,
  Users,
  Plus,
  Search,
  Sparkles,
  Layers,
  Radio,
  CheckCircle2,
  FolderPlus,
  X,
  UserPlus,
  ArrowRight,
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    ownedProjects: 0,
    sharedProjects: 0,
    activeCollaborations: 0,
  });
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'owned' | 'shared'
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [projRes, statsRes, inviteRes] = await Promise.all([
        api.getProjects(),
        api.getDashboardStats(),
        api.getMyInvitations(),
      ]);

      if (projRes.success && projRes.projects) {
        setProjects(projRes.projects);
      }

      if (statsRes.success && statsRes.stats) {
        setStats(statsRes.stats);
      }

      if (inviteRes.success && inviteRes.invitations) {
        setInvitations(inviteRes.invitations);
      }
    } catch (err) {
      console.warn('[Dashboard] Error fetching data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Filter projects by tab & search query
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const ownerId = p.owner?._id || p.owner;
      const currentUserId = user?._id;
      const isOwner = ownerId && currentUserId && ownerId.toString() === currentUserId.toString();

      if (filterTab === 'owned' && !isOwner) return false;
      if (filterTab === 'shared' && isOwner) return false;

      if (searchQuery && searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const name = (p.name || '').toLowerCase();
        const desc = (p.description || '').toLowerCase();
        const template = (p.template || '').toLowerCase();
        const ownerName = (p.owner?.name || '').toLowerCase();

        return (
          name.includes(query) ||
          desc.includes(query) ||
          template.includes(query) ||
          ownerName.includes(query)
        );
      }
      return true;
    });
  }, [projects, filterTab, searchQuery, user]);

  return (
    <div className="min-h-screen bg-dark-900 text-dark-100 flex flex-col select-none">
      <Navbar onOpenCreateProject={() => setShowCreateModal(true)} />

      <div className="flex-1 flex">
        <Sidebar onOpenCreateProject={() => setShowCreateModal(true)} />

        {/* Main Content Area */}
        <main className="flex-1 p-6 lg:p-8 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {/* Pending Invitations Banner */}
          {invitations.length > 0 && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-dark-800 to-dark-850 border border-emerald-500/40 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    You have {invitations.length} pending project {invitations.length === 1 ? 'invitation' : 'invitations'}!
                  </h4>
                  <p className="text-[11px] text-dark-300">
                    Collaborators have invited you to join their engineering workspaces.
                  </p>
                </div>
              </div>

              <Link
                to="/notifications"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all flex items-center space-x-1.5 self-start sm:self-auto"
              >
                <span>Review & Accept</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Welcome Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Welcome back, {user?.name || 'Engineer'}
              </h1>
              <p className="text-xs text-dark-400">
                Here is the latest status across your real-time engineering workspaces.
              </p>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-600 text-white text-xs font-bold shadow-lg shadow-brand-500/20 active:scale-95 transition-all self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Project</span>
            </button>
          </div>

          {/* Statistics Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Projects"
              value={stats.totalProjects}
              icon={<Folder className="w-5 h-5 text-brand-400" />}
              badge="Workspaces"
            />
            <StatCard
              title="Owned Projects"
              value={stats.ownedProjects}
              icon={<Layers className="w-5 h-5 text-emerald-400" />}
              badge="Owner"
            />
            <StatCard
              title="Shared With Me"
              value={stats.sharedProjects}
              icon={<Users className="w-5 h-5 text-purple-400" />}
              badge="Collaborator"
            />
            <StatCard
              title="Active Collaborations"
              value={stats.activeCollaborations}
              icon={<Radio className="w-5 h-5 text-amber-400" />}
              badge="Team"
            />
          </div>

          {/* Projects Explorer Controls */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Filter Tabs */}
              <div className="flex items-center space-x-1 bg-dark-850 p-1 rounded-xl border border-dark-700/80 self-start">
                <button
                  onClick={() => setFilterTab('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    filterTab === 'all'
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-dark-400 hover:text-dark-200'
                  }`}
                >
                  All Projects ({projects.length})
                </button>
                <button
                  onClick={() => setFilterTab('owned')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    filterTab === 'owned'
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-dark-400 hover:text-dark-200'
                  }`}
                >
                  My Projects ({stats.ownedProjects})
                </button>
                <button
                  onClick={() => setFilterTab('shared')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    filterTab === 'shared'
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-dark-400 hover:text-dark-200'
                  }`}
                >
                  Shared ({stats.sharedProjects})
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-dark-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search projects by name, template..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-dark-850 border border-dark-700/80 focus:border-brand-500 rounded-xl pl-9 pr-8 py-2 text-xs text-white outline-none placeholder:text-dark-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-dark-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Projects Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-44 rounded-2xl bg-dark-850 border border-dark-700 animate-pulse"
                  />
                ))}
              </div>
            ) : filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredProjects.map((proj) => (
                  <ProjectCard
                    key={proj._id}
                    project={proj}
                    currentUserId={user?._id}
                  />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center rounded-2xl bg-dark-850/50 border border-dashed border-dark-700 space-y-3">
                <FolderPlus className="w-10 h-10 text-dark-500 mx-auto" />
                <h3 className="text-sm font-semibold text-dark-200">No projects found</h3>
                <p className="text-xs text-dark-400 max-w-sm mx-auto">
                  {searchQuery
                    ? `No projects matched "${searchQuery}". Try a different name or clear the search.`
                    : 'Get started by creating your first collaborative workspace.'}
                </p>
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-4 py-2 rounded-xl bg-dark-750 hover:bg-dark-700 text-white text-xs font-semibold border border-dark-650 transition-all"
                  >
                    Clear Search
                  </button>
                ) : (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md transition-all"
                  >
                    Create Project
                  </button>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onCreated={(newProj) => {
            setProjects((prev) => [newProj, ...prev]);
            setStats((prev) => ({
              ...prev,
              totalProjects: prev.totalProjects + 1,
              ownedProjects: prev.ownedProjects + 1,
            }));
          }}
        />
      )}
    </div>
  );
}

function StatCard({ title, value, icon, badge }) {
  return (
    <div className="p-4 rounded-2xl bg-dark-850 border border-dark-700/80 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-dark-400">{title}</span>
        <div className="p-1.5 rounded-lg bg-dark-800 border border-dark-700">{icon}</div>
      </div>
      <div className="flex items-baseline space-x-2">
        <span className="text-2xl font-extrabold text-white font-mono">{value}</span>
        <span className="text-[10px] text-dark-500">{badge}</span>
      </div>
    </div>
  );
}
