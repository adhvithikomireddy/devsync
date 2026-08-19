import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSocket } from '../services/socket';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [presenceList, setPresenceList] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!token || !user) {
      setSocket(null);
      setIsConnected(false);
      return;
    }

    const s = getSocket();
    setSocket(s);

    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onPresenceUpdate(users) {
      setPresenceList(users || []);
    }

    function onUserTyping({ fileId, userName, userColor }) {
      setTypingUsers((prev) => ({
        ...prev,
        [fileId]: { userName, userColor, timestamp: Date.now() },
      }));

      // Auto-clear typing indicator after 3 seconds
      setTimeout(() => {
        setTypingUsers((prev) => {
          const copy = { ...prev };
          if (copy[fileId] && Date.now() - copy[fileId].timestamp >= 2800) {
            delete copy[fileId];
          }
          return copy;
        });
      }, 3000);
    }

    function onUserStoppedTyping({ fileId }) {
      setTypingUsers((prev) => {
        const copy = { ...prev };
        delete copy[fileId];
        return copy;
      });
    }

    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);
    s.on('presence-update', onPresenceUpdate);
    s.on('user-typing', onUserTyping);
    s.on('user-stopped-typing', onUserStoppedTyping);

    if (s.connected) {
      setIsConnected(true);
    }

    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
      s.off('presence-update', onPresenceUpdate);
      s.off('user-typing', onUserTyping);
      s.off('user-stopped-typing', onUserStoppedTyping);
    };
  }, [token, user]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        presenceList,
        typingUsers,
        unreadCount,
        setUnreadCount,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
