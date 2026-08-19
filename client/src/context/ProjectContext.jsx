import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';

const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [userRole, setUserRole] = useState('editor');
  const [files, setFiles] = useState([]);
  const [openFiles, setOpenFiles] = useState([]); // [{ _id, path, name, language }]
  const [activeFileId, setActiveFileId] = useState(null);
  const [fileContents, setFileContents] = useState({}); // { [fileId]: string }
  const [unsavedFiles, setUnsavedFiles] = useState(new Set()); // Set of fileIds
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Execution & Terminal state
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);

  // Changes and Activity state
  const [codeChanges, setCodeChanges] = useState([]);
  const [activities, setActivities] = useState([]);
  const [activeMeeting, setActiveMeeting] = useState(null);

  // Ref to hold current file contents for debounce autosave
  const fileContentsRef = useRef(fileContents);
  fileContentsRef.current = fileContents;

  const unsavedFilesRef = useRef(unsavedFiles);
  unsavedFilesRef.current = unsavedFiles;

  // Active file object
  const activeFile = files.find((f) => f._id === activeFileId) || null;

  // Load project by ID
  const loadProject = useCallback(async (projectId) => {
    if (!projectId) return;
    setLoading(true);
    setError(null);

    try {
      const [projRes, filesRes, changesRes, actRes] = await Promise.all([
        api.getProjectById(projectId),
        api.getFiles(projectId),
        api.getChanges(projectId),
        api.getActivities(projectId),
      ]);

      if (projRes.success && projRes.project) {
        setProject(projRes.project);
        setUserRole(projRes.userRole || 'editor');
        setActiveMeeting(projRes.project.activeMeeting || null);
      }

      if (filesRes.success && filesRes.files) {
        setFiles(filesRes.files);

        // Preload initial file contents
        const contentsMap = {};
        filesRes.files.forEach((f) => {
          if (!f.isDirectory) {
            contentsMap[f._id] = f.content || '';
          }
        });
        setFileContents(contentsMap);

        // Open first readable file (e.g. index.js or README.md or App.jsx) if no file open
        const nonDirFiles = filesRes.files.filter((f) => !f.isDirectory);
        if (nonDirFiles.length > 0 && openFiles.length === 0) {
          const defaultFile =
            nonDirFiles.find((f) => f.name.includes('index') || f.name.includes('App') || f.name.includes('main')) ||
            nonDirFiles[0];
          setOpenFiles([defaultFile]);
          setActiveFileId(defaultFile._id);
        }
      }

      if (changesRes.success) {
        setCodeChanges(changesRes.changes || []);
      }

      if (actRes.success) {
        setActivities(actRes.activities || []);
      }
    } catch (err) {
      console.error('[ProjectContext] Failed to load project:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [openFiles.length]);

  // Join Socket Room when project and socket are ready
  useEffect(() => {
    if (!socket || !project?._id || !isConnected) return;

    socket.emit('join-project', { projectId: project._id });

    function onFileTreeUpdated({ action, file, fileId, filePath }) {
      if (action === 'created' && file) {
        setFiles((prev) => {
          if (prev.some((f) => f._id === file._id)) return prev;
          return [...prev, file].sort((a, b) => (b.isDirectory ? 1 : 0) - (a.isDirectory ? 1 : 0));
        });
        if (!file.isDirectory) {
          setFileContents((prev) => ({ ...prev, [file._id]: file.content || '' }));
        }
      } else if (action === 'renamed' && file) {
        setFiles((prev) => prev.map((f) => (f._id === file._id ? file : f)));
        setOpenFiles((prev) => prev.map((f) => (f._id === file._id ? { ...f, name: file.name, path: file.path } : f)));
      } else if (action === 'deleted' && (fileId || filePath)) {
        setFiles((prev) => prev.filter((f) => f._id !== fileId && !f.path.startsWith(filePath)));
        setOpenFiles((prev) => prev.filter((f) => f._id !== fileId && !f.path.startsWith(filePath)));
        if (activeFileId === fileId) {
          setActiveFileId(null);
        }
      }
    }

    function onCodeChangeRecorded(change) {
      setCodeChanges((prev) => [change, ...prev.filter((c) => c._id !== change._id)].slice(0, 100));
    }

    function onActivityRecorded(activity) {
      setActivities((prev) => [activity, ...prev.filter((a) => a._id !== activity._id)].slice(0, 100));
    }

    function onMeetingStatusChanged(meeting) {
      setActiveMeeting(meeting);
    }

    socket.on('file-tree-updated', onFileTreeUpdated);
    socket.on('code-change-recorded', onCodeChangeRecorded);
    socket.on('activity-recorded', onActivityRecorded);
    socket.on('meeting-status-changed', onMeetingStatusChanged);

    return () => {
      socket.emit('leave-project', { projectId: project._id });
      socket.off('file-tree-updated', onFileTreeUpdated);
      socket.off('code-change-recorded', onCodeChangeRecorded);
      socket.off('activity-recorded', onActivityRecorded);
      socket.off('meeting-status-changed', onMeetingStatusChanged);
    };
  }, [socket, project?._id, isConnected, activeFileId]);

  // Notify socket when active file changes
  useEffect(() => {
    if (!socket || !project?._id || !activeFile) return;

    socket.emit('file-opened', {
      projectId: project._id,
      fileId: activeFile._id,
      filePath: activeFile.path,
      fileName: activeFile.name,
      mode: userRole === 'viewer' ? 'viewing' : 'editing',
    });

    return () => {
      socket.emit('file-closed', {
        projectId: project._id,
        fileId: activeFile._id,
      });
    };
  }, [socket, project?._id, activeFile?._id, userRole]);

  // Open file in tabs
  const openFile = useCallback((file) => {
    if (file.isDirectory) return;

    setOpenFiles((prev) => {
      if (prev.some((f) => f._id === file._id)) {
        return prev;
      }
      return [...prev, file];
    });

    setActiveFileId(file._id);

    // If file content not loaded in state yet, load it
    if (fileContents[file._id] === undefined) {
      setFileContents((prev) => ({ ...prev, [file._id]: file.content || '' }));
    }
  }, [fileContents]);

  // Close file tab
  const closeFile = useCallback((fileIdToClose) => {
    setOpenFiles((prev) => {
      const remaining = prev.filter((f) => f._id !== fileIdToClose);
      if (activeFileId === fileIdToClose) {
        if (remaining.length > 0) {
          setActiveFileId(remaining[remaining.length - 1]._id);
        } else {
          setActiveFileId(null);
        }
      }
      return remaining;
    });
  }, [activeFileId]);

  // Update file content in local memory and mark dirty
  const updateContent = useCallback((fileId, newContent) => {
    setFileContents((prev) => ({
      ...prev,
      [fileId]: newContent,
    }));

    setUnsavedFiles((prev) => {
      const next = new Set(prev);
      next.add(fileId);
      return next;
    });
  }, []);

  // Save file to database
  const saveFile = useCallback(async (fileId) => {
    if (!project?._id || !fileId) return;

    const content = fileContentsRef.current[fileId];
    if (content === undefined) return;

    try {
      const res = await api.updateFileContent(project._id, fileId, content);
      if (res.success) {
        setUnsavedFiles((prev) => {
          const next = new Set(prev);
          next.delete(fileId);
          return next;
        });
        if (res.codeChange) {
          setCodeChanges((prev) => [res.codeChange, ...prev]);
        }
      }
    } catch (err) {
      console.error('[ProjectContext] Save failed:', err.message);
    }
  }, [project?._id]);

  // Save all unsaved files
  const saveAll = useCallback(async () => {
    const ids = Array.from(unsavedFilesRef.current);
    await Promise.all(ids.map((id) => saveFile(id)));
  }, [saveFile]);

  // Auto-save debounce effect
  useEffect(() => {
    if (unsavedFiles.size === 0) return;

    const timer = setTimeout(() => {
      saveAll();
    }, 2500);

    return () => clearTimeout(timer);
  }, [unsavedFiles, saveAll]);

  // Create new file or folder
  const createFile = async ({ name, path, isDirectory = false, content = '' }) => {
    if (!project?._id) return { success: false, message: 'No project selected' };

    try {
      const res = await api.createFile(project._id, {
        name,
        path,
        isDirectory,
        content,
      });

      if (res.success && res.file) {
        setFiles((prev) => [...prev, res.file].sort((a, b) => (b.isDirectory ? 1 : 0) - (a.isDirectory ? 1 : 0)));
        if (!isDirectory) {
          setFileContents((prev) => ({ ...prev, [res.file._id]: res.file.content || '' }));
          openFile(res.file);
        }
        return { success: true, file: res.file };
      }
      return { success: false, message: res.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Rename file
  const renameFile = async (fileId, newName) => {
    if (!project?._id || !fileId) return { success: false };

    try {
      const res = await api.renameFile(project._id, fileId, newName);
      if (res.success && res.file) {
        setFiles((prev) => prev.map((f) => (f._id === fileId ? res.file : f)));
        setOpenFiles((prev) =>
          prev.map((f) => (f._id === fileId ? { ...f, name: res.file.name, path: res.file.path } : f))
        );
        return { success: true, file: res.file };
      }
      return { success: false, message: res.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Delete file
  const deleteFile = async (fileId) => {
    if (!project?._id || !fileId) return { success: false };

    const targetFile = files.find((f) => f._id === fileId);
    try {
      const res = await api.deleteFile(project._id, fileId);
      if (res.success) {
        setFiles((prev) => prev.filter((f) => f._id !== fileId && (!targetFile?.isDirectory || !f.path.startsWith(targetFile.path))));
        closeFile(fileId);
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Run active file in isolated sandbox
  const runActiveFile = async () => {
    if (!project?._id || !activeFile) {
      setExecutionResult({
        stdout: '',
        stderr: 'No active file selected to run.',
        exitCode: 1,
        executionTime: '0.000',
      });
      return;
    }

    setIsExecuting(true);
    setExecutionResult(null);

    // Save active file first
    await saveFile(activeFile._id);

    try {
      const currentCode = fileContents[activeFile._id] || activeFile.content || '';
      const res = await api.runCode(project._id, {
        language: activeFile.language,
        code: currentCode,
        fileName: activeFile.name,
      });

      if (res.success && res.result) {
        setExecutionResult(res.result);
      } else {
        setExecutionResult({
          stdout: '',
          stderr: res.message || 'Execution error',
          exitCode: 1,
          executionTime: '0.000',
        });
      }
    } catch (err) {
      setExecutionResult({
        stdout: '',
        stderr: err.message || 'Failed to execute code in sandbox',
        exitCode: 1,
        executionTime: '0.000',
      });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        project,
        userRole,
        files,
        openFiles,
        activeFileId,
        activeFile,
        fileContents,
        unsavedFiles,
        loading,
        error,
        isExecuting,
        executionResult,
        codeChanges,
        activities,
        activeMeeting,
        loadProject,
        openFile,
        closeFile,
        setActiveFileId,
        updateContent,
        saveFile,
        saveAll,
        createFile,
        renameFile,
        deleteFile,
        runActiveFile,
        setExecutionResult,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
