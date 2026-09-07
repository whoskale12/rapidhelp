/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ScreenType, 
  UserProfile, 
  AssistanceRequest, 
  ChatMessage, 
  EmergencyContact 
} from './types';
import { 
  initialUserProfile, 
  defaultHelperMarcus, 
  initialPastRequests, 
  initialChatMessages 
} from './data/mockData';
import { NavigationHeader } from './components/NavigationHeader';
import { BottomNavBar } from './components/BottomNavBar';
import { AuthScreen } from './components/AuthScreen';
import { HomeScreen } from './components/HomeScreen';
import { TrackingScreen } from './components/TrackingScreen';
import { ChatScreen } from './components/ChatScreen';
import { RewardsScreen } from './components/RewardsScreen';
import { RequestsHistoryScreen } from './components/RequestsHistoryScreen';
import { CallModal } from './components/CallModal';
import { EmergencyContactsModal } from './components/EmergencyContactsModal';
import { SideMenuDrawer } from './components/SideMenuDrawer';
import { FlutterCodeHubModal } from './components/FlutterCodeHubModal';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [user, setUser] = useState<UserProfile>(initialUserProfile);
  const [activeRequest, setActiveRequest] = useState<AssistanceRequest | null>(initialPastRequests[0] || null);
  const [pastRequests, setPastRequests] = useState<AssistanceRequest[]>(initialPastRequests);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialChatMessages);

  // Modals & Drawers
  const [isSideMenuOpen, setIsSideMenuOpen] = useState<boolean>(false);
  const [isCallActive, setIsCallActive] = useState<boolean>(false);
  const [isEmergencyContactsModalOpen, setIsEmergencyContactsModalOpen] = useState<boolean>(false);
  const [isFlutterCodeModalOpen, setIsFlutterCodeModalOpen] = useState<boolean>(false);
  const [showNotificationToast, setShowNotificationToast] = useState<string | null>(null);

  // Dispatch SOS from Home
  const handleDispatchSOS = (newRequest: AssistanceRequest) => {
    setActiveRequest(newRequest);
    setPastRequests((prev) => [newRequest, ...prev]);
    setCurrentScreen('tracking');
    triggerNotification(`Emergency unit dispatched! ${newRequest.helper?.name} is en route.`);
  };

  const triggerNotification = (msg: string) => {
    setShowNotificationToast(msg);
    setTimeout(() => {
      setShowNotificationToast(null);
    }, 4000);
  };

  const handleUpdateUser = (updated: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updated }));
  };

  const handleCompleteService = () => {
    if (activeRequest) {
      const completedReq: AssistanceRequest = {
        ...activeRequest,
        status: 'completed',
      };
      setPastRequests((prev) =>
        prev.map((r) => (r.id === completedReq.id ? completedReq : r))
      );
      // Award 200 rescue points
      setUser((prev) => ({ ...prev, rewardPoints: prev.rewardPoints + 200 }));
    }
    setActiveRequest(null);
    setCurrentScreen('home');
    triggerNotification('Roadside assistance completed! +200 Reward points added.');
  };

  const handleUpdateAgreedPrice = (price: number) => {
    if (activeRequest) {
      setActiveRequest((prev) => (prev ? { ...prev, agreedPrice: price, offerStatus: 'accepted' } : null));
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] font-['Inter',sans-serif] flex flex-col antialiased select-none">
      {/* Top Notification Toast */}
      {showNotificationToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#1a1c1c] text-white px-4 py-2.5 rounded-full shadow-xl text-xs font-semibold flex items-center gap-2 border border-white/20 animate-fadeIn">
          <span className="w-2 h-2 rounded-full bg-[#feb300] animate-ping"></span>
          <span>{showNotificationToast}</span>
        </div>
      )}

      {/* Main Top Header (hidden on Auth screen and custom handled in Chat) */}
      {currentScreen !== 'auth' && currentScreen !== 'chat' && (
        <NavigationHeader
          currentScreen={currentScreen}
          onNavigate={(screen) => setCurrentScreen(screen)}
          onOpenMenu={() => setIsSideMenuOpen(true)}
          onOpenNotifications={() => triggerNotification('You have no new alerts. Emergency lines are clear.')}
          hasActiveRequest={!!activeRequest && activeRequest.status !== 'completed'}
          titleOverride={'RapidHelp'}
        />
      )}

      {/* Screen Views */}
      <div className="flex-1 w-full relative">
        {currentScreen === 'auth' && (
          <AuthScreen
            initialUser={user}
            onCompleteAuth={(updatedUser) => {
              setUser(updatedUser);
              setCurrentScreen('home');
            }}
          />
        )}

        {currentScreen === 'home' && (
          <HomeScreen
            user={user}
            onDispatchSOS={handleDispatchSOS}
            onNavigateToTracking={() => setCurrentScreen('tracking')}
          />
        )}

        {currentScreen === 'tracking' && activeRequest && (
          <TrackingScreen
            request={activeRequest}
            onOpenChat={() => setCurrentScreen('chat')}
            onStartCall={() => setIsCallActive(true)}
            onCompleteService={handleCompleteService}
            onCancelRequest={() => {
              setActiveRequest(null);
              setCurrentScreen('home');
            }}
          />
        )}

        {currentScreen === 'tracking' && !activeRequest && (
          <div className="h-[calc(100vh-56px)] mt-14 flex flex-col items-center justify-center p-6 text-center">
            <h3 className="text-xl font-bold text-[#1a1c1c] mb-2">No Active Request</h3>
            <p className="text-sm text-[#5b403d] mb-6">
              You do not have any active emergency response dispatches in progress.
            </p>
            <button
              onClick={() => setCurrentScreen('home')}
              className="px-6 py-3 bg-[#b7131a] text-white font-bold rounded-xl shadow-md cursor-pointer"
            >
              Go to Home Map
            </button>
          </div>
        )}

        {currentScreen === 'chat' && (
          <ChatScreen
            request={activeRequest || pastRequests[0]}
            initialMessages={chatMessages}
            onBack={() => setCurrentScreen(activeRequest ? 'tracking' : 'home')}
            onStartCall={() => setIsCallActive(true)}
            onUpdateAgreedPrice={handleUpdateAgreedPrice}
          />
        )}

        {(currentScreen === 'rewards' || currentScreen === 'profile') && (
          <RewardsScreen
            user={user}
            onUpdateUser={handleUpdateUser}
            onOpenEmergencyContacts={() => setIsEmergencyContactsModalOpen(true)}
          />
        )}

        {currentScreen === 'requests' && (
          <RequestsHistoryScreen
            activeRequest={activeRequest}
            pastRequests={pastRequests}
            onSelectActiveRequest={() => setCurrentScreen('tracking')}
            onSelectPastRequest={() => setCurrentScreen('chat')}
          />
        )}
      </div>

      {/* Bottom Navigation Bar (Hidden on Auth and Chat screens) */}
      {currentScreen !== 'auth' && currentScreen !== 'chat' && (
        <BottomNavBar
          currentScreen={currentScreen}
          onNavigate={(screen) => setCurrentScreen(screen)}
          activeRequestsCount={activeRequest ? 1 : 0}
        />
      )}

      {/* Active In-App Call Modal */}
      {isCallActive && (
        <CallModal
          helper={activeRequest?.helper || defaultHelperMarcus}
          onEndCall={() => setIsCallActive(false)}
        />
      )}

      {/* Emergency Contacts Modal */}
      {isEmergencyContactsModalOpen && (
        <EmergencyContactsModal
          contacts={user.emergencyContacts}
          onSaveContacts={(updatedContacts) => {
            handleUpdateUser({ emergencyContacts: updatedContacts });
          }}
          onClose={() => setIsEmergencyContactsModalOpen(false)}
        />
      )}

      {/* Side Menu Drawer */}
      <SideMenuDrawer
        isOpen={isSideMenuOpen}
        onClose={() => setIsSideMenuOpen(false)}
        user={user}
        onNavigate={(screen) => setCurrentScreen(screen)}
        onSignOut={() => setCurrentScreen('auth')}
      />

      {/* Flutter Code & Architecture Modal */}
      <FlutterCodeHubModal
        isOpen={isFlutterCodeModalOpen}
        onClose={() => setIsFlutterCodeModalOpen(false)}
      />
    </div>
  );
}
