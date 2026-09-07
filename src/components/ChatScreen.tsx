import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, AssistanceRequest } from '../types';
import { 
  Send, 
  PlusCircle, 
  MapPin, 
  Camera, 
  DollarSign, 
  Info, 
  Check, 
  X, 
  Image as ImageIcon, 
  Phone,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ChatScreenProps {
  request: AssistanceRequest;
  initialMessages: ChatMessage[];
  onBack: () => void;
  onStartCall: () => void;
  onUpdateAgreedPrice?: (price: number) => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  request,
  initialMessages,
  onBack,
  onStartCall,
  onUpdateAgreedPrice,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputText, setInputText] = useState<string>('');
  const [showOfferModal, setShowOfferModal] = useState<boolean>(false);
  const [customOfferAmount, setCustomOfferAmount] = useState<string>('45.00');
  const [offerAccepted, setOfferAccepted] = useState<boolean>(request.offerStatus === 'accepted');
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const helper = request.helper || {
    id: 'helper_john',
    name: 'John D.',
    role: 'Tow Truck & Mechanic',
    rating: 4.9,
    rescuesCount: 180,
    vehicleDesc: 'Flatbed Tow Truck',
    plate: 'XYZ-1234',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDwV0Vx7EQzDKXjS1HarH4xBTk3gCvWGerR-Br4kNwXK7HCMMUlSvZSzm4B9w97h-Ze_cWmy7QdJqRLQfMusNdtKjBrDlF0E_evSRy4H50uyZzCkXcEvDmLLmopkuMqzP_Od8q9sh-Rip4PH1i4CwvS4BnJ8qeWfLGDDf-UNQni5vCgP5x7_IN-C47n1LpNFrvaweLIJzx0ZlkyLM-Xv90kWCqABxMFLooPPONuOEi-8n8EeJDlNyC5',
    phone: '+1 (555) 890-1234',
    currentEtaMinutes: 5,
    distanceMiles: 1.4,
    location: { x: 55, y: 35 },
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    if (!textToSend) setInputText('');

    // Simulated helper automatic reply
    setTimeout(() => {
      let replyText = "Got it! I'm taking the quickest route around the freeway congestion. Hang tight!";
      if (text.toLowerCase().includes('where') || text.toLowerCase().includes('location')) {
        replyText = "I see your coordinates on my dispatch console. Pulling up in about 2-3 minutes.";
      } else if (text.toLowerCase().includes('thank') || text.toLowerCase().includes('ok')) {
        replyText = "Happy to help! Keep hazard flashers on for safety.";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `msg_${Date.now() + 1}`,
          sender: 'helper',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1200);
  };

  const handleAcceptOffer = (amount: number = 50.00) => {
    setOfferAccepted(true);
    if (onUpdateAgreedPrice) {
      onUpdateAgreedPrice(amount);
    }

    setMessages((prev) =>
      prev.map((msg) => (msg.isOffer ? { ...msg, offerStatus: 'accepted' } : msg))
    );

    // Add confirmation message
    setMessages((prev) => [
      ...prev,
      {
        id: `msg_${Date.now()}`,
        sender: 'user',
        text: `I accept the service offer for $${amount.toFixed(2)}. Cash / transfer ready.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      {
        id: `msg_${Date.now() + 1}`,
        sender: 'helper',
        text: 'Awesome, agreement locked in. See you shortly!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.5 },
      colors: ['#b7131a', '#feb300', '#005ea4'],
    });
  };

  const handleDeclineOffer = () => {
    setMessages((prev) =>
      prev.map((msg) => (msg.isOffer ? { ...msg, offerStatus: 'declined' } : msg))
    );
    setShowOfferModal(true);
  };

  const handleSendCustomOffer = () => {
    const amount = parseFloat(customOfferAmount) || 45.00;
    setShowOfferModal(false);

    setMessages((prev) => [
      ...prev,
      {
        id: `msg_${Date.now()}`,
        sender: 'user',
        text: `Would you be able to do $${amount.toFixed(2)} for this job?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_${Date.now() + 1}`,
          sender: 'helper',
          text: `Sure, $${amount.toFixed(2)} works with me. Deal!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isOffer: true,
          offerAmount: amount,
          offerStatus: 'accepted',
        },
      ]);
      setOfferAccepted(true);
      if (onUpdateAgreedPrice) onUpdateAgreedPrice(amount);
    }, 1400);
  };

  const handleShareLocation = () => {
    const locationSnippet = request.locationAddress || '1-10 E 1st St, Los Angeles, CA (GPS Pin Verified)';
    handleSendMessage(`📍 Shared exact GPS Location: ${locationSnippet}`);
  };

  const handleSendPhoto = () => {
    setMessages((prev) => [
      ...prev,
      {
        id: `msg_${Date.now()}`,
        sender: 'user',
        text: 'Here is a photo of the vehicle and surroundings:',
        photoUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="bg-[#f9f9f9] text-[#1a1c1c] h-[calc(100vh-56px)] mt-14 flex flex-col font-['Inter',sans-serif]">
      {/* Top App Bar with Driver Avatar matching Screenshot 5 */}
      <header className="bg-[#f9f9f9] text-[#b7131a] shadow-xs border-b border-[#e2e2e2] fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 h-14">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="text-[#5b403d] hover:bg-[#eeeeee] p-2 -ml-2 rounded-full flex items-center justify-center cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#e2e2e2] overflow-hidden shrink-0 border-2 border-white shadow-xs">
              <img
                src={helper.avatarUrl}
                alt={helper.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="font-bold text-base md:text-lg text-[#b7131a] leading-tight">
                {helper.name} - Tow Truck
              </h1>
              <span className="text-[11px] text-[#5b403d] flex items-center gap-1 font-medium">
                <span className="w-2 h-2 rounded-full bg-[#15803d]"></span>
                Online • Active Dispatch
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onStartCall}
            className="p-2 text-[#b7131a] hover:bg-[#ffdad6]/50 rounded-full cursor-pointer active:scale-95 transition-all"
            title="Call Driver"
          >
            <Phone className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Chat Thread Canvas matching Screenshot 5 */}
      <main className="flex-1 overflow-y-auto px-4 pt-4 pb-36 flex flex-col gap-4 max-w-lg mx-auto w-full">
        {/* Persistent Important Notice Banner matching Screenshot 5 */}
        <div className="bg-[#f3f3f3] border border-[#e4beb9] rounded-xl p-3.5 text-center shadow-xs">
          <div className="flex items-center justify-center gap-1.5 text-[#5b403d] mb-1">
            <Info className="w-4 h-4 text-[#005ea4]" />
            <span className="font-bold text-xs uppercase tracking-wide">Important Notice</span>
          </div>
          <p className="text-xs text-[#5b403d] leading-relaxed">
            Payment is made directly on-site via Cash or Bank Transfer upon arrival.
          </p>
        </div>

        {/* Date Separator matching Screenshot 5 */}
        <div className="flex justify-center my-1">
          <span className="text-[11px] font-semibold bg-[#e2e2e2] text-[#5b403d] px-3 py-1 rounded-full">
            Today, 10:42 AM
          </span>
        </div>

        {/* Dynamic Messages Loop */}
        {messages.map((msg) => {
          if (msg.sender === 'helper') {
            return (
              <div key={msg.id} className="flex flex-col items-start max-w-[88%] self-start gap-1">
                {msg.isOffer ? (
                  /* Helper Negotiation Offer Widget matching Screenshot 5 */
                  <div className="bg-[#eeeeee] rounded-2xl rounded-tl-xs overflow-hidden shadow-sm border border-[#e4beb9] w-full">
                    <div className="p-3.5 bg-white border-b border-[#e4beb9]/60">
                      <p className="text-sm text-[#1a1c1c] font-medium">{msg.text}</p>
                    </div>
                    {/* Negotiation Box */}
                    <div className="p-3.5 bg-[#feb300]/10 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#5b403d] uppercase tracking-wider">
                          Service Offer
                        </span>
                        <span className="text-xl font-extrabold text-[#b7131a]">
                          ${msg.offerAmount?.toFixed(2) || '50.00'}
                        </span>
                      </div>

                      {offerAccepted || msg.offerStatus === 'accepted' ? (
                        <div className="bg-[#dcfce7] border border-[#bbf7d0] text-[#15803d] py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Offer Accepted (${msg.offerAmount?.toFixed(2) || '50.00'})</span>
                        </div>
                      ) : msg.offerStatus === 'declined' ? (
                        <div className="bg-[#fee2e2] border border-[#fecaca] text-[#991b1b] py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs">
                          <X className="w-4 h-4" />
                          <span>Offer Declined / Countering</span>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={handleDeclineOffer}
                            className="flex-1 bg-white border border-[#906f6c] text-[#1a1c1c] font-bold py-2.5 rounded-lg hover:bg-[#f3f3f3] text-xs transition-colors cursor-pointer"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => handleAcceptOffer(msg.offerAmount || 50.00)}
                            className="flex-1 bg-[#b7131a] hover:bg-[#db322f] text-white font-bold py-2.5 rounded-lg shadow-sm text-xs transition-colors cursor-pointer active:scale-95"
                          >
                            Accept
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#eeeeee] rounded-2xl rounded-tl-xs p-3.5 text-[#1a1c1c] shadow-xs">
                    <p className="text-sm">{msg.text}</p>
                  </div>
                )}
                <span className="text-[10px] text-[#5b403d] px-1">{msg.timestamp}</span>
              </div>
            );
          }

          // User (Requester) Message
          return (
            <div key={msg.id} className="flex flex-col items-end max-w-[88%] self-end gap-1">
              <div className="bg-[#db322f] text-white rounded-2xl rounded-tr-xs p-3.5 shadow-sm">
                <p className="text-sm">{msg.text}</p>
                {msg.photoUrl && (
                  <div className="mt-2 rounded-lg overflow-hidden border border-white/20">
                    <img src={msg.photoUrl} alt="User attachment" className="w-full h-36 object-cover" />
                  </div>
                )}
              </div>
              <span className="text-[10px] text-[#5b403d] px-1">{msg.timestamp}</span>
            </div>
          );
        })}

        <div ref={chatEndRef} />
      </main>

      {/* Floating Bottom Chat Input Area matching Screenshot 5 */}
      <div className="fixed bottom-0 left-0 w-full bg-[#f9f9f9] border-t border-[#e4beb9]/60 pb-4 pt-2 px-4 z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
        <div className="max-w-lg mx-auto flex flex-col gap-2">
          {/* Quick Action Chips Row matching Screenshot 5 */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setShowOfferModal(true)}
              className="shrink-0 flex items-center gap-1.5 bg-[#f3f3f3] hover:bg-[#e8e8e8] border border-[#e4beb9] rounded-full px-3 py-1.5 transition-colors cursor-pointer text-xs font-semibold text-[#5b403d]"
            >
              <DollarSign className="w-4 h-4 text-[#7e5700]" />
              <span>Make Offer</span>
            </button>
            <button
              onClick={handleShareLocation}
              className="shrink-0 flex items-center gap-1.5 bg-[#f3f3f3] hover:bg-[#e8e8e8] border border-[#e4beb9] rounded-full px-3 py-1.5 transition-colors cursor-pointer text-xs font-semibold text-[#5b403d]"
            >
              <MapPin className="w-4 h-4 text-[#005ea4]" />
              <span>Share Location</span>
            </button>
            <button
              onClick={handleSendPhoto}
              className="shrink-0 flex items-center gap-1.5 bg-[#f3f3f3] hover:bg-[#e8e8e8] border border-[#e4beb9] rounded-full px-3 py-1.5 transition-colors cursor-pointer text-xs font-semibold text-[#5b403d]"
            >
              <Camera className="w-4 h-4 text-[#b7131a]" />
              <span>Send Photo</span>
            </button>
          </div>

          {/* Text Input Row matching Screenshot 5 */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSendPhoto}
              className="p-2 text-[#5b403d] hover:text-[#b7131a] hover:bg-[#eeeeee] rounded-full transition-colors shrink-0 cursor-pointer"
              title="Add attachment"
            >
              <PlusCircle className="w-6 h-6" />
            </button>

            <div className="flex-1 bg-[#eeeeee] rounded-2xl border border-transparent focus-within:border-[#005ea4] focus-within:bg-white transition-all overflow-hidden min-h-[46px] flex items-center px-4">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage();
                  }
                }}
                placeholder="Type a message..."
                className="w-full bg-transparent border-none text-sm text-[#1a1c1c] placeholder-[#5b403d]/70 outline-none"
              />
            </div>

            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim()}
              className="bg-[#b7131a] hover:bg-[#db322f] text-white rounded-full w-11 h-11 flex items-center justify-center shrink-0 shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Propose Counter / Custom Offer */}
      {showOfferModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-scaleUp flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-[#1a1c1c]">Make Price Offer</h3>
              <button
                onClick={() => setShowOfferModal(false)}
                className="p-1 text-[#5b403d] hover:bg-[#eeeeee] rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#5b403d]">
              Propose an agreed cash or bank transfer payment for this service:
            </p>

            <div className="relative flex items-center">
              <span className="absolute left-4 font-extrabold text-xl text-[#b7131a]">$</span>
              <input
                type="number"
                step="5"
                value={customOfferAmount}
                onChange={(e) => setCustomOfferAmount(e.target.value)}
                className="w-full h-14 pl-9 pr-4 rounded-xl border-2 border-[#e2e2e2] bg-[#f9f9f9] text-xl font-bold text-[#1a1c1c] focus:border-[#b7131a] outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {['35.00', '45.00', '55.00'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setCustomOfferAmount(preset)}
                  className="py-1.5 rounded-lg text-xs font-bold bg-[#f3f3f3] hover:bg-[#e8e8e8] text-[#1a1c1c] cursor-pointer"
                >
                  ${preset}
                </button>
              ))}
            </div>

            <button
              onClick={handleSendCustomOffer}
              className="w-full h-12 bg-[#b7131a] hover:bg-[#db322f] text-white font-bold rounded-xl shadow-md cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Send Offer to Driver</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
