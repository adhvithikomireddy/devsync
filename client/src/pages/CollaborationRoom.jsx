import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import VideoRoom from '../components/VideoRoom';
import TeamChat from '../components/TeamChat';
import ActivityFeed from '../components/ActivityFeed';
import {
  Code2,
  ArrowLeft,
  Video,
  MessageSquare,
  Activity,
} from 'lucide-react';

export default function CollaborationRoom() {
  const { projectId } = useParams();
  const { project, loadProject } = useProject();

  useEffect(() => {
    if (projectId) {
      loadProject(projectId);
    }
  }, [projectId, loadProject]);

  return (
    <div className="h-screen bg-dark-900 text-dark-100 flex flex-col select-none overflow-hidden">
      {/* Header */}
      <div className="h-14 bg-dark-850 border-b border-dark-700 px-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link
            to={`/project/${projectId}`}
            className="p-2 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800 transition-colors flex items-center space-x-1 text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Editor</span>
          </Link>
          <div className="h-4 w-px bg-dark-700" />
          <h2 className="text-sm font-bold text-white">
            {project?.name || 'Project'} — Collaboration Room
          </h2>
        </div>
      </div>

      {/* Main Room Body */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        {/* Left Video Area */}
        <div className="col-span-12 lg:col-span-8 h-full bg-dark-950 border-r border-dark-700">
          <VideoRoom projectId={projectId} />
        </div>

        {/* Right Chat & Activity Feed */}
        <div className="col-span-12 lg:col-span-4 h-full flex flex-col bg-dark-900">
          <div className="h-1/2 border-b border-dark-700 overflow-hidden flex flex-col">
            <div className="p-3 bg-dark-850 border-b border-dark-700 flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-brand-400" />
              <span className="text-xs font-bold text-dark-100">Team Chat</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <TeamChat />
            </div>
          </div>

          <div className="h-1/2 overflow-hidden flex flex-col">
            <div className="p-3 bg-dark-850 border-b border-dark-700 flex items-center space-x-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-dark-100">Live Project Events</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <ActivityFeed />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
