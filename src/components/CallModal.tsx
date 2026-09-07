import React, { useState, useEffect } from 'react';
import { HelperDriver } from '../types';
import { PhoneOff, Mic, MicOff, Volume2, Shield, User } from 'lucide-react';

interface CallModalProps {
  helper: HelperDriver;
  onEndCall: () => void;
}

export const CallModal: React.FC<CallModalProps> = ({ helper, onEndCall }) => {
  const [callDuration, setCallDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSpeaker, setIsSpeaker] = useState<boolean>(true);
  const [callState, setCallState] = useState<'connecting' | 'connected'>('connecting');

  useEffect(() => {
    const connectTimer = setTimeout(() => {
      setCallState('connected');
    }, 1500);

    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => {
      clearTimeout(connectTimer);
      clearInterval(timer);
    };
  }, []);

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1a1c1c]/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#2f3131] rounded-3xl p-6 text-white flex flex-col items-center justify-between shadow-2xl border border-white/10 min-h-[460px] animate-scaleUp">
        {/* Header Security Badge */}
        <div className="flex items-center gap-1.5 bg-white/10 text-white/80 px-3 py-1 rounded-full text-xs font-semibold">
          <Shield className="w-3.5 h-3.5 text-[#feb300]" />
          <span>Encrypted RapidHelp Dispatch Call</span>
        </div>

        {/* Driver Profile */}
        <div className="flex flex-col items-center gap-3 my-4">
          <div className="relative">
            <img
              src={helper.avatarUrl}
              alt={helper.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-[#b7131a] shadow-xl"
            />
            {callState === 'connected' && (
              <span className="absolute bottom-1 right-1 w-5 h-5 bg-[#15803d] border-2 border-[#2f3131] rounded-full animate-pulse"></span>
            )}
          </div>

          <div className="text-center">
            <h3 className="text-xl font-bold text-white">{helper.name}</h3>
            <p className="text-xs text-white/70 mt-0.5">{helper.role} • {helper.plate}</p>
            <div className="text-sm font-semibold text-[#feb300] mt-2">
              {callState === 'connecting' ? 'Connecting to technician...' : formatSeconds(callDuration)}
            </div>
          </div>
        </div>

        {/* Audio controls */}
        <div className="grid grid-cols-3 gap-4 w-full my-4">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-4 rounded-full flex flex-col items-center gap-1 transition-all cursor-pointer ${
              isMuted ? 'bg-[#b7131a] text-white' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            <span className="text-[10px] font-medium">{isMuted ? 'Unmute' : 'Mute'}</span>
          </button>

          <button
            onClick={() => setIsSpeaker(!isSpeaker)}
            className={`p-4 rounded-full flex flex-col items-center gap-1 transition-all cursor-pointer ${
              isSpeaker ? 'bg-[#005ea4] text-white' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Volume2 className="w-5 h-5" />
            <span className="text-[10px] font-medium">{isSpeaker ? 'Speaker On' : 'Earpiece'}</span>
          </button>

          <button
            onClick={onEndCall}
            className="p-4 rounded-full bg-white/10 text-white hover:bg-white/20 flex flex-col items-center gap-1 transition-all cursor-pointer"
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] font-medium">Driver Info</span>
          </button>
        </div>

        {/* End Call Button */}
        <button
          onClick={onEndCall}
          className="w-full h-14 bg-[#ba1a1a] hover:bg-[#93000a] text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all cursor-pointer"
        >
          <PhoneOff className="w-6 h-6" />
          <span>End Call</span>
        </button>
      </div>
    </div>
  );
};
