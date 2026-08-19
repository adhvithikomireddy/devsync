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
} from 'lucide-react';

export default function Navbar({ onOpenCreateProject, currentProject = null, onStartMeeting = null }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { isConnected, presenceList } = useSocket();
  const navigate = useNavigate();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="h-14 bg-dark-850 border-b border-dark-700 px-4 flex items-center justify-between select-none z-30 sticky top-0">
      {/* Brand & Logo */}
      <div className="flex items-center space-x-3">
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center space-x-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-accent-cyan flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-dark-100 to-dark-300 bg-clip-text text-transparent">
            DevSync
          </span>
        </Link>

        {currentProject && (
          <div className="hidden md:flex items-center space-x-2 pl-3 border-l border-dark-700">
            <Folder className="w-4 h-4 text-brand-500" />
            <span className="text-sm font-medium text-dark-100">{currentProject.name}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-dark-750 text-dark-400 border border-dark-700 uppercase tracking-wider">
              {currentProject.template}
            </span>
          </div>
        )}
      </div>

      {/* Center Collaboration Presence Indicator */}
      {currentProject && (
        <div className="hidden lg:flex items-center space-x-3 bg-dark-800 border border-dark-700/80 px-3 py-1 rounded-full">
          <div className="flex items-center space-x-1.5">
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isConnected ? 'bg-emerald-400' : 'bg-rose-400'
                }`}
              ></span>
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isConnected ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              ></span>
            </span>
            <span className="text-xs font-medium text-dark-300">
              {isConnected ? 'Real-time Sync' : 'Reconnecting...'}
            </span>
          </div>

          <div className="h-3 w-px bg-dark-700" />

          {/* Active Collaborators Avatars */}
          <div className="flex items-center -space-x-1.5 overflow-hidden">
            {presenceList.slice(0, 5).map((p, i) => (
              <div
                key={p.socketId || i}
                title={`${p.name} (${p.activeFile?.fileName ? `Editing ${p.activeFile.fileName}` : 'Online'})`}
                className="relative group/avatar"
              >
                <div
                  className="w-6 h-6 rounded-full border-2 border-dark-850 flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                  style={{ backgroundColor: p.color || '#3b82f6' }}
                >
                  {p.name.charAt(0).toUpperCase()}
                </div>
              </div>
            ))}
            {presenceList.length > 5 && (
              <div className="w-6 h-6 rounded-full bg-dark-700 border-2 border-dark-850 flex items-center justify-center text-[10px] text-dark-300 font-semibold">
                +{presenceList.length - 5}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Right Navigation & Profile */}
      <div className="flex items-center space-x-3">
        {isAuthenticated ? (
          <>
            {/* Quick Meeting Button in Workspace */}
            {currentProject && onStartMeeting && (
              <button
                onClick={onStartMeeting}
                className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 transition-colors shadow-sm"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Meeting</span>
              </button>
            )}

            {onOpenCreateProject && (
              <button
                onClick={onOpenCreateProject}
                className="hidden sm:flex items-center space-x-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white transition-colors shadow-sm shadow-brand-500/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Project</span>
              </button>
            )}

            <Link
              to="/notifications"
              className="p-2 rounded-lg text-dark-400 hover:text-dark-100 hover:bg-dark-800 transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
            </Link>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen((prev) => !prev)}
                className="flex items-center space-x-2 p-1 rounded-lg hover:bg-dark-800 transition-colors"
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm"
                  style={{ backgroundColor: user?.color || '#3b82f6' }}
                >
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              </button>

              {profileDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-dark-800 border border-dark-700 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseLeave={() => setProfileDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-dark-700">
                    <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                    <p className="text-xs text-dark-400 truncate">{user?.email}</p>
                    <div className="mt-1.5 flex items-center space-x-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-[11px] text-dark-300 font-medium capitalize">
                        {user?.status || 'Online'}
                      </span>
                    </div>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center space-x-2.5 px-4 py-2 text-xs text-dark-200 hover:bg-dark-750 hover:text-white transition-colors"
                  >
                    <User className="w-4 h-4 text-dark-400" />
                    <span>Profile & Status</span>
                  </Link>

                  <Link
                    to="/dashboard"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center space-x-2.5 px-4 py-2 text-xs text-dark-200 hover:bg-dark-750 hover:text-white transition-colors"
                  >
                    <Folder className="w-4 h-4 text-dark-400" />
                    <span>Dashboard</span>
                  </Link>

                  <div className="border-t border-dark-700 my-1" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center space-x-2">
            <Link
              to="/login"
              className="text-xs font-medium px-3.5 py-1.5 rounded-lg text-dark-200 hover:text-white hover:bg-dark-800 transition-colors"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="text-xs font-medium px-3.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white transition-colors shadow-sm shadow-brand-500/20"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
