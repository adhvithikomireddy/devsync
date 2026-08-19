import { io } from 'socket.io-client';

let socket = null;

export function getSocket() {
  if (!socket) {
    const token = localStorage.getItem('devsync_token');
    
    // Connect to server (either via proxy or relative)
    socket = io('/', {
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    socket.on('connect', () => {
      console.log('[DevSync Socket] Connected successfully with ID:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.warn('[DevSync Socket] Connection error:', err.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('[DevSync Socket] Disconnected:', reason);
    });
  }

  return socket;
}

export function resetSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  return getSocket();
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
