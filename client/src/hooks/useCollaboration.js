import { useEffect, useRef, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';

export function useCollaboration({ editorRef, monacoRef, fileId, filePath, fileName }) {
  const { socket, isConnected } = useSocket();
  const { project, updateContent, userRole } = useProject();
  const { user } = useAuth();

  const isApplyingRemoteRef = useRef(false);
  const typingTimerRef = useRef(null);
  const cursorDecorationsRef = useRef(new Map()); // Map of socketId -> decorationIds[]
  const [activePeersInFile, setActivePeersInFile] = useState([]);

  // Setup Remote Delta & Cursor Listeners
  useEffect(() => {
    if (!socket || !project?._id || !fileId || !isConnected) return;

    // Receive Remote Code Deltas
    function onCodeDeltaReceived({ fileId: targetFileId, delta, senderId, userName, userColor }) {
      if (targetFileId !== fileId || !editorRef.current || !monacoRef.current) return;
      if (senderId === socket.id) return;

      const editor = editorRef.current;
      const model = editor.getModel();
      if (!model) return;

      isApplyingRemoteRef.current = true;

      try {
        if (delta && delta.range && delta.text !== undefined) {
          // Precise Monaco range edit
          editor.executeEdits('remote-collaborator', [
            {
              range: new monacoRef.current.Range(
                delta.range.startLineNumber,
                delta.range.startColumn,
                delta.range.endLineNumber,
                delta.range.endColumn
              ),
              text: delta.text,
              forceMoveMarkers: true,
            },
          ]);
        } else if (delta && delta.fullText !== undefined) {
          // Full buffer sync fallback
          const position = editor.getPosition();
          model.setValue(delta.fullText);
          if (position) editor.setPosition(position);
        }

        // Sync local memory state
        updateContent(fileId, model.getValue());
      } catch (err) {
        console.warn('[useCollaboration] Error applying remote delta:', err);
      } finally {
        isApplyingRemoteRef.current = false;
      }
    }

    // Receive Remote Cursor & Selection Activity
    function onCursorActivityReceived({ fileId: targetFileId, socketId, userId, userName, userColor, cursor, selection }) {
      if (targetFileId !== fileId || !editorRef.current || !monacoRef.current) return;
      if (socketId === socket.id) return;

      const editor = editorRef.current;
      const monaco = monacoRef.current;
      const model = editor.getModel();
      if (!model) return;

      // Maintain list of active peers in this file
      setActivePeersInFile((prev) => {
        const filtered = prev.filter((p) => p.socketId !== socketId);
        return [...filtered, { socketId, userId, userName, userColor, cursor, selection, lastSeen: Date.now() }];
      });

      const decorations = [];

      // 1. Selection Highlight Decoration
      if (
        selection &&
        (selection.startLineNumber !== selection.endLineNumber || selection.startColumn !== selection.endColumn)
      ) {
        decorations.push({
          range: new monaco.Range(
            selection.startLineNumber,
            selection.startColumn,
            selection.endLineNumber,
            selection.endColumn
          ),
          options: {
            className: `remote-selection selection-${socketId}`,
            inlineClassName: `remote-selection-inline selection-${socketId}`,
            isWholeLine: false,
          },
        });
      }

      // 2. Cursor Caret & Floating Nametag Decoration
      if (cursor && cursor.lineNumber && cursor.column) {
        decorations.push({
          range: new monaco.Range(cursor.lineNumber, cursor.column, cursor.lineNumber, cursor.column),
          options: {
            className: `remote-cursor cursor-${socketId}`,
            before: {
              content: ` ${userName} `,
              inlineClassName: `remote-cursor-badge badge-${socketId}`,
            },
          },
        });
      }

      // Inject dynamic CSS class for user cursor color if not present
      const styleId = `style-cursor-${socketId}`;
      let styleEl = document.getElementById(styleId);
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = styleId;
        styleEl.innerHTML = `
          .selection-${socketId} { background-color: ${userColor}40 !important; }
          .cursor-${socketId} { border-left: 2px solid ${userColor} !important; }
          .badge-${socketId} { background-color: ${userColor} !important; }
        `;
        document.head.appendChild(styleEl);
      }

      // Apply decorations
      const oldDecorations = cursorDecorationsRef.current.get(socketId) || [];
      const newDecorations = editor.deltaDecorations(oldDecorations, decorations);
      cursorDecorationsRef.current.set(socketId, newDecorations);
    }

    // Clean up peer decorations when someone leaves
    function onPresenceUpdate(users) {
      const currentSocketIds = new Set(users.map((u) => u.socketId));
      for (const [sId, decoIds] of cursorDecorationsRef.current.entries()) {
        if (!currentSocketIds.has(sId) && editorRef.current) {
          editorRef.current.deltaDecorations(decoIds, []);
          cursorDecorationsRef.current.delete(sId);
        }
      }
    }

    socket.on('code-delta-received', onCodeDeltaReceived);
    socket.on('cursor-activity-received', onCursorActivityReceived);
    socket.on('presence-update', onPresenceUpdate);

    return () => {
      socket.off('code-delta-received', onCodeDeltaReceived);
      socket.off('cursor-activity-received', onCursorActivityReceived);
      socket.off('presence-update', onPresenceUpdate);

      // Clean up decorations on file change or unmount
      if (editorRef.current) {
        for (const decoIds of cursorDecorationsRef.current.values()) {
          editorRef.current.deltaDecorations(decoIds, []);
        }
        cursorDecorationsRef.current.clear();
      }
    };
  }, [socket, project?._id, fileId, isConnected, editorRef, monacoRef, updateContent]);

  // Bind Editor Event Listeners
  const bindEditorEvents = (editor, monaco) => {
    if (!editor || !socket || !project?._id || !fileId) return;

    // 1. Listen for local content changes
    const contentDisposable = editor.onDidChangeModelContent((e) => {
      if (isApplyingRemoteRef.current) return;
      if (userRole === 'viewer') return; // Read-only

      const model = editor.getModel();
      if (!model) return;

      const fullText = model.getValue();
      updateContent(fileId, fullText);

      // Broadcast each change delta
      e.changes.forEach((change) => {
        socket.emit('code-delta', {
          projectId: project._id,
          fileId,
          delta: {
            range: change.range,
            text: change.text,
            rangeLength: change.rangeLength,
            fullText,
          },
        });
      });

      // Typing notification
      socket.emit('typing-start', {
        projectId: project._id,
        fileId,
        fileName,
      });

      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        socket.emit('typing-stop', {
          projectId: project._id,
          fileId,
        });
      }, 1500);
    });

    // 2. Listen for cursor and selection movements
    const cursorDisposable = editor.onDidChangeCursorPosition((e) => {
      const position = e.position;
      const selection = editor.getSelection();

      socket.emit('cursor-activity', {
        projectId: project._id,
        fileId,
        cursor: {
          lineNumber: position.lineNumber,
          column: position.column,
        },
        selection: selection
          ? {
              startLineNumber: selection.startLineNumber,
              startColumn: selection.startColumn,
              endLineNumber: selection.endLineNumber,
              endColumn: selection.endColumn,
            }
          : null,
      });
    });

    const selectionDisposable = editor.onDidChangeCursorSelection((e) => {
      const selection = e.selection;
      const position = editor.getPosition();

      socket.emit('cursor-activity', {
        projectId: project._id,
        fileId,
        cursor: position
          ? {
              lineNumber: position.lineNumber,
              column: position.column,
            }
          : null,
        selection: {
          startLineNumber: selection.startLineNumber,
          startColumn: selection.startColumn,
          endLineNumber: selection.endLineNumber,
          endColumn: selection.endColumn,
        },
      });
    });

    return () => {
      contentDisposable.dispose();
      cursorDisposable.dispose();
      selectionDisposable.dispose();
    };
  };

  return {
    bindEditorEvents,
    activePeersInFile,
  };
}
