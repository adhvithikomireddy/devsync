import React, { useEffect, useRef } from 'react';
import { useWebRTC } from '../hooks/useWebRTC';
import { useAuth } from '../context/AuthContext';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  ScreenShare,
  PhoneOff,
  Users,
  Maximize2,
  Radio,
} from 'lucide-react';

export default function VideoRoom({ projectId, onClose }) {
  const { user } = useAuth();
  const {
    localStream,
    screenStream,
    remotePeers,
    isAudioMuted,
    isVideoOff,
    isScreenSharing,
    joinMeeting,
    leaveMeeting,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
  } = useWebRTC({ projectId, enabled: true });

  const localVideoRef = useRef(null);
  const screenVideoRef = useRef(null);

  // Auto-join meeting on mount once
  useEffect(() => {
    joinMeeting();
    return () => {
      leaveMeeting();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Attach local media stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play?.().catch(() => {});
    }
  }, [localStream]);

  // Attach screen share stream
  useEffect(() => {
    if (screenVideoRef.current && screenStream) {
      screenVideoRef.current.srcObject = screenStream;
      screenVideoRef.current.play?.().catch(() => {});
    }
  }, [screenStream]);

  const handleLeave = () => {
    leaveMeeting();
    if (onClose) onClose();
  };

  const peerList = Object.entries(remotePeers);

  return (
    <div className="h-full flex flex-col bg-dark-900 select-none overflow-hidden relative">
      {/* Top Header */}
      <div className="h-12 bg-dark-850 border-b border-dark-700 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
          <h3 className="text-xs font-bold text-dark-100 uppercase tracking-wider flex items-center space-x-1.5">
            <Radio className="w-3.5 h-3.5 text-rose-500" />
            <span>DevSync Live Conference</span>
          </h3>
        </div>

        <div className="flex items-center space-x-2 text-xs text-dark-400 font-medium">
          <Users className="w-3.5 h-3.5 text-brand-400" />
          <span>{peerList.length + 1} Connected {peerList.length === 0 ? 'Member' : 'Members'}</span>
        </div>
      </div>

      {/* Video Stream Grid */}
      <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto items-center justify-center">
        {/* Screen Share Tile (if active) */}
        {isScreenSharing && (
          <div className="relative aspect-video rounded-2xl bg-dark-950 border border-brand-500/50 overflow-hidden shadow-2xl col-span-full">
            <video
              ref={screenVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            />
            <div className="absolute bottom-3 left-3 bg-dark-900/80 backdrop-blur px-3 py-1 rounded-lg text-xs font-medium text-white flex items-center space-x-1.5 border border-dark-700">
              <ScreenShare className="w-3.5 h-3.5 text-brand-400" />
              <span>You are sharing your screen</span>
            </div>
          </div>
        )}

        {/* Local Participant Tile */}
        <div className="relative aspect-video rounded-2xl bg-dark-850 border border-dark-700 overflow-hidden shadow-lg flex items-center justify-center group">
          {isVideoOff ? (
            <div className="flex flex-col items-center justify-center space-y-2">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-md"
                style={{ backgroundColor: user?.color || '#3b82f6' }}
              >
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="text-xs text-dark-400 font-semibold">{user?.name} (Camera Muted)</span>
            </div>
          ) : (
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover transform -scale-x-100"
            />
          )}

          {/* Local Name Badge */}
          <div className="absolute bottom-3 left-3 bg-dark-900/85 backdrop-blur px-2.5 py-1 rounded-lg text-xs font-medium text-white flex items-center space-x-1.5 border border-dark-700 shadow">
            <span className="font-semibold">{user?.name} (You)</span>
            {isAudioMuted && <MicOff className="w-3 h-3 text-rose-400" />}
          </div>
        </div>

        {/* Remote Participants Tiles */}
        {peerList.map(([socketId, peer]) => {
          return (
            <RemotePeerVideo
              key={socketId}
              peer={peer}
            />
          );
        })}
      </div>

      {/* Meeting Floating Control Bar */}
      <div className="h-16 bg-dark-850 border-t border-dark-700 px-6 flex items-center justify-center space-x-4">
        {/* Mic Toggle */}
        <button
          onClick={toggleAudio}
          className={`p-3 rounded-full transition-all shadow-md ${
            isAudioMuted
              ? 'bg-rose-600 hover:bg-rose-500 text-white'
              : 'bg-dark-750 hover:bg-dark-700 text-dark-100'
          }`}
          title={isAudioMuted ? 'Unmute Microphone' : 'Mute Microphone'}
        >
          {isAudioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Camera Toggle */}
        <button
          onClick={toggleVideo}
          className={`p-3 rounded-full transition-all shadow-md ${
            isVideoOff
              ? 'bg-rose-600 hover:bg-rose-500 text-white'
              : 'bg-dark-750 hover:bg-dark-700 text-dark-100'
          }`}
          title={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
        >
          {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
        </button>

        {/* Screen Share Toggle */}
        <button
          onClick={toggleScreenShare}
          className={`p-3 rounded-full transition-all shadow-md ${
            isScreenSharing
              ? 'bg-brand-600 hover:bg-brand-500 text-white'
              : 'bg-dark-750 hover:bg-dark-700 text-dark-100'
          }`}
          title={isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
        >
          <ScreenShare className="w-5 h-5" />
        </button>

        {/* Leave Call Button */}
        <button
          onClick={handleLeave}
          className="p-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-md hover:scale-105 active:scale-95"
          title="Leave Meeting"
        >
          <PhoneOff className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function RemotePeerVideo({ peer }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && peer.stream) {
      videoRef.current.srcObject = peer.stream;
      videoRef.current.play?.().catch(() => {});
    }
  }, [peer.stream]);

  return (
    <div className="relative aspect-video rounded-2xl bg-dark-850 border border-dark-700 overflow-hidden shadow-lg flex items-center justify-center">
      {peer.isVideoOff ? (
        <div className="flex flex-col items-center justify-center space-y-2">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-md"
            style={{ backgroundColor: peer.user?.color || '#10b981' }}
          >
            {peer.user?.name?.charAt(0).toUpperCase() || 'C'}
          </div>
          <span className="text-xs text-dark-400 font-semibold">{peer.user?.name} (Camera Muted)</span>
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
      )}

      {/* Remote Name Badge */}
      <div className="absolute bottom-3 left-3 bg-dark-900/85 backdrop-blur px-2.5 py-1 rounded-lg text-xs font-medium text-white flex items-center space-x-1.5 border border-dark-700 shadow">
        <span className="font-semibold">{peer.user?.name}</span>
        {peer.isAudioMuted && <MicOff className="w-3 h-3 text-rose-400" />}
      </div>
    </div>
  );
}
