import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import FileExplorer from '../components/FileExplorer';
import CodeEditor from '../components/CodeEditor';
import Terminal from '../components/Terminal';
import AIChat from '../components/AIChat';
import MembersPanel from '../components/MembersPanel';
import CollaborationPanel from '../components/CollaborationPanel';
import TeamChat from '../components/TeamChat';
import ActivityFeed from '../components/ActivityFeed';
import ChangeHistory from '../components/ChangeHistory';
import DiffViewerModal from '../components/DiffViewerModal';
import VideoRoom from '../components/VideoRoom';
import InviteModal from '../components/InviteModal';
import {
  FolderTree,
  Users,
  Sparkles,
  Video,
  ChevronDown,
  ChevronUp,
  LayoutTemplate,
  MessageSquare,
  GitCommit,
  Activity,
  Maximize2,
  Minimize2,
} from 'lucide-react';

export default function ProjectWorkspace() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { project, loadProject, loading, error, activeFile } = useProject();
  const { user } = useAuth();

  // Workspace UI states
  const [leftTab, setLeftTab] = useState('files'); // 'files' | 'team' | 'members'
  const [bottomTab, setBottomTab] = useState('output'); // 'output' | 'changes' | 'activity' | 'chat'
  const [isBottomOpen, setIsBottomOpen] = useState(true);
  const [isRightOpen, setIsRightOpen] = useState(false); // AI Panel
  const [isMeetingOpen, setIsMeetingOpen] = useState(false); // WebRTC Video Call Overlay

  // Modals state
  const [selectedChangeForDiff, setSelectedChangeForDiff] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadProject(projectId);
    }
  }, [projectId, loadProject]);

  const handleOpenDiffForFile = (fileId) => {
    // Switch bottom tab to changes
    setBottomTab('changes');
    setIsBottomOpen(true);
  };

  const handleAskAIForFile = (file) => {
    setIsRightOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center space-y-4 text-dark-300">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-dark-200">Loading DevSync Workspace...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center space-y-4 text-dark-300 p-4">
        <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-900/50 text-center max-w-md space-y-2">
          <h3 className="text-sm font-bold text-rose-400">Workspace Unavailable</h3>
          <p className="text-xs text-dark-300">{error || 'Project not found or access denied.'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 rounded-xl bg-dark-800 hover:bg-dark-750 text-white text-xs font-semibold"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-dark-900 text-dark-100 overflow-hidden select-none">
      {/* 1. Global Navbar */}
      <Navbar
        currentProject={project}
        onStartMeeting={() => setIsMeetingOpen(true)}
      />

      {/* 2. Main IDE Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Side Tool Icons Bar */}
        <div className="w-12 bg-dark-850 border-r border-dark-700/80 flex flex-col items-center justify-between py-3 z-20">
          <div className="space-y-3 flex flex-col items-center">
            <button
              onClick={() => setLeftTab(leftTab === 'files' ? null : 'files')}
              className={`p-2 rounded-xl transition-colors ${
                leftTab === 'files'
                  ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30'
                  : 'text-dark-400 hover:text-dark-100 hover:bg-dark-800'
              }`}
              title="File Explorer"
            >
              <FolderTree className="w-5 h-5" />
            </button>

            <button
              onClick={() => setLeftTab(leftTab === 'team' ? null : 'team')}
              className={`p-2 rounded-xl transition-colors ${
                leftTab === 'team'
                  ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30'
                  : 'text-dark-400 hover:text-dark-100 hover:bg-dark-800'
              }`}
              title="Live Team Presence & Status"
            >
              <Users className="w-5 h-5" />
            </button>

            <button
              onClick={() => setLeftTab(leftTab === 'members' ? null : 'members')}
              className={`p-2 rounded-xl transition-colors ${
                leftTab === 'members'
                  ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30'
                  : 'text-dark-400 hover:text-dark-100 hover:bg-dark-800'
              }`}
              title="Project Members & Roles"
            >
              <LayoutTemplate className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3 flex flex-col items-center">
            {/* Toggle AI Sidebar */}
            <button
              onClick={() => setIsRightOpen((prev) => !prev)}
              className={`p-2 rounded-xl transition-colors ${
                isRightOpen
                  ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                  : 'text-dark-400 hover:text-dark-100 hover:bg-dark-800'
              }`}
              title="Toggle DevSync AI Assistant"
            >
              <Sparkles className="w-5 h-5" />
            </button>

            {/* Toggle Meeting */}
            <button
              onClick={() => setIsMeetingOpen((prev) => !prev)}
              className={`p-2 rounded-xl transition-colors ${
                isMeetingOpen
                  ? 'bg-rose-600/20 text-rose-400 border border-rose-500/30'
                  : 'text-dark-400 hover:text-dark-100 hover:bg-dark-800'
              }`}
              title="Toggle Video Meeting"
            >
              <Video className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Left Secondary Drawer (Explorer / Team / Members) */}
        {leftTab && (
          <div className="w-64 bg-dark-850 h-full border-r border-dark-700/80 z-10 animate-in slide-in-from-left duration-150">
            {leftTab === 'files' && <FileExplorer />}
            {leftTab === 'team' && (
              <CollaborationPanel onStartMeeting={() => setIsMeetingOpen(true)} />
            )}
            {leftTab === 'members' && (
              <MembersPanel onOpenInvite={() => setShowInviteModal(true)} />
            )}
          </div>
        )}

        {/* Center Workspace (Editor + Bottom Drawer) */}
        <div className="flex-1 flex flex-col overflow-hidden bg-dark-900">
          {/* Monaco Editor Component */}
          <div className="flex-1 overflow-hidden">
            <CodeEditor
              onOpenDiff={handleOpenDiffForFile}
              onAskAI={handleAskAIForFile}
            />
          </div>

          {/* Bottom Console / Drawer */}
          <div
            className={`transition-all duration-200 border-t border-dark-700 flex flex-col bg-dark-900 ${
              isBottomOpen ? 'h-64' : 'h-9'
            }`}
          >
            {/* Header toggle */}
            <div className="flex items-center justify-between bg-dark-850">
              <div className="flex-1">
                <Terminal
                  activeTab={bottomTab}
                  onTabChange={(tab) => {
                    setBottomTab(tab);
                    if (!isBottomOpen) setIsBottomOpen(true);
                  }}
                />
              </div>

              <div className="pr-3 flex items-center space-x-1 bg-dark-850 h-9">
                <button
                  onClick={() => setIsBottomOpen((prev) => !prev)}
                  className="p-1 rounded text-dark-400 hover:text-dark-200 hover:bg-dark-800"
                  title={isBottomOpen ? 'Collapse Drawer' : 'Expand Drawer'}
                >
                  {isBottomOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Bottom Drawer Content */}
            {isBottomOpen && (
              <div className="flex-1 overflow-hidden">
                {bottomTab === 'changes' && (
                  <ChangeHistory
                    onSelectChange={(ch) => setSelectedChangeForDiff(ch)}
                  />
                )}
                {bottomTab === 'activity' && <ActivityFeed />}
                {bottomTab === 'chat' && (
                  <TeamChat onOpenDiff={handleOpenDiffForFile} />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Collapsible AI Assistant Sidebar */}
        {isRightOpen && (
          <div className="w-80 h-full border-l border-dark-700 bg-dark-850 z-10 animate-in slide-in-from-right duration-150">
            <AIChat activeTargetFile={activeFile} />
          </div>
        )}

        {/* WebRTC Video Call Overlay Window */}
        {isMeetingOpen && (
          <div className="absolute inset-0 z-40 bg-dark-950/95 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
            <VideoRoom
              projectId={project._id}
              onClose={() => setIsMeetingOpen(false)}
            />
          </div>
        )}
      </div>

      {/* Diff Inspection Modal */}
      {selectedChangeForDiff && (
        <DiffViewerModal
          change={selectedChangeForDiff}
          onClose={() => setSelectedChangeForDiff(null)}
        />
      )}

      {/* Invite Collaborator Modal */}
      {showInviteModal && (
        <InviteModal
          onClose={() => setShowInviteModal(false)}
          onMemberInvited={() => loadProject(projectId)}
        />
      )}
    </div>
  );
}
