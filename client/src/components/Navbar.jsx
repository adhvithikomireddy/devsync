import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
  Code2,
  Bell,
  User,
  LogOut,
  Settings,
  Plus,
  Video,
  Radio,
  Folder,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

export default function Navbar({ onOpenCreateProject, currentProject = null, onStartMeeting = null }) {
  const { user, logout } = useAuth();
  const { isConnected, onlineUsers } = useSocket();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-14 bg-dark-900/90 backdrop-blur-md border-b border-white/[0.06] px-4 flex items-center justify-between z-30 sticky top-0 select-none">
      {/* Brand & Active Project Header */}
      <div className="flex items-center space-x-4">
        <Link to="/dashboard" className="flex items-center space-x-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-accent-cyan flex items-center justify-center shadow-md shadow-brand-500/20 border border-white/20 group-hover:scale-105 transition-transform">
            <Code2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm text-white tracking-tight hidden sm:inline-block">
            DevSync
          </span>
        </Link>

        {currentProject && (
          <div className="hidden md:flex items-center space-x-2.5 pl-3 border-l border-white/[0.08]">
            <Folder className="w-3.5 h-3.5 text-brand-400" />
            <span className="text-xs font-semibold text-white truncate max-w-[200px]">
              {currentProject.name}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-dark-800 text-dark-300 border border-white/[0.08] font-mono uppercase">
              {currentProject.template}
            </span>
          </div>
        )}
      </div>

      {/* Center Actions (Meeting / Collaboration) */}
      <div className="flex items-center space-x-3">
        {currentProject && onStartMeeting && (
          <button
            onClick={onStartMeeting}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold shadow-sm transition-all active:scale-95"
          >
            <Video className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Join Meeting</span>
          </button>
        )}

        {/* Real-time Status Indicator */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-dark-850 border border-white/[0.08] text-[11px]">
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
            }`}
          />
          <span className="text-dark-400 font-medium hidden sm:inline">
            {isConnected ? 'Sync Active' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3">
        {onOpenCreateProject && (
          <button
            onClick={onOpenCreateProject}
            className="btn-primary py-1.5 px-3 flex items-center space-x-1.5 text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Project</span>
          </button>
        )}

        {/* Notifications Icon */}
        <Link
          to="/notifications"
          className="p-2 rounded-xl text-dark-400 hover:text-white hover:bg-dark-800 border border-transparent hover:border-white/[0.06] transition-colors relative"
          title="Notifications & Invitations"
        >
          <Bell className="w-4 h-4" />
        </Link>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-dark-800 border border-transparent hover:border-white/[0.06] transition-colors"
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-sm"
              style={{ backgroundColor: user?.color || '#3b82f6' }}
            >
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <ChevronDown className="w-3 h-3 text-dark-400 hidden sm:block" />
          </button>

          {/* Profile Dropdown */}
          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-dark-900 border border-white/[0.1] shadow-glass-lg py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2.5 border-b border-white/[0.06]">
                <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-dark-400 truncate">{user?.email}</p>
              </div>

              <Link
                to="/dashboard"
                onClick={() => setProfileDropdownOpen(false)}
                className="flex items-center space-x-2.5 px-4 py-2 text-xs text-dark-300 hover:bg-dark-800 hover:text-white transition-colors"
              >
                <Folder className="w-3.5 h-3.5 text-dark-400" />
                <span>Dashboard</span>
              </Link>

              <Link
                to="/profile"
                onClick={() => setProfileDropdownOpen(false)}
                className="flex items-center space-x-2.5 px-4 py-2 text-xs text-dark-300 hover:bg-dark-800 hover:text-white transition-colors"
              >
                <User className="w-3.5 h-3.5 text-dark-400" />
                <span>My Profile</span>
              </Link>

              <Link
                to="/notifications"
                onClick={() => setProfileDropdownOpen(false)}
                className="flex items-center space-x-2.5 px-4 py-2 text-xs text-dark-300 hover:bg-dark-800 hover:text-white transition-colors"
              >
                <Bell className="w-3.5 h-3.5 text-dark-400" />
                <span>Notifications</span>
              </Link>

              <div className="border-t border-white/[0.06] my-1" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
