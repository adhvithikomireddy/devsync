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
  Sparkles,
} from 'lucide-react';

export default function ProjectCard({ project, currentUserId }) {
  const isOwner = (project.owner?._id || project.owner)?.toString() === currentUserId?.toString();
  const memberCount = project.members?.length || 1;
  const hasActiveMeeting = !!project.activeMeeting;

  // Modern language pill styles
  const getBadgeStyle = (template) => {
    switch (template) {
      case 'html':
      case 'html-css':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'javascript':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      case 'react':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'nodejs':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'python':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'java':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'c':
      case 'cpp':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      default:
        return 'bg-dark-750 text-dark-300 border-white/[0.08]';
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col justify-between group relative overflow-hidden">
      {/* Top Meta Bar */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center space-x-2">
            <span
              className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border ${getBadgeStyle(
                project.template
              )}`}
            >
              {project.template || 'javascript'}
            </span>
            {project.visibility === 'public' ? (
              <span className="flex items-center space-x-1 text-[10px] text-dark-400 font-medium">
                <Globe className="w-3 h-3 text-dark-400" />
                <span>Public</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1 text-[10px] text-dark-400 font-medium">
                <Lock className="w-3 h-3 text-dark-400" />
                <span>Private</span>
              </span>
            )}
          </div>

          {hasActiveMeeting && (
            <span className="flex items-center space-x-1.5 text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded-full animate-pulse">
              <Radio className="w-3 h-3" />
              <span>Live Call</span>
            </span>
          )}
        </div>

        {/* Project Title & Description */}
        <Link to={`/project/${project._id}`} className="block group-hover:text-brand-400 transition-colors">
          <h3 className="text-sm font-bold text-white group-hover:text-brand-400 line-clamp-1 mb-1.5 tracking-tight">
            {project.name}
          </h3>
        </Link>
        <p className="text-xs text-dark-400 line-clamp-2 leading-relaxed mb-4 min-h-[32px] font-normal">
          {project.description || 'Collaborative engineering workspace for multi-user coding.'}
        </p>
      </div>

      {/* Footer Info */}
      <div className="pt-3.5 border-t border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center space-x-3.5 text-[11px] text-dark-400">
          <div className="flex items-center space-x-1.5 font-medium" title="Members">
            <Users className="w-3.5 h-3.5 text-dark-500" />
            <span>{memberCount}</span>
          </div>
          <div className="flex items-center space-x-1.5 font-medium" title="Last Updated">
            <Clock className="w-3.5 h-3.5 text-dark-500" />
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
