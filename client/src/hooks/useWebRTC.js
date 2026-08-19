import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ],
};

/**
 * Creates an animated canvas video stream for testing or when physical camera is unavailable
 */
function createFallbackVideoStream(userName = 'User', userColor = '#3b82f6') {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext('2d');

  let frame = 0;
  function draw() {
    frame++;
    // Dark animated gradient background
    const grad = ctx.createLinearGradient(0, 0, 640, 480);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(1, '#1e293b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 640, 480);

    // Glowing avatar circle
    ctx.save();
    ctx.shadowColor = userColor;
    ctx.shadowBlur = 20 + Math.sin(frame * 0.05) * 10;
    ctx.beginPath();
    ctx.arc(320, 220, 70, 0, Math.PI * 2);
    ctx.fillStyle = userColor;
    ctx.fill();
    ctx.restore();

    // Initial letter in avatar
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 54px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText((userName[0] || 'D').toUpperCase(), 320, 220);

    // User name label below
    ctx.fillStyle = '#f8fafc';
    ctx.font = '600 20px system-ui, -apple-system, sans-serif';
    ctx.fillText(userName, 320, 330);

    // Active status pill
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(280, 370, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 13px system-ui, -apple-system, sans-serif';
    ctx.fillText('Live DevSync Call', 340, 370);

    requestAnimationFrame(draw);
  }
  draw();

  const stream = canvas.captureStream(24);

  // Add dummy silent audio track
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const dst = audioCtx.createMediaStreamDestination();
    const gain = audioCtx.createGain();
    gain.gain.value = 0; // completely muted dummy carrier
    osc.connect(gain);
    gain.connect(dst);
    osc.start();
    const audioTrack = dst.stream.getAudioTracks()[0];
    if (audioTrack) stream.addTrack(audioTrack);
  } catch (e) {
    // ignore audio fallback failure
  }

  return stream;
}

export function useWebRTC({ projectId, enabled = false }) {
  const { socket } = useSocket();
  const { user } = useAuth();

  const [localStream, setLocalStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [remotePeers, setRemotePeers] = useState({}); // { [socketId]: { user, stream, isAudioMuted, isVideoOff, isScreenSharing } }
  
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [error, setError] = useState(null);

  const peerConnectionsRef = useRef(new Map()); // Map of socketId -> RTCPeerConnection
  const iceCandidateQueuesRef = useRef(new Map()); // Map of socketId -> RTCIceCandidate[]
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const isJoinedRef = useRef(false);

  // Initialize Local Media Stream
  const initLocalStream = useCallback(async () => {
    if (localStreamRef.current) return localStreamRef.current;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 24 } },
        audio: true,
      });
      localStreamRef.current = stream;
      setLocalStream(stream);
      return stream;
    } catch (err) {
      console.warn('[WebRTC] Camera/Mic hardware access unavailable, using simulated stream:', err.message);
      const fallbackStream = createFallbackVideoStream(user?.name || 'Engineer', user?.color || '#3b82f6');
      localStreamRef.current = fallbackStream;
      setLocalStream(fallbackStream);
      return fallbackStream;
    }
  }, [user]);

  // Drain ICE Candidate Queue once remote description is set
  const drainIceCandidates = useCallback(async (targetSocketId, pc) => {
    const queue = iceCandidateQueuesRef.current.get(targetSocketId);
    if (queue && queue.length > 0) {
      for (const candidate of queue) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.warn('[WebRTC] Error draining ICE candidate:', err.message);
        }
      }
      iceCandidateQueuesRef.current.set(targetSocketId, []);
    }
  }, []);

  // Create Peer Connection
  const createPeerConnection = useCallback(
    (targetSocketId, targetUser) => {
      if (peerConnectionsRef.current.has(targetSocketId)) {
        return peerConnectionsRef.current.get(targetSocketId);
      }

      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnectionsRef.current.set(targetSocketId, pc);
      iceCandidateQueuesRef.current.set(targetSocketId, []);

      // Attach local stream tracks to this peer connection
      const activeStream = screenStreamRef.current || localStreamRef.current;
      if (activeStream) {
        activeStream.getTracks().forEach((track) => {
          pc.addTrack(track, activeStream);
        });
      }

      // Handle local ICE candidates and emit to peer
      pc.onicecandidate = (event) => {
        if (event.candidate && socket) {
          socket.emit('webrtc-ice-candidate', {
            targetSocketId,
            candidate: event.candidate,
          });
        }
      };

      // Handle Remote Stream Tracks
      pc.ontrack = (event) => {
        console.log(`[WebRTC] Received remote stream track (${event.track.kind}) from:`, targetSocketId);
        const remoteStream = event.streams[0] || new MediaStream([event.track]);
        setRemotePeers((prev) => ({
          ...prev,
          [targetSocketId]: {
            user: targetUser || { name: 'Teammate', color: '#6366f1' },
            stream: remoteStream,
            isAudioMuted: false,
            isVideoOff: false,
            isScreenSharing: false,
          },
        }));
      };

      pc.onconnectionstatechange = () => {
        console.log(`[WebRTC] Connection state with ${targetSocketId}:`, pc.connectionState);
        if (
          pc.connectionState === 'disconnected' ||
          pc.connectionState === 'failed' ||
          pc.connectionState === 'closed'
        ) {
          setRemotePeers((prev) => {
            const copy = { ...prev };
            delete copy[targetSocketId];
            return copy;
          });
          peerConnectionsRef.current.delete(targetSocketId);
          iceCandidateQueuesRef.current.delete(targetSocketId);
        }
      };

      return pc;
    },
    [socket]
  );

  // Join Meeting
  const joinMeeting = useCallback(async () => {
    if (!socket || !projectId || isJoinedRef.current) return;
    setError(null);

    try {
      const stream = await initLocalStream();
      socket.emit('webrtc-join-room', { projectId, roomId: `meeting-${projectId}` });
      isJoinedRef.current = true;
      setIsJoined(true);
      return stream;
    } catch (err) {
      console.error('[WebRTC] joinMeeting error:', err);
      setError(err.message);
    }
  }, [socket, projectId, initLocalStream]);

  // Leave Meeting
  const leaveMeeting = useCallback(() => {
    if (!isJoinedRef.current) return;
    isJoinedRef.current = false;
    setIsJoined(false);

    if (socket && projectId) {
      socket.emit('webrtc-leave-room', { projectId });
    }

    // Stop local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }

    // Stop screen share tracks
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
      setScreenStream(null);
    }

    // Close all peer connections
    for (const pc of peerConnectionsRef.current.values()) {
      try {
        pc.close();
      } catch (e) {}
    }
    peerConnectionsRef.current.clear();
    iceCandidateQueuesRef.current.clear();
    setRemotePeers({});
    setIsScreenSharing(false);
  }, [socket, projectId]);

  // Setup Signaling Listeners
  useEffect(() => {
    if (!socket || !isJoined) return;

    // 1. A new peer joined the meeting room -> create offer
    async function onPeerJoined({ socketId: remoteSocketId, user: remoteUser }) {
      console.log('[WebRTC] Peer joined room:', remoteSocketId, remoteUser?.name);
      try {
        const pc = createPeerConnection(remoteSocketId, remoteUser);
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });
        await pc.setLocalDescription(offer);

        socket.emit('webrtc-offer', {
          targetSocketId: remoteSocketId,
          sdp: pc.localDescription,
        });
      } catch (err) {
        console.error('[WebRTC] Error creating offer for peer:', err);
      }
    }

    // 2. Received Offer -> set remote description, drain candidates, and create answer
    async function onOffer({ senderSocketId, user: remoteUser, sdp }) {
      console.log('[WebRTC] Received offer from:', senderSocketId);
      try {
        const pc = createPeerConnection(senderSocketId, remoteUser);
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        await drainIceCandidates(senderSocketId, pc);

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit('webrtc-answer', {
          targetSocketId: senderSocketId,
          sdp: pc.localDescription,
        });
      } catch (err) {
        console.error('[WebRTC] Error responding to offer:', err);
      }
    }

    // 3. Received Answer -> set remote description and drain candidates
    async function onAnswer({ senderSocketId, sdp }) {
      console.log('[WebRTC] Received answer from:', senderSocketId);
      try {
        const pc = peerConnectionsRef.current.get(senderSocketId);
        if (pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          await drainIceCandidates(senderSocketId, pc);
        }
      } catch (err) {
        console.error('[WebRTC] Error setting answer:', err);
      }
    }

    // 4. Received ICE Candidate
    async function onIceCandidate({ senderSocketId, candidate }) {
      if (!candidate) return;
      const pc = peerConnectionsRef.current.get(senderSocketId);
      if (pc && pc.remoteDescription && pc.remoteDescription.type) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.warn('[WebRTC] Error adding ICE candidate:', err);
        }
      } else {
        // Queue candidate until remote description is set
        const queue = iceCandidateQueuesRef.current.get(senderSocketId) || [];
        queue.push(candidate);
        iceCandidateQueuesRef.current.set(senderSocketId, queue);
      }
    }

    // 5. Peer Media Toggled
    function onPeerMediaToggled({ socketId: remoteSocketId, isAudioMuted, isVideoOff, isScreenSharing }) {
      setRemotePeers((prev) => {
        if (!prev[remoteSocketId]) return prev;
        return {
          ...prev,
          [remoteSocketId]: {
            ...prev[remoteSocketId],
            isAudioMuted: isAudioMuted !== undefined ? isAudioMuted : prev[remoteSocketId].isAudioMuted,
            isVideoOff: isVideoOff !== undefined ? isVideoOff : prev[remoteSocketId].isVideoOff,
            isScreenSharing: isScreenSharing !== undefined ? isScreenSharing : prev[remoteSocketId].isScreenSharing,
          },
        };
      });
    }

    // 6. Peer Left
    function onPeerLeft({ socketId: remoteSocketId }) {
      console.log('[WebRTC] Peer left room:', remoteSocketId);
      const pc = peerConnectionsRef.current.get(remoteSocketId);
      if (pc) {
        pc.close();
        peerConnectionsRef.current.delete(remoteSocketId);
      }
      setRemotePeers((prev) => {
        const copy = { ...prev };
        delete copy[remoteSocketId];
        return copy;
      });
    }

    socket.on('webrtc-peer-joined', onPeerJoined);
    socket.on('webrtc-offer', onOffer);
    socket.on('webrtc-answer', onAnswer);
    socket.on('webrtc-ice-candidate', onIceCandidate);
    socket.on('webrtc-peer-media-toggled', onPeerMediaToggled);
    socket.on('webrtc-peer-left', onPeerLeft);

    return () => {
      socket.off('webrtc-peer-joined', onPeerJoined);
      socket.off('webrtc-offer', onOffer);
      socket.off('webrtc-answer', onAnswer);
      socket.off('webrtc-ice-candidate', onIceCandidate);
      socket.off('webrtc-peer-media-toggled', onPeerMediaToggled);
      socket.off('webrtc-peer-left', onPeerLeft);
    };
  }, [socket, isJoined, createPeerConnection, drainIceCandidates]);

  // Toggle Audio Mute
  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        const newMuted = !audioTrack.enabled;
        setIsAudioMuted(newMuted);

        if (socket && projectId) {
          socket.emit('webrtc-media-toggle', {
            projectId,
            isAudioMuted: newMuted,
          });
        }
      }
    }
  };

  // Toggle Video Camera
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        const newOff = !videoTrack.enabled;
        setIsVideoOff(newOff);

        if (socket && projectId) {
          socket.emit('webrtc-media-toggle', {
            projectId,
            isVideoOff: newOff,
          });
        }
      }
    }
  };

  // Toggle Screen Sharing
  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screen = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        screenStreamRef.current = screen;
        setScreenStream(screen);
        setIsScreenSharing(true);

        const screenTrack = screen.getVideoTracks()[0];

        // Replace video track for all active peer connections
        for (const pc of peerConnectionsRef.current.values()) {
          const senders = pc.getSenders();
          const videoSender = senders.find((s) => s.track && s.track.kind === 'video');
          if (videoSender) {
            videoSender.replaceTrack(screenTrack);
          }
        }

        // Listen for screen share stopped from browser native bar
        screenTrack.onended = () => {
          stopScreenShare();
        };

        if (socket && projectId) {
          socket.emit('webrtc-media-toggle', {
            projectId,
            isScreenSharing: true,
          });
        }
      } catch (err) {
        console.warn('[WebRTC] Screen share cancelled or failed:', err.message);
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
      setScreenStream(null);
    }
    setIsScreenSharing(false);

    // Restore camera track
    if (localStreamRef.current) {
      const cameraTrack = localStreamRef.current.getVideoTracks()[0];
      for (const pc of peerConnectionsRef.current.values()) {
        const senders = pc.getSenders();
        const videoSender = senders.find((s) => s.track && s.track.kind === 'video');
        if (videoSender && cameraTrack) {
          videoSender.replaceTrack(cameraTrack);
        }
      }
    }

    if (socket && projectId) {
      socket.emit('webrtc-media-toggle', {
        projectId,
        isScreenSharing: false,
      });
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      leaveMeeting();
    };
  }, [leaveMeeting]);

  return {
    localStream,
    screenStream,
    remotePeers,
    isAudioMuted,
    isVideoOff,
    isScreenSharing,
    isJoined,
    error,
    joinMeeting,
    leaveMeeting,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
  };
}
