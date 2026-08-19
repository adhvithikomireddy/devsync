import React from 'react';
import { timeAgo, formatDate } from '../utils/formatters';
import {
  GitCommit,
  X,
  Plus,
  Minus,
  FileCode,
  Calendar,
  User,
} from 'lucide-react';

export default function DiffViewerModal({ change, onClose }) {
  if (!change) return null;

  const user = change.user || { name: 'Collaborator', color: '#3b82f6' };

  // Parse diff lines for visual coloring
  const diffLines = (change.diff || '').split('\n');

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-dark-850 border border-dark-700 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 border-b border-dark-700 flex items-center justify-between bg-dark-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-brand-600/20 border border-brand-500/30 flex items-center justify-center">
              <GitCommit className="w-4 h-4 text-brand-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-dark-100">Code Change Inspection</h3>
                <span className="text-xs px-2 py-0.5 rounded bg-dark-750 text-dark-300 font-mono">
                  {change.filePath}
                </span>
              </div>
              <p className="text-xs text-dark-400 mt-0.5">{change.summary}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-dark-400 hover:text-dark-100 hover:bg-dark-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Change Metadata Bar */}
        <div className="px-4 py-2.5 bg-dark-800/50 border-b border-dark-700/60 flex flex-wrap items-center justify-between text-xs text-dark-300 gap-2">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5">
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-sm"
                style={{ backgroundColor: user.color || '#3b82f6' }}
              >
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span>Author: <strong className="text-white">{user.name}</strong></span>
            </div>

            <div className="flex items-center space-x-1.5 text-dark-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(change.timestamp || change.createdAt)} ({timeAgo(change.timestamp || change.createdAt)})</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 font-mono text-[11px]">
            <span className="text-emerald-400">+{change.linesAdded} lines</span>
            <span className="text-rose-400">-{change.linesRemoved} lines</span>
          </div>
        </div>

        {/* Diff Content View */}
        <div className="flex-1 overflow-y-auto p-4 bg-dark-950 font-mono text-xs select-text space-y-0.5">
          {diffLines.map((line, index) => {
            let lineClass = 'text-dark-300';
            let bgClass = '';

            if (line.startsWith('+') && !line.startsWith('+++')) {
              lineClass = 'text-emerald-300 font-semibold';
              bgClass = 'bg-emerald-950/40 border-l-2 border-emerald-500 pl-2';
            } else if (line.startsWith('-') && !line.startsWith('---')) {
              lineClass = 'text-rose-400 line-through';
              bgClass = 'bg-rose-950/40 border-l-2 border-rose-500 pl-2';
            } else if (line.startsWith('@@')) {
              lineClass = 'text-brand-400 font-semibold';
              bgClass = 'bg-brand-950/30 py-1 px-2 my-1 rounded text-[11px]';
            }

            return (
              <div key={index} className={`whitespace-pre-wrap py-0.5 ${lineClass} ${bgClass}`}>
                {line || ' '}
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-dark-700 bg-dark-850 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-dark-750 hover:bg-dark-700 text-dark-200 text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
