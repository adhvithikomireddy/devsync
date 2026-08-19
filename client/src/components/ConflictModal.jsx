import React from 'react';
import {
  AlertTriangle,
  Check,
  RotateCcw,
  X,
  FileCode,
  Eye,
} from 'lucide-react';

export default function ConflictModal({ peerName, fileName, onKeepMine, onKeepRemote, onReviewDiff, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-dark-850 border border-amber-500/40 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-dark-700 flex items-center justify-between bg-dark-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-dark-100">Simultaneous Editing Conflict</h3>
              <p className="text-[11px] text-dark-400">Concurrent updates detected in {fileName}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-dark-400 hover:text-dark-100 hover:bg-dark-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs text-dark-200">
          <p className="leading-relaxed">
            <strong className="text-white">{peerName || 'Another developer'}</strong> has made modifications in nearby lines of <code className="text-brand-400 font-mono">{fileName}</code> at the same time as your local edits.
          </p>

          <p className="text-dark-400 leading-relaxed">
            DevSync's CRDT engine preserves both streams of changes. How would you like to proceed?
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
            <button
              onClick={onKeepMine}
              className="p-3 rounded-xl bg-dark-800 hover:bg-dark-750 border border-dark-700 text-left space-y-1 transition-colors"
            >
              <div className="flex items-center space-x-1.5 font-bold text-dark-100">
                <Check className="w-3.5 h-3.5 text-brand-400" />
                <span>Keep Mine</span>
              </div>
              <p className="text-[10px] text-dark-400">Preserve your local buffer version</p>
            </button>

            <button
              onClick={onKeepRemote}
              className="p-3 rounded-xl bg-dark-800 hover:bg-dark-750 border border-dark-700 text-left space-y-1 transition-colors"
            >
              <div className="flex items-center space-x-1.5 font-bold text-dark-100">
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>Keep {peerName}</span>
              </div>
              <p className="text-[10px] text-dark-400">Accept remote collaborator state</p>
            </button>

            <button
              onClick={onReviewDiff}
              className="p-3 rounded-xl bg-dark-800 hover:bg-dark-750 border border-brand-500/40 text-left space-y-1 transition-colors"
            >
              <div className="flex items-center space-x-1.5 font-bold text-brand-400">
                <Eye className="w-3.5 h-3.5" />
                <span>Review Diff</span>
              </div>
              <p className="text-[10px] text-dark-400">Inspect side-by-side patch</p>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-dark-700 bg-dark-850 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-dark-750 hover:bg-dark-700 text-dark-200 text-xs font-semibold transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
