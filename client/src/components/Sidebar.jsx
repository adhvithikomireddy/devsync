import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Bell,
  User,
  Settings,
  LogOut,
  PlusCircle,
  Sparkles,
} from 'lucide-react';

export default function Sidebar({ onOpenCreateProject }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/notifications', label: 'Notifications & Requests', icon: Bell },
    { to: '/profile', label: 'Profile & Settings', icon: User },
  ];

  return (
    <aside className="w-64 bg-dark-900 border-r border-white/[0.06] flex flex-col justify-between select-none h-[calc(100vh-3.5rem)] sticky top-14">
      <div className="p-3.5 space-y-4">
        {/* Quick Action Button */}
        {onOpenCreateProject && (
          <button
            onClick={onOpenCreateProject}
            className="btn-primary w-full py-2 px-3 flex items-center justify-center space-x-2 text-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create New Project</span>
          </button>
        )}

        {/* Navigation Links */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold text-dark-500 uppercase tracking-wider mb-2">
            Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20 shadow-sm'
                      : 'text-dark-300 hover:text-white hover:bg-dark-800'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Pro / AI Workspace Banner */}
        <div className="glass-panel p-3.5 rounded-2xl space-y-2">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-brand-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Live Workspace Engine</span>
          </div>
          <p className="text-[11px] text-dark-400 leading-relaxed font-normal">
            Real-time multi-cursor sync, WebRTC audio/video meetings, and cloud compilers active.
          </p>
        </div>
      </div>

      {/* User Info & Logout footer */}
      <div className="p-3 border-t border-white/[0.06] space-y-2">
        <div className="flex items-center space-x-2.5 px-2 py-1">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0"
            style={{ backgroundColor: user?.color || '#3b82f6' }}
          >
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="truncate flex-1">
            <p className="text-xs font-bold text-white truncate">{user?.name}</p>
            <p className="text-[10px] text-dark-400 truncate">{user?.title || user?.email}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
