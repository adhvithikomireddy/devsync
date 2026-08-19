import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useProject } from '../context/ProjectContext';
import { useSocket } from '../context/SocketContext';
import { useCollaboration } from '../hooks/useCollaboration';
import { getLanguageForFile, MONACO_DEFAULT_OPTIONS } from '../utils/languages';
import {
  Play,
  Save,
  GitCommit,
  Sparkles,
  AlertTriangle,
  X,
  FileCode,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export default function CodeEditor({ onOpenDiff, onAskAI }) {
  const {
    openFiles,
    activeFileId,
    activeFile,
    fileContents,
    unsavedFiles,
    openFile,
    closeFile,
    setActiveFileId,
    saveFile,
    runActiveFile,
    isExecuting,
    userRole,
  } = useProject();

  const { typingUsers, presenceList } = useSocket();
  const editorRef = useRef(null);
  const monacoRef = useRef(null);

  const isReadOnly = userRole === 'viewer';
  const isUnsaved = activeFile ? unsavedFiles.has(activeFile._id) : false;
  const currentLanguage = activeFile ? getLanguageForFile(activeFile.name) : 'plaintext';
  const currentContent = activeFile ? fileContents[activeFile._id] ?? activeFile.content ?? '' : '';

  // Active typing collaborator for this file
  const typingInfo = activeFile ? typingUsers[activeFile._id] : null;

  // Collaborators currently in the active file
  const peersInFile = presenceList.filter(
    (p) => p.activeFile?.fileId === activeFile?._id && p.userId !== undefined
  );

  // Setup Real-time collaboration & cursor hook
  const { bindEditorEvents } = useCollaboration({
    editorRef,
    monacoRef,
    fileId: activeFile?._id,
    filePath: activeFile?.path,
    fileName: activeFile?.name,
  });

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Define custom DevSync Dark Theme
    monaco.editor.defineTheme('devsync-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6a737d', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'ff7b72', fontStyle: 'bold' },
        { token: 'string', foreground: 'a5d6ff' },
        { token: 'number', foreground: '79c0ff' },
        { token: 'type', foreground: 'ffa657' },
        { token: 'function', foreground: 'd2a8ff' },
        { token: 'variable', foreground: 'e6edf3' },
      ],
      colors: {
        'editor.background': '#0d1117',
        'editor.foreground': '#e6edf3',
        'editorLineNumber.foreground': '#484f58',
        'editorLineNumber.activeForeground': '#b1bac4',
        'editor.selectionBackground': '#1f3554',
        'editor.inactiveSelectionBackground': '#18273d',
        'editor.lineHighlightBackground': '#161b22',
        'editorCursor.foreground': '#58a6ff',
        'editorWhitespace.foreground': '#21262d',
      },
    });

    monaco.editor.setTheme('devsync-dark');

    // Bind real-time event listeners
    bindEditorEvents(editor, monaco);

    // Keyboard Shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      if (activeFile?._id && !isReadOnly) {
        saveFile(activeFile._id);
      }
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (!isReadOnly) {
        runActiveFile();
      }
    });
  };

  if (!activeFile) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-dark-900 text-dark-400 select-none p-6">
        <FileCode className="w-12 h-12 text-dark-600 mb-3" />
        <h3 className="text-base font-semibold text-dark-300 mb-1">No File Selected</h3>
        <p className="text-xs text-dark-500 max-w-sm text-center">
          Select a file from the explorer on the left or create a new file to start coding.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-dark-900 overflow-hidden select-none">
      {/* 1. Multi-file Tabs Header */}
      <div className="flex items-center justify-between bg-dark-850 border-b border-dark-700/80 px-2 overflow-x-auto">
        <div className="flex items-center space-x-1 overflow-x-auto py-1">
          {openFiles.map((f) => {
            const isTabActive = f._id === activeFileId;
            const tabUnsaved = unsavedFiles.has(f._id);

            return (
              <div
                key={f._id}
                onClick={() => setActiveFileId(f._id)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-t-lg text-xs font-medium cursor-pointer border-t-2 transition-all ${
                  isTabActive
                    ? 'bg-dark-900 text-brand-400 border-brand-500'
                    : 'bg-dark-800 text-dark-400 border-transparent hover:text-dark-200 hover:bg-dark-750'
                }`}
              >
                <span className="truncate max-w-[120px]">{f.name}</span>
                {tabUnsaved && (
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400" title="Unsaved" />
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeFile(f._id);
                  }}
                  className="p-0.5 rounded hover:bg-dark-700 text-dark-400 hover:text-dark-100"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Read-Only Badge if Viewer */}
        {isReadOnly && (
          <div className="flex items-center space-x-1 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
            <Lock className="w-3 h-3" />
            <span>Read Only (Viewer)</span>
          </div>
        )}
      </div>

      {/* 2. Editor Action Bar */}
      <div className="h-10 bg-dark-850/80 border-b border-dark-700/60 px-4 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3 truncate">
          <span className="text-dark-400 truncate">{activeFile.path}</span>
          <div className="h-3 w-px bg-dark-700" />
          <span className="text-dark-400 capitalize">{currentLanguage}</span>

          {/* Typing Indicator */}
          {typingInfo && (
            <div className="flex items-center space-x-1 text-[11px] text-brand-400 animate-pulse font-medium">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: typingInfo.userColor || '#3b82f6' }}
              />
              <span>{typingInfo.userName} is typing...</span>
            </div>
          )}

          {/* Multi-peer Conflict Warning */}
          {peersInFile.length > 1 && (
            <div className="hidden sm:flex items-center space-x-1 text-[11px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
              <AlertTriangle className="w-3 h-3" />
              <span>{peersInFile.length} active in this file</span>
            </div>
          )}
        </div>

        {/* Right Tools Bar */}
        <div className="flex items-center space-x-2">
          {/* Unsaved / Saved Status */}
          <div className="flex items-center space-x-1 text-xs text-dark-400 mr-1">
            {isUnsaved ? (
              <span className="text-amber-400">● Unsaved</span>
            ) : (
              <span className="flex items-center space-x-1 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Saved</span>
              </span>
            )}
          </div>

          {/* View Diff Button */}
          {onOpenDiff && (
            <button
              onClick={() => onOpenDiff(activeFile._id)}
              className="flex items-center space-x-1 px-2.5 py-1 rounded bg-dark-800 hover:bg-dark-750 text-dark-300 hover:text-white border border-dark-700 transition-colors"
              title="View recent code changes & diffs"
            >
              <GitCommit className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Changes</span>
            </button>
          )}

          {/* AI Assistance Button */}
          {onAskAI && (
            <button
              onClick={() => onAskAI(activeFile)}
              className="flex items-center space-x-1 px-2.5 py-1 rounded bg-brand-600/10 hover:bg-brand-600/20 text-brand-400 border border-brand-500/30 transition-colors"
              title="Ask DevSync AI to explain or optimize this file"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">AI Help</span>
            </button>
          )}

          {/* Save Button */}
          {!isReadOnly && (
            <button
              onClick={() => saveFile(activeFile._id)}
              className="flex items-center space-x-1 px-2.5 py-1 rounded bg-dark-800 hover:bg-dark-750 text-dark-200 hover:text-white border border-dark-700 transition-colors"
              title="Save (Ctrl+S)"
            >
              <Save className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Save</span>
            </button>
          )}

          {/* Run Code Button */}
          {!isReadOnly && (
            <button
              onClick={runActiveFile}
              disabled={isExecuting}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-white font-semibold shadow-sm transition-all ${
                isExecuting
                  ? 'bg-emerald-700 cursor-not-allowed opacity-75'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20 active:scale-95'
              }`}
              title="Execute active file in isolated cloud sandbox (Ctrl+Enter)"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isExecuting ? 'Running...' : 'Run'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Monaco Editor Core */}
      <div className="flex-1 w-full relative">
        <Editor
          height="100%"
          language={currentLanguage}
          value={currentContent}
          theme="devsync-dark"
          options={{
            ...MONACO_DEFAULT_OPTIONS,
            readOnly: isReadOnly,
          }}
          onMount={handleEditorDidMount}
        />
      </div>
    </div>
  );
}
