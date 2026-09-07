import React, { useState, useEffect } from 'react';
import { AssistanceRequest, RequestStatus } from '../types';
import { 
  Check, 
  Car, 
  MapPin, 
  MessageSquare, 
  Phone, 
  Star, 
  Truck, 
  Navigation, 
  ShieldCheck, 
  Wrench, 
  CheckCircle2, 
  Clock,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TrackingScreenProps {
  request: AssistanceRequest;
  onOpenChat: () => void;
  onStartCall: () => void;
  onCompleteService: () => void;
  onCancelRequest: () => void;
}

export const TrackingScreen: React.FC<TrackingScreenProps> = ({
  request,
  onOpenChat,
  onStartCall,
  onCompleteService,
  onCancelRequest,
}) => {
  const [currentStatus, setCurrentStatus] = useState<RequestStatus>(request.status || 'en_route');
  const [etaSeconds, setEtaSeconds] = useState<number>(120); // 2 minutes
  const [helperPosition, setHelperPosition] = useState<{ x: number; y: number }>({ x: 62, y: 38 });
  const [showRatingModal, setShowRatingModal] = useState<boolean>(false);
  const [ratingStars, setRatingStars] = useState<number>(5);
  const [tipAmount, setTipAmount] = useState<number>(5);
  const [ratingComment, setRatingComment] = useState<string>('Fast response and very professional help!');

  const helper = request.helper || {
    id: 'helper_marcus',
    name: 'Marcus T.',
    role: 'Towing & Roadside Specialist',
    rating: 4.9,
    rescuesCount: 124,
    vehicleDesc: 'White Ford F-450 Tow',
    plate: 'XYZ-1234',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuClaMg_QVQFOBzrfJRlGIN9fDjs4Yfj4O5R0ofC669gm9bOTLiNEPxxtAKOPacO4V7slW0jsynPZU2_AtkbqPwV0HaniruLLeHBqu-ygCxQMDjPXAEa2eow6NgZJqFUI3MP-KTQaAhniXREQsa9zz9_gEIaXiw85ydEkIQ7jc96VFBP_kaFSp7QNXO2kOxMxGthnZruv-05GF-sVJL6uA5Ne5s9LhHmu77gKaexM5VMvXBx796UXwE_',
    phone: '+1 (555) 345-8899',
    currentEtaMinutes: 2,
    distanceMiles: 0.8,
    location: { x: 60, y: 40 },
  };

  // Countdown timer simulation
  useEffect(() => {
    if (currentStatus === 'en_route' && etaSeconds > 0) {
      const interval = setInterval(() => {
        setEtaSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setCurrentStatus('arrived');
            return 0;
          }
          // Move vehicle closer along line towards (50, 50)
          setHelperPosition((pos) => ({
            x: Math.max(50, pos.x - 0.15),
            y: Math.min(50, pos.y + 0.15),
          }));
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentStatus, etaSeconds]);

  const formatEta = () => {
    if (etaSeconds === 0 || currentStatus === 'arrived') return 'Arrived at your location';
    const minutes = Math.floor(etaSeconds / 60);
    const seconds = etaSeconds % 60;
    return `${minutes > 0 ? `${minutes} min ` : ''}${seconds}s`;
  };

  const handleStepToArrived = () => {
    setCurrentStatus('arrived');
    setEtaSeconds(0);
    setHelperPosition({ x: 50, y: 50 });
  };

  const handleStepToInProgress = () => {
    setCurrentStatus('in_progress');
  };

  const handleStepToCompleted = () => {
    setCurrentStatus('completed');
    setShowRatingModal(true);
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  const handleSubmitRating = () => {
    setShowRatingModal(false);
    onCompleteService();
  };

  return (
    <div className="relative w-full h-[calc(100vh-56px)] mt-14 overflow-hidden flex flex-col font-['Inter',sans-serif]">
      {/* Live Map Canvas Background */}
      <div className="absolute inset-0 w-full h-full bg-[#eef2f5]">
        {/* Vector City Map SVG */}
        <svg className="w-full h-full absolute inset-0" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="track-grid" width="100" height="100" patternUnits="userSpaceOnUse">
              <rect width="92" height="92" fill="#ffffff" rx="6" opacity="0.9" />
              <rect x="4" y="4" width="84" height="84" fill="#f8fafc" rx="4" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#track-grid)" />

          {/* Parks & River */}
          <path d="M 65% 10% Q 80% 25% 90% 40% T 75% 60% Z" fill="#dcfce7" stroke="#bbf7d0" strokeWidth="2" />
          <path d="M 10% 50% Q 25% 65% 15% 85% Z" fill="#dcfce7" stroke="#bbf7d0" strokeWidth="2" />

          {/* Freeways & Arterials */}
          <path d="M 5% 75% C 25% 60%, 45% 45%, 65% 30%, 95% 15%" fill="none" stroke="#93c5fd" strokeWidth="14" opacity="0.6" />
          <path d="M 5% 75% C 25% 60%, 45% 45%, 65% 30%, 95% 15%" fill="none" stroke="#3b82f6" strokeWidth="8" />

          <path d="M 15% 20% Q 40% 30% 60% 45% T 85% 80%" fill="none" stroke="#cbd5e1" strokeWidth="6" />
          <path d="M 30% 0% L 30% 100%" fill="none" stroke="#cbd5e1" strokeWidth="5" />
          <path d="M 50% 0% L 50% 100%" fill="none" stroke="#cbd5e1" strokeWidth="5" />
          <path d="M 70% 0% L 70% 100%" fill="none" stroke="#cbd5e1" strokeWidth="5" />

          {/* Active Navigation Route between Helper and User */}
          <path
            d={`M 50% 48% L ${helperPosition.x}% ${helperPosition.y}%`}
            fill="none"
            stroke="#005ea4"
            strokeWidth="5"
            strokeDasharray="8 6"
            className="animate-pulse"
            opacity="0.8"
          />
        </svg>

        {/* User Marker (Pin at 50%, 48%) */}
        <div className="absolute top-[48%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
          <div className="relative w-10 h-10 rounded-full bg-[#005ea4]/20 flex items-center justify-center pulse-marker-ring">
            <div className="w-6 h-6 rounded-full bg-[#005ea4] text-white flex items-center justify-center shadow-lg border-2 border-white">
              <MapPin className="w-3.5 h-3.5 fill-white" />
            </div>
          </div>
          <span className="bg-white/95 text-[#1a1c1c] text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm mt-1 border border-[#e2e2e2]">
            Your Vehicle
          </span>
        </div>

        {/* Helper Vehicle Marker (Moving towards user) matching Screenshot 4 */}
        <div
          className="absolute z-30 flex flex-col items-center transition-all duration-1000 -translate-x-1/2 -translate-y-1/2"
          style={{ top: `${helperPosition.y}%`, left: `${helperPosition.x}%` }}
        >
          <div className="bg-[#b7131a] text-white p-2.5 rounded-full shadow-xl relative border-2 border-white animate-pulse">
            <Truck className="w-5 h-5" />
            {/* Directional pointer */}
            <div className="absolute -bottom-1 -left-1 text-[#b7131a] bg-white rounded-full p-0.5 border border-white shadow-xs">
              <Navigation className="w-3 h-3 rotate-45 fill-[#b7131a]" />
            </div>
          </div>
          <div className="bg-white text-[#1a1c1c] font-bold text-[11px] px-2 py-0.5 rounded-md shadow-md mt-1 border border-[#e2e2e2] whitespace-nowrap">
            {formatEta()}
          </div>
        </div>

        {/* Demo Simulation Fast-Forward Bar */}
        <div className="absolute top-3 left-4 right-4 z-40 bg-white/90 backdrop-blur-md px-3 py-2 rounded-xl shadow-md border border-[#e2e2e2] flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-[#1a1c1c]">
            <Clock className="w-4 h-4 text-[#005ea4]" />
            <span>Simulate Progress:</span>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={handleStepToArrived}
              className={`px-2 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                currentStatus === 'arrived'
                  ? 'bg-[#feb300] text-[#6a4800]'
                  : 'bg-[#f3f3f3] hover:bg-[#e8e8e8] text-[#1a1c1c]'
              }`}
            >
              1. Arrived
            </button>
            <button
              onClick={handleStepToInProgress}
              className={`px-2 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                currentStatus === 'in_progress'
                  ? 'bg-[#feb300] text-[#6a4800]'
                  : 'bg-[#f3f3f3] hover:bg-[#e8e8e8] text-[#1a1c1c]'
              }`}
            >
              2. Working
            </button>
            <button
              onClick={handleStepToCompleted}
              className="px-2 py-1 rounded-lg font-bold bg-[#b7131a] text-white hover:bg-[#db322f] transition-colors cursor-pointer"
            >
              3. Done & Rate
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Action Sheet matching Screenshot 4 */}
      <div className="fixed bottom-0 left-0 w-full bg-[#f9f9f9] rounded-t-3xl shadow-[0_-8px_24px_rgba(0,0,0,0.12)] z-50 flex flex-col p-4 md:p-6 border-t border-[#e4beb9]/60 max-w-lg mx-auto md:left-1/2 md:-translate-x-1/2 md:bottom-2 md:rounded-2xl">
        {/* Drag Handle Indicator */}
        <div className="w-12 h-1.5 bg-[#e2e2e2] rounded-full mx-auto mb-3 cursor-grab"></div>

        {/* Status Tracker Stepper matching Screenshot 4 */}
        <div className="mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-[#1a1c1c]">
                {currentStatus === 'en_route'
                  ? 'Help is on the way'
                  : currentStatus === 'arrived'
                  ? 'Driver has Arrived'
                  : currentStatus === 'in_progress'
                  ? 'Service In Progress'
                  : 'Assistance Completed'}
              </h3>
              <p className="text-sm text-[#5b403d] mt-0.5">
                {currentStatus === 'en_route' ? (
                  <>
                    ETA: <span className="font-bold text-[#b7131a]">{formatEta()}</span> (0.8 mi)
                  </>
                ) : currentStatus === 'arrived' ? (
                  <span className="text-[#005ea4] font-semibold">
                    Technician Marcus is at your vehicle.
                  </span>
                ) : (
                  <span className="text-[#15803d] font-semibold">
                    Fixing issue for {request.vehicle.make} {request.vehicle.model}
                  </span>
                )}
              </p>
            </div>

            <span className="bg-[#ffdad6] text-[#93000d] text-xs font-bold px-2.5 py-1 rounded-full">
              {request.issueTitle}
            </span>
          </div>

          {/* Stepper Progress Bar */}
          <div className="flex items-center justify-between relative mt-5 px-2">
            {/* Background Line */}
            <div className="absolute left-[12%] right-[12%] top-1/2 h-1 bg-[#e2e2e2] -translate-y-1/2 z-0"></div>

            {/* Active Highlight Line */}
            <div
              className="absolute left-[12%] top-1/2 h-1 bg-[#feb300] -translate-y-1/2 z-0 transition-all duration-500"
              style={{
                width:
                  currentStatus === 'accepted'
                    ? '0%'
                    : currentStatus === 'en_route'
                    ? '40%'
                    : '76%',
              }}
            ></div>

            {/* Step 1: Accepted */}
            <div className="flex flex-col items-center relative z-10">
              <div className="w-7 h-7 rounded-full bg-[#feb300] text-[#6a4800] flex items-center justify-center shadow-sm">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <span className="text-[11px] font-medium text-[#5b403d] mt-1">Accepted</span>
            </div>

            {/* Step 2: En Route */}
            <div className="flex flex-col items-center relative z-10">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shadow-sm border-2 border-white ${
                  currentStatus === 'en_route'
                    ? 'bg-[#feb300] text-[#6a4800] animate-pulse'
                    : currentStatus === 'arrived' || currentStatus === 'in_progress' || currentStatus === 'completed'
                    ? 'bg-[#feb300] text-[#6a4800]'
                    : 'bg-[#e2e2e2] text-[#5b403d]'
                }`}
              >
                <Car className="w-4 h-4" />
              </div>
              <span
                className={`text-[11px] mt-1 ${
                  currentStatus === 'en_route' ? 'font-bold text-[#1a1c1c]' : 'text-[#5b403d]'
                }`}
              >
                En Route
              </span>
            </div>

            {/* Step 3: Arrived */}
            <div className="flex flex-col items-center relative z-10">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shadow-sm border-2 border-white ${
                  currentStatus === 'arrived' || currentStatus === 'in_progress' || currentStatus === 'completed'
                    ? 'bg-[#feb300] text-[#6a4800]'
                    : 'bg-[#e2e2e2] text-[#5b403d]'
                }`}
              >
                <MapPin className="w-4 h-4" />
              </div>
              <span
                className={`text-[11px] mt-1 ${
                  currentStatus === 'arrived' ? 'font-bold text-[#1a1c1c]' : 'text-[#5b403d]'
                }`}
              >
                Arrived
              </span>
            </div>
          </div>
        </div>

        <hr className="border-[#e8e8e8] my-2" />

        {/* Helper Profile Card matching Screenshot 4 */}
        <div className="flex items-center justify-between p-3.5 bg-white border border-[#e2e2e2] rounded-xl shadow-xs mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={helper.avatarUrl}
                alt={helper.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-[#e8e8e8]"
              />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#15803d] border-2 border-white rounded-full"></span>
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#1a1c1c]">{helper.name}</h4>
              <div className="flex items-center gap-1 text-[#7e5700] mt-0.5">
                <Star className="w-3.5 h-3.5 fill-[#feb300] text-[#feb300]" />
                <span className="text-xs font-semibold text-[#5b403d]">
                  {helper.rating} ({helper.rescuesCount}+ rescues)
                </span>
              </div>
              <p className="text-xs text-[#5b403d] mt-0.5">
                {helper.vehicleDesc} • {helper.plate}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-semibold text-[#5b403d] block">Price Offer</span>
            <span className="text-base font-bold text-[#b7131a]">
              ${request.agreedPrice?.toFixed(2) || '50.00'}
            </span>
          </div>
        </div>

        {/* Quick Actions matching Screenshot 4 */}
        <div className="flex gap-3">
          <button
            id="tracking-chat-btn"
            onClick={onOpenChat}
            className="flex-1 flex items-center justify-center gap-2 bg-[#f3f3f3] hover:bg-[#e8e8e8] text-[#1a1c1c] py-3.5 rounded-xl font-bold text-sm transition-colors shadow-xs cursor-pointer active:scale-95"
          >
            <MessageSquare className="w-4 h-4 text-[#005ea4]" />
            <span>Chat</span>
          </button>
          <button
            id="tracking-call-btn"
            onClick={onStartCall}
            className="flex-1 flex items-center justify-center gap-2 bg-[#b7131a] hover:bg-[#db322f] text-white py-3.5 rounded-xl font-bold text-sm transition-transform active:scale-95 shadow-md cursor-pointer"
          >
            <Phone className="w-4 h-4" />
            <span>Call Driver</span>
          </button>
        </div>
      </div>

      {/* Rating & Review Modal when rescue is completed */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-scaleUp flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-[#ffdad6] text-[#b7131a] flex items-center justify-center mb-3">
              <ShieldCheck className="w-10 h-10" />
            </div>

            <h3 className="text-xl font-bold text-[#1a1c1c]">Roadside Rescue Complete</h3>
            <p className="text-xs text-[#5b403d] mt-1 max-w-xs">
              Marcus T. safely resolved your {request.issueTitle}. How was your experience?
            </p>

            {/* Star Rating */}
            <div className="flex gap-2 my-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRatingStars(star)}
                  className="p-1 transition-transform hover:scale-110 cursor-pointer"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= ratingStars ? 'fill-[#feb300] text-[#feb300]' : 'text-[#e2e2e2]'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Tip Selection */}
            <div className="w-full mb-4">
              <label className="text-xs font-bold text-[#5b403d] block mb-2">
                Add Tip for Technician (Optional)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[0, 3, 5, 10].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setTipAmount(amount)}
                    className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      tipAmount === amount
                        ? 'bg-[#b7131a] text-white shadow-xs'
                        : 'bg-[#f3f3f3] text-[#1a1c1c] hover:bg-[#e8e8e8]'
                    }`}
                  >
                    {amount === 0 ? 'No Tip' : `$${amount}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <textarea
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              placeholder="Leave a note for Marcus..."
              className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl p-3 text-xs text-[#1a1c1c] outline-none h-18 resize-none mb-4"
            ></textarea>

            <button
              onClick={handleSubmitRating}
              className="w-full h-12 bg-[#b7131a] hover:bg-[#db322f] text-white font-bold rounded-xl shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Submit & Return to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
