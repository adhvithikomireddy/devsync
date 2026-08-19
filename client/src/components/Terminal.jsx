import React, { useMemo } from 'react';
import { useProject } from '../context/ProjectContext';
import {
  Terminal as TerminalIcon,
  Play,
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Globe,
  RefreshCw,
} from 'lucide-react';

export default function Terminal({ activeTab, onTabChange }) {
  const {
    isExecuting,
    executionResult,
    runActiveFile,
    activeFile,
    files,
    fileContents,
    setExecutionResult,
    userRole,
  } = useProject();

  const canRun = ['owner', 'admin', 'editor'].includes(userRole);

  const handleClear = () => {
    setExecutionResult(null);
  };

  // Compile full HTML + CSS + JS bundle for Live Web Preview
  const previewDoc = useMemo(() => {
    const htmlFile = files.find((f) => f.name.endsWith('.html'));
    const cssFile = files.find((f) => f.name.endsWith('.css'));
    const jsFile = files.find((f) => f.name.endsWith('.js') && !f.name.includes('config'));

    const htmlContent = htmlFile ? fileContents[htmlFile._id] || htmlFile.content || '' : '<h1>No index.html file found</h1>';
    const cssContent = cssFile ? fileContents[cssFile._id] || cssFile.content || '' : '';
    const jsContent = jsFile ? fileContents[jsFile._id] || jsFile.content || '' : '';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            ${cssContent}
          </style>
        </head>
        <body>
          ${htmlContent.replace(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi, '').replace(/<script[^>]*src=["'][^"']*script\.js["'][^>]*><\/script>/gi, '')}
          <script>
            ${jsContent}
          </script>
        </body>
      </html>
    `;
  }, [files, fileContents]);

  const hasHtmlFile = files.some((f) => f.name.endsWith('.html'));

  return (
    <div className="h-full flex flex-col bg-dark-900 border-t border-dark-700 font-mono text-xs select-none">
      {/* Terminal Tab Bar */}
      <div className="h-9 bg-dark-850 border-b border-dark-700/80 px-3 flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onTabChange('output')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-md transition-colors ${
              activeTab === 'output'
                ? 'bg-dark-750 text-brand-400 font-semibold'
                : 'text-dark-400 hover:text-dark-200'
            }`}
          >
            <TerminalIcon className="w-3.5 h-3.5" />
            <span>Output</span>
          </button>

          {hasHtmlFile && (
            <button
              onClick={() => onTabChange('preview')}
              className={`flex items-center space-x-1 px-3 py-1 rounded-md transition-colors ${
                activeTab === 'preview'
                  ? 'bg-dark-750 text-emerald-400 font-semibold'
                  : 'text-dark-400 hover:text-dark-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>Web Preview</span>
            </button>
          )}

          <button
            onClick={() => onTabChange('changes')}
            className={`px-3 py-1 rounded-md transition-colors ${
              activeTab === 'changes'
                ? 'bg-dark-750 text-brand-400 font-semibold'
                : 'text-dark-400 hover:text-dark-200'
            }`}
          >
            Changes
          </button>

          <button
            onClick={() => onTabChange('activity')}
            className={`px-3 py-1 rounded-md transition-colors ${
              activeTab === 'activity'
                ? 'bg-dark-750 text-brand-400 font-semibold'
                : 'text-dark-400 hover:text-dark-200'
            }`}
          >
            Activity
          </button>

          <button
            onClick={() => onTabChange('chat')}
            className={`px-3 py-1 rounded-md transition-colors ${
              activeTab === 'chat'
                ? 'bg-dark-750 text-brand-400 font-semibold'
                : 'text-dark-400 hover:text-dark-200'
            }`}
          >
            Team Chat
          </button>
        </div>

        {/* Action Controls */}
        {activeTab === 'output' && (
          <div className="flex items-center space-x-2">
            {executionResult && (
              <div className="flex items-center space-x-2 text-[11px] text-dark-400 mr-2">
                <span className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{executionResult.executionTime}s</span>
                </span>
                {executionResult.exitCode === 0 ? (
                  <span className="flex items-center space-x-1 text-emerald-400">
                    <CheckCircle className="w-3 h-3" />
                    <span>Exit: 0</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-1 text-rose-400">
                    <XCircle className="w-3 h-3" />
                    <span>Exit: {executionResult.exitCode}</span>
                  </span>
                )}
              </div>
            )}

            <button
              onClick={handleClear}
              className="p-1 text-dark-400 hover:text-dark-200 rounded hover:bg-dark-800"
              title="Clear Output"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            {canRun && (
              <button
                onClick={runActiveFile}
                disabled={isExecuting || !activeFile}
                className="flex items-center space-x-1 px-2.5 py-0.5 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 transition-colors font-medium text-[11px]"
              >
                <RotateCcw className={`w-3 h-3 ${isExecuting ? 'animate-spin' : ''}`} />
                <span>Re-run</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Terminal Output Body */}
      {activeTab === 'output' && (
        <div className="flex-1 p-3 overflow-y-auto bg-dark-900 text-dark-200 space-y-1 font-mono select-text">
          {isExecuting && (
            <div className="flex items-center space-x-2 text-brand-400 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-brand-400" />
              <span>Executing {activeFile?.name} in isolated cloud sandbox...</span>
            </div>
          )}

          {!isExecuting && !executionResult && (
            <div className="text-dark-500 italic py-2">
              Console idle. Click "Run" or press Ctrl+Enter to execute active file.
            </div>
          )}

          {executionResult && (
            <>
              <div className="text-dark-400 border-b border-dark-800 pb-1 mb-2">
                &gt; Running {activeFile?.name || 'code'} with sandbox limits...
              </div>

              {executionResult.stdout && (
                <pre className="text-emerald-300 whitespace-pre-wrap leading-relaxed">
                  {executionResult.stdout}
                </pre>
              )}

              {executionResult.stderr && (
                <pre className="text-rose-400 whitespace-pre-wrap leading-relaxed bg-rose-950/20 p-2 rounded border border-rose-900/30">
                  {executionResult.stderr}
                </pre>
              )}

              <div className="text-dark-500 text-[11px] pt-2">
                [Process completed with exit code {executionResult.exitCode} in {executionResult.executionTime}s]
              </div>
            </>
          )}
        </div>
      )}

      {/* Web Preview Iframe Body */}
      {activeTab === 'preview' && (
        <div className="flex-1 p-2 bg-dark-950 flex flex-col">
          <div className="h-6 px-3 bg-dark-850 rounded-t-lg border-t border-x border-dark-750 flex items-center justify-between text-[10px] text-dark-400">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>DevSync Live Browser Sandbox</span>
            </span>
            <span>Live Reload Active</span>
          </div>
          <iframe
            title="DevSync Web Preview"
            srcDoc={previewDoc}
            sandbox="allow-scripts allow-modals"
            className="flex-1 w-full bg-white rounded-b-lg border border-dark-750 shadow-inner"
          />
        </div>
      )}
    </div>
  );
}
