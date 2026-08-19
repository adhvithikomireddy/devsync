import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { useSocket } from '../context/SocketContext';
import {
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  FilePlus,
  FolderPlus,
  Trash2,
  Edit2,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  Check,
  X,
} from 'lucide-react';

export default function FileExplorer() {
  const {
    files,
    activeFileId,
    openFile,
    createFile,
    renameFile,
    deleteFile,
    unsavedFiles,
    userRole,
  } = useProject();

  const { presenceList } = useSocket();

  const [expandedFolders, setExpandedFolders] = useState({ root: true });
  const [isCreating, setIsCreating] = useState(null); // 'file' | 'folder' | null
  const [newItemName, setNewItemName] = useState('');
  const [renamingId, setRenamingId] = useState(null);
  const [renamedName, setRenamedName] = useState('');

  const canEdit = ['owner', 'admin', 'editor'].includes(userRole);

  const toggleFolder = (folderPath) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderPath]: !prev[folderPath],
    }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newItemName.trim()) {
      setIsCreating(null);
      return;
    }

    const isDirectory = isCreating === 'folder';
    const path = newItemName.trim();

    await createFile({
      name: path.split('/').pop(),
      path,
      isDirectory,
    });

    setIsCreating(null);
    setNewItemName('');
  };

  const handleRenameSubmit = async (fileId) => {
    if (!renamedName.trim()) {
      setRenamingId(null);
      return;
    }

    await renameFile(fileId, renamedName.trim());
    setRenamingId(null);
    setRenamedName('');
  };

  // Helper to find who is editing a file
  const getCollaboratorsOnPath = (filePath) => {
    return presenceList.filter(
      (p) => p.activeFile?.filePath === filePath || p.activeFile?.filePath?.startsWith(`${filePath}/`)
    );
  };

  // Group files into nested tree structure
  const buildTree = (filesList) => {
    const root = { files: [], folders: {} };

    filesList.forEach((file) => {
      const parts = file.path.split('/');
      let current = root;

      for (let i = 0; i < parts.length - 1; i++) {
        const folderName = parts[i];
        if (!current.folders[folderName]) {
          current.folders[folderName] = { files: [], folders: {}, path: parts.slice(0, i + 1).join('/') };
        }
        current = current.folders[folderName];
      }

      if (file.isDirectory) {
        const lastPart = parts[parts.length - 1];
        if (!current.folders[lastPart]) {
          current.folders[lastPart] = { files: [], folders: {}, path: file.path, meta: file };
        } else {
          current.folders[lastPart].meta = file;
        }
      } else {
        current.files.push(file);
      }
    });

    return root;
  };

  const tree = buildTree(files);

  const renderFolderNode = (folderName, folderData, depth = 0) => {
    const isExpanded = expandedFolders[folderData.path] ?? true;
    const collaborators = getCollaboratorsOnPath(folderData.path);

    return (
      <div key={folderData.path} className="select-none">
        <div
          onClick={() => toggleFolder(folderData.path)}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          className="flex items-center justify-between py-1 px-2 rounded-md hover:bg-dark-800 text-dark-300 hover:text-dark-100 cursor-pointer text-xs group"
        >
          <div className="flex items-center space-x-1.5 truncate">
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-dark-400 shrink-0" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-dark-400 shrink-0" />
            )}
            {isExpanded ? (
              <FolderOpen className="w-3.5 h-3.5 text-brand-400 shrink-0" />
            ) : (
              <Folder className="w-3.5 h-3.5 text-brand-400 shrink-0" />
            )}
            <span className="truncate font-medium">{folderName}</span>
          </div>

          {/* Collaborator Dots */}
          {collaborators.length > 0 && (
            <div className="flex items-center -space-x-1">
              {collaborators.slice(0, 2).map((c, i) => (
                <div
                  key={i}
                  title={`${c.name} is in ${folderName}`}
                  className="w-2.5 h-2.5 rounded-full border border-dark-900"
                  style={{ backgroundColor: c.color || '#3b82f6' }}
                />
              ))}
            </div>
          )}
        </div>

        {isExpanded && (
          <div>
            {Object.entries(folderData.folders).map(([subFolderName, subFolderData]) =>
              renderFolderNode(subFolderName, subFolderData, depth + 1)
            )}
            {folderData.files.map((file) => renderFileNode(file, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderFileNode = (file, depth = 0) => {
    const isActive = activeFileId === file._id;
    const isUnsaved = unsavedFiles.has(file._id);
    const collaborators = presenceList.filter((p) => p.activeFile?.fileId === file._id);

    return (
      <div
        key={file._id}
        style={{ paddingLeft: `${depth * 12 + 16}px` }}
        onClick={() => openFile(file)}
        className={`flex items-center justify-between py-1 px-2 rounded-md cursor-pointer text-xs group transition-colors select-none ${
          isActive
            ? 'bg-brand-600/15 text-brand-400 font-medium'
            : 'text-dark-300 hover:text-dark-100 hover:bg-dark-800'
        }`}
      >
        <div className="flex items-center space-x-1.5 truncate">
          <FileCode className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-brand-400' : 'text-dark-400'}`} />
          {renamingId === file._id ? (
            <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                autoFocus
                value={renamedName}
                onChange={(e) => setRenamedName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRenameSubmit(file._id);
                  if (e.key === 'Escape') setRenamingId(null);
                }}
                className="bg-dark-900 border border-brand-500 rounded px-1 py-0.5 text-xs text-white outline-none w-28"
              />
              <button
                onClick={() => handleRenameSubmit(file._id)}
                className="text-emerald-400 hover:text-emerald-300 p-0.5"
              >
                <Check className="w-3 h-3" />
              </button>
              <button
                onClick={() => setRenamingId(null)}
                className="text-dark-400 hover:text-dark-200 p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <span className="truncate">{file.name}</span>
          )}
        </div>

        {/* Right Status & Actions */}
        <div className="flex items-center space-x-1.5 opacity-80 group-hover:opacity-100">
          {/* Active Collaborator Indicators */}
          {collaborators.map((c, i) => (
            <div
              key={i}
              title={`${c.name} (${c.activeFile?.mode === 'editing' ? 'Editing' : 'Viewing'})`}
              className="w-2.5 h-2.5 rounded-full border border-dark-900 animate-pulse"
              style={{ backgroundColor: c.color || '#3b82f6' }}
            />
          ))}

          {isUnsaved && (
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400" title="Unsaved changes" />
          )}

          {canEdit && (
            <div
              className="hidden group-hover:flex items-center space-x-1"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  setRenamingId(file._id);
                  setRenamedName(file.name);
                }}
                className="p-0.5 rounded text-dark-400 hover:text-dark-200 hover:bg-dark-700"
                title="Rename file"
              >
                <Edit2 className="w-3 h-3" />
              </button>
              <button
                onClick={() => {
                  if (confirm(`Delete ${file.name}?`)) {
                    deleteFile(file._id);
                  }
                }}
                className="p-0.5 rounded text-dark-400 hover:text-rose-400 hover:bg-dark-700"
                title="Delete file"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-dark-850 border-r border-dark-700 select-none">
      {/* File Explorer Header with Quick Actions */}
      <div className="p-3 border-b border-dark-700 flex items-center justify-between">
        <span className="text-[11px] font-bold text-dark-400 uppercase tracking-wider">
          Explorer
        </span>

        {canEdit && (
          <div className="flex items-center space-x-1">
            <button
              onClick={() => {
                setIsCreating('file');
                setNewItemName('');
              }}
              className="p-1 rounded text-dark-400 hover:text-dark-100 hover:bg-dark-800 transition-colors"
              title="New File"
            >
              <FilePlus className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setIsCreating('folder');
                setNewItemName('');
              }}
              className="p-1 rounded text-dark-400 hover:text-dark-100 hover:bg-dark-800 transition-colors"
              title="New Folder"
            >
              <FolderPlus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Creation Input Bar */}
      {isCreating && (
        <form onSubmit={handleCreateSubmit} className="p-2 bg-dark-800 border-b border-dark-700 flex items-center space-x-1.5">
          {isCreating === 'folder' ? (
            <Folder className="w-3.5 h-3.5 text-brand-400 shrink-0" />
          ) : (
            <FileCode className="w-3.5 h-3.5 text-brand-400 shrink-0" />
          )}
          <input
            type="text"
            autoFocus
            placeholder={isCreating === 'folder' ? 'folder_name' : 'filename.js'}
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setIsCreating(null);
            }}
            className="flex-1 bg-dark-900 border border-brand-500 rounded px-2 py-0.5 text-xs text-white outline-none"
          />
          <button type="submit" className="text-emerald-400 hover:text-emerald-300 p-0.5">
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsCreating(null)}
            className="text-dark-400 hover:text-dark-200 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </form>
      )}

      {/* Tree Content */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {Object.entries(tree.folders).map(([folderName, folderData]) =>
          renderFolderNode(folderName, folderData, 0)
        )}
        {tree.files.map((file) => renderFileNode(file, 0))}

        {files.length === 0 && (
          <div className="py-8 text-center text-xs text-dark-500">
            No files in workspace. Click + to create one.
          </div>
        )}
      </div>
    </div>
  );
}
