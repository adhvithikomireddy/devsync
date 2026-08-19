import React from 'react';
import { Link } from 'react-router-dom';
import { timeAgo } from '../utils/formatters';
import {
  Folder,
  Users,
  Clock,
  ArrowRight,
  Shield,
  Radio,
  Lock,
  Globe,
} from 'lucide-react';

export default function ProjectCard({ project, currentUserId }) {
  const isOwner = project.owner?._id === currentUserId || project.owner === currentUserId;
  const memberCount = project.members?.length || 1;
  const hasActiveMeeting = !!project.activeMeeting;

  // Language badges
  const getBadgeColor = (template) => {
    switch (template) {
      case 'javascript':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'react':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'nodejs':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'python':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'java':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'c':
      case 'cpp':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      default:
        return 'bg-dark-700 text-dark-300 border-dark-600';
    }
  };

  return (
    <div className="bg-dark-850 hover:bg-dark-800 border border-dark-700/80 hover:border-brand-500/40 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 group shadow-lg hover:shadow-brand-500/5 relative overflow-hidden">
      {/* Top Meta Bar */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span
              className={`text-[11px] font-semibold uppercase px-2.5 py-0.5 rounded-full border ${getBadgeColor(
                project.template
              )}`}
            >
              {project.template || 'javascript'}
            </span>
            {project.visibility === 'public' ? (
              <span className="flex items-center space-x-1 text-[11px] text-dark-400">
                <Globe className="w-3 h-3" />
                <span>Public</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1 text-[11px] text-dark-400">
                <Lock className="w-3 h-3" />
                <span>Private</span>
              </span>
            )}
          </div>

          {hasActiveMeeting && (
            <span className="flex items-center space-x-1 text-[11px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full animate-pulse">
              <Radio className="w-3 h-3" />
              <span>Live Meeting</span>
            </span>
          )}
        </div>

        {/* Project Title & Description */}
        <Link to={`/project/${project._id}`} className="block group-hover:text-brand-400 transition-colors">
          <h3 className="text-base font-bold text-dark-100 group-hover:text-brand-400 line-clamp-1 mb-1.5">
            {project.name}
          </h3>
        </Link>
        <p className="text-xs text-dark-400 line-clamp-2 leading-relaxed mb-4 min-h-[32px]">
          {project.description || 'No description provided.'}
        </p>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-dark-700/60 flex items-center justify-between">
        <div className="flex items-center space-x-4 text-xs text-dark-400">
          <div className="flex items-center space-x-1.5" title="Members">
            <Users className="w-3.5 h-3.5" />
            <span>{memberCount}</span>
          </div>
          <div className="flex items-center space-x-1.5" title="Last Updated">
            <Clock className="w-3.5 h-3.5" />
            <span>{timeAgo(project.updatedAt)}</span>
          </div>
        </div>

        <Link
          to={`/project/${project._id}`}
          className="flex items-center space-x-1 text-xs font-semibold text-brand-400 group-hover:text-brand-300 group-hover:translate-x-0.5 transition-all"
        >
          <span>Open</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
