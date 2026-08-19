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
  TrendingUp,
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
    <div className="min-h-screen bg-dark-950 text-dark-200 flex flex-col select-none relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="ambient-glow bg-brand-600/10 top-0 right-10" />
      <div className="ambient-glow bg-accent-purple/10 bottom-10 left-10" />

      <Navbar onOpenCreateProject={() => setShowCreateModal(true)} />

      <div className="flex-1 flex relative z-10">
        <Sidebar onOpenCreateProject={() => setShowCreateModal(true)} />

        {/* Main Content Area */}
        <main className="flex-1 p-6 lg:p-8 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {/* Pending Invitations Banner */}
          {invitations.length > 0 && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/30 via-dark-850 to-dark-900 border border-emerald-500/40 shadow-glass-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    You have {invitations.length} pending project {invitations.length === 1 ? 'invitation' : 'invitations'}!
                  </h4>
                  <p className="text-[11px] text-dark-400">
                    Collaborators have invited you to join their engineering workspaces.
                  </p>
                </div>
              </div>

              <Link
                to="/notifications"
                className="btn-primary py-2 px-4 bg-emerald-600 hover:bg-emerald-500 flex items-center space-x-1.5 self-start sm:self-auto text-xs"
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
                Here is the real-time activity and status across your engineering workspaces.
              </p>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center space-x-2 self-start sm:self-auto"
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
              icon={<Folder className="w-4 h-4 text-brand-400" />}
              badge="Workspaces"
            />
            <StatCard
              title="Owned Projects"
              value={stats.ownedProjects}
              icon={<Layers className="w-4 h-4 text-emerald-400" />}
              badge="Owner"
            />
            <StatCard
              title="Shared With Me"
              value={stats.sharedProjects}
              icon={<Users className="w-4 h-4 text-purple-400" />}
              badge="Collaborator"
            />
            <StatCard
              title="Active Collaborations"
              value={stats.activeCollaborations}
              icon={<Radio className="w-4 h-4 text-amber-400" />}
              badge="Live Mesh"
            />
          </div>

          {/* Projects Explorer Controls */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Filter Tabs */}
              <div className="flex items-center space-x-1 bg-dark-900 p-1 rounded-xl border border-white/[0.06] self-start">
                <button
                  onClick={() => setFilterTab('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filterTab === 'all'
                      ? 'bg-dark-800 text-white border border-white/[0.08] shadow-sm'
                      : 'text-dark-400 hover:text-white'
                  }`}
                >
                  All Projects ({projects.length})
                </button>
                <button
                  onClick={() => setFilterTab('owned')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filterTab === 'owned'
                      ? 'bg-dark-800 text-white border border-white/[0.08] shadow-sm'
                      : 'text-dark-400 hover:text-white'
                  }`}
                >
                  My Projects ({stats.ownedProjects})
                </button>
                <button
                  onClick={() => setFilterTab('shared')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filterTab === 'shared'
                      ? 'bg-dark-800 text-white border border-white/[0.08] shadow-sm'
                      : 'text-dark-400 hover:text-white'
                  }`}
                >
                  Shared ({stats.sharedProjects})
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-dark-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search projects by name, template..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-dark-900 border border-white/[0.08] focus:border-brand-500 rounded-xl pl-9 pr-8 py-2 text-xs text-white outline-none placeholder:text-dark-500 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-dark-500 hover:text-white"
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
                    className="h-44 rounded-2xl bg-dark-900 border border-white/[0.06] animate-pulse"
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
              <div className="py-16 text-center rounded-2xl glass-panel space-y-3">
                <FolderPlus className="w-9 h-9 text-dark-500 mx-auto" />
                <h3 className="text-sm font-bold text-white">No projects found</h3>
                <p className="text-xs text-dark-400 max-w-sm mx-auto">
                  {searchQuery
                    ? `No projects matched "${searchQuery}". Try a different name or clear the search.`
                    : 'Get started by creating your first collaborative workspace.'}
                </p>
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="btn-secondary text-xs"
                  >
                    Clear Search
                  </button>
                ) : (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn-primary text-xs"
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
    <div className="glass-panel p-4 rounded-2xl space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-dark-400">{title}</span>
        <div className="p-1.5 rounded-lg bg-dark-800 border border-white/[0.06]">{icon}</div>
      </div>
      <div className="flex items-baseline space-x-2">
        <span className="text-2xl font-extrabold text-white font-mono">{value}</span>
        <span className="text-[10px] text-dark-500 font-semibold uppercase">{badge}</span>
      </div>
    </div>
  );
}
