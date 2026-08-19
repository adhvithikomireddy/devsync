import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { timeAgo } from '../utils/formatters';
import {
  Bell,
  CheckCircle2,
  Mail,
  UserPlus,
  Shield,
  Video,
  ExternalLink,
  Check,
  X,
  Folder,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [notifRes, inviteRes] = await Promise.all([
        api.getNotifications(),
        api.getMyInvitations(),
      ]);

      if (notifRes.success && notifRes.notifications) {
        setNotifications(notifRes.notifications);
      }
      if (inviteRes.success && inviteRes.invitations) {
        setInvitations(inviteRes.invitations);
      }
    } catch (err) {
      console.warn('[Notifications] Error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAcceptInvite = async (invitationId, projectId) => {
    setProcessingId(invitationId);
    setFeedbackMsg('');
    try {
      const res = await api.acceptInvitation(invitationId);
      if (res.success) {
        setFeedbackMsg(res.message || 'Invitation accepted! Redirecting...');
        setInvitations((prev) => prev.filter((inv) => inv._id !== invitationId));
        setTimeout(() => {
          if (projectId) navigate(`/project/${projectId}`);
        }, 1200);
      }
    } catch (err) {
      alert(err.message || 'Failed to accept invitation');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectInvite = async (invitationId) => {
    setProcessingId(invitationId);
    try {
      const res = await api.rejectInvitation(invitationId);
      if (res.success) {
        setInvitations((prev) => prev.filter((inv) => inv._id !== invitationId));
      }
    } catch (err) {
      alert(err.message || 'Failed to decline invitation');
    } finally {
      setProcessingId(null);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {}
  };

  const getIcon = (type) => {
    switch (type) {
      case 'INVITATION':
        return <UserPlus className="w-4 h-4 text-emerald-400" />;
      case 'ROLE_CHANGED':
        return <Shield className="w-4 h-4 text-purple-400" />;
      case 'MEETING_STARTED':
        return <Video className="w-4 h-4 text-rose-400" />;
      case 'CHAT_MENTION':
        return <Mail className="w-4 h-4 text-brand-400" />;
      default:
        return <Bell className="w-4 h-4 text-dark-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 text-dark-100 flex flex-col select-none">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-10 max-w-4xl mx-auto w-full space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Notifications & Requests</h1>
              <p className="text-xs text-dark-400">Manage project invitations and collaboration alerts</p>
            </div>

            {notifications.some((n) => !n.read) && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-750 text-brand-400 text-xs font-semibold border border-dark-700 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark All as Read</span>
              </button>
            )}
          </div>

          {feedbackMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{feedbackMsg}</span>
            </div>
          )}

          {/* Pending Invitations Section */}
          {invitations.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Pending Project Invitations ({invitations.length})
                </h3>
              </div>

              <div className="space-y-3">
                {invitations.map((inv) => (
                  <div
                    key={inv._id}
                    className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/20 via-dark-800 to-dark-850 border border-emerald-500/30 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0 border border-emerald-500/30">
                        <Folder className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2.5">
                          <h4 className="text-sm font-bold text-white">
                            {inv.project?.name || 'Workspace'}
                          </h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-dark-700 text-dark-300 uppercase font-semibold border border-dark-600">
                            {inv.project?.template || 'code'}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 capitalize">
                            Role: {inv.role}
                          </span>
                        </div>
                        <p className="text-xs text-dark-300">
                          <span className="font-semibold text-white">{inv.inviter?.name || 'A teammate'}</span> invited you to collaborate on this engineering project.
                        </p>
                        <span className="text-[10px] text-dark-500 block">{timeAgo(inv.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2.5 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => handleRejectInvite(inv._id)}
                        disabled={processingId === inv._id}
                        className="px-3.5 py-2 rounded-xl bg-dark-750 hover:bg-dark-700 text-dark-300 hover:text-rose-400 text-xs font-semibold border border-dark-650 transition-colors flex items-center space-x-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Decline</span>
                      </button>
                      <button
                        onClick={() => handleAcceptInvite(inv._id, inv.project?._id)}
                        disabled={processingId === inv._id}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-500/20 active:scale-95 transition-all flex items-center space-x-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>{processingId === inv._id ? 'Joining...' : 'Accept Invitation'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* General Notifications Feed */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-dark-400">
              Activity Alerts ({notifications.length})
            </h3>

            <div className="space-y-3 select-text">
              {notifications.map((n) => (
                <div
                  key={n._id}
                  className={`p-4 rounded-2xl border transition-colors flex items-start justify-between ${
                    n.read
                      ? 'bg-dark-850 border-dark-700/60'
                      : 'bg-dark-800 border-brand-500/30 shadow-md shadow-brand-500/5'
                  }`}
                >
                  <div className="flex items-start space-x-3.5">
                    <div className="mt-0.5 p-2 rounded-xl bg-dark-750 border border-dark-600 shrink-0">
                      {getIcon(n.type)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-xs font-bold text-white">{n.title}</h4>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-brand-400" />
                        )}
                      </div>
                      <p className="text-xs text-dark-300 leading-relaxed">{n.message}</p>
                      <span className="text-[10px] text-dark-500">{timeAgo(n.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {n.link && (
                      <Link
                        to={n.link}
                        onClick={() => handleMarkAsRead(n._id)}
                        className="p-1.5 rounded-lg text-brand-400 hover:text-brand-300 hover:bg-dark-700"
                        title="Go to project"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    )}
                    {!n.read && (
                      <button
                        onClick={() => handleMarkAsRead(n._id)}
                        className="text-[11px] text-dark-400 hover:text-dark-200 px-2 py-1 rounded hover:bg-dark-700"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {notifications.length === 0 && invitations.length === 0 && !loading && (
                <div className="py-16 text-center rounded-2xl bg-dark-850 border border-dark-700 space-y-2">
                  <Bell className="w-8 h-8 text-dark-500 mx-auto" />
                  <h3 className="text-sm font-semibold text-dark-300">All caught up!</h3>
                  <p className="text-xs text-dark-500">You have no pending invitations or notifications.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
