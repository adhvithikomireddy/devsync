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
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <aside className="w-60 bg-dark-850 border-r border-dark-700 flex flex-col justify-between select-none h-[calc(100vh-3.5rem)] sticky top-14">
      <div className="p-3 space-y-4">
        {/* Quick Action Button */}
        {onOpenCreateProject && (
          <button
            onClick={onOpenCreateProject}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-600 text-white text-xs font-semibold shadow-lg shadow-brand-500/20 transition-all active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Project</span>
          </button>
        )}

        {/* Navigation Links */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-semibold text-dark-400 uppercase tracking-wider mb-2">
            Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-600/10 text-brand-500 border border-brand-500/20'
                      : 'text-dark-300 hover:text-dark-100 hover:bg-dark-800'
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
        <div className="p-3 rounded-xl bg-dark-800 border border-dark-700 space-y-2">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-brand-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>DevSync Workspace</span>
          </div>
          <p className="text-[11px] text-dark-400 leading-relaxed">
            Real-time CRDT sync, Monaco editing, WebRTC video & isolated sandbox runner active.
          </p>
        </div>
      </div>

      {/* User Info & Logout footer */}
      <div className="p-3 border-t border-dark-700 space-y-2">
        <div className="flex items-center space-x-3 px-2 py-1.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0"
            style={{ backgroundColor: user?.color || '#3b82f6' }}
          >
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="truncate flex-1">
            <p className="text-xs font-semibold text-dark-100 truncate">{user?.name}</p>
            <p className="text-[10px] text-dark-400 truncate">{user?.title || user?.email}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
