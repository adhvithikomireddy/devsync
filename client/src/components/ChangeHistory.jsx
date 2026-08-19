import React from 'react';
import { useProject } from '../context/ProjectContext';
import { timeAgo } from '../utils/formatters';
import {
  GitCommit,
  FileCode,
  ArrowRight,
  Plus,
  Minus,
} from 'lucide-react';

export default function ChangeHistory({ onSelectChange }) {
  const { codeChanges } = useProject();

  return (
    <div className="h-full flex flex-col bg-dark-900 font-sans text-xs select-none p-3 overflow-y-auto space-y-2">
      <div className="flex items-center justify-between pb-2 border-b border-dark-800">
        <span className="text-[11px] font-bold text-dark-400 uppercase tracking-wider">
          Code Change History & Attribution
        </span>
        <span className="text-[11px] text-dark-500">
          {codeChanges.length} Recorded Edit{codeChanges.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-2 select-text">
        {codeChanges.map((change) => {
          const user = change.user || { name: 'Collaborator', color: '#3b82f6' };

          return (
            <div
              key={change._id}
              className="p-3 rounded-xl bg-dark-850 border border-dark-700/80 hover:border-brand-500/40 transition-colors flex items-center justify-between"
            >
              <div className="space-y-1.5 min-w-0 flex-1">
                {/* Author & Time */}
                <div className="flex items-center space-x-2">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                    style={{ backgroundColor: user.color || '#3b82f6' }}
                  >
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="font-semibold text-dark-100">{user.name}</span>
                  <span className="text-dark-500 text-[11px]">{timeAgo(change.timestamp || change.createdAt)}</span>
                </div>

                {/* File Path & Line Range Summary */}
                <div className="flex items-center space-x-2 text-dark-300">
                  <FileCode className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                  <span className="font-mono text-brand-400 font-medium">{change.filePath}</span>
                  <span className="text-dark-400">• {change.summary}</span>
                </div>

                {/* Added/Removed line tags */}
                <div className="flex items-center space-x-3 text-[11px]">
                  {change.linesAdded > 0 && (
                    <span className="flex items-center space-x-0.5 text-emerald-400">
                      <Plus className="w-3 h-3" />
                      <span>{change.linesAdded} line{change.linesAdded > 1 ? 's' : ''} added</span>
                    </span>
                  )}
                  {change.linesRemoved > 0 && (
                    <span className="flex items-center space-x-0.5 text-rose-400">
                      <Minus className="w-3 h-3" />
                      <span>{change.linesRemoved} line{change.linesRemoved > 1 ? 's' : ''} removed</span>
                    </span>
                  )}
                </div>
              </div>

              {/* View Diff Button */}
              <button
                onClick={() => onSelectChange(change)}
                className="ml-3 px-3 py-1.5 rounded-lg bg-dark-750 hover:bg-dark-700 text-brand-400 hover:text-brand-300 border border-dark-600 transition-colors font-medium flex items-center space-x-1 shrink-0"
              >
                <span>View Diff</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}

        {codeChanges.length === 0 && (
          <div className="py-8 text-center text-xs text-dark-500">
            No code changes recorded yet. Edit and save files to track attribution.
          </div>
        )}
      </div>
    </div>
  );
}
