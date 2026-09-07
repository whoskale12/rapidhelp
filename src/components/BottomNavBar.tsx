import React from 'react';
import { ScreenType } from '../types';
import { Home, Radio, Award, User } from 'lucide-react';

interface BottomNavBarProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  activeRequestsCount?: number;
}

const tabBaseClass = "flex flex-col items-center justify-center transition-all duration-200 relative cursor-pointer";
const selectedClass = "bg-[#feb300] text-[#5b403d] rounded-full px-5 shadow-sm";
const inactiveClass = "text-[#5b403d] px-4 py-1 hover:text-[#b7131a] active:scale-95";

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentScreen,
  onNavigate,
  activeRequestsCount = 0,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-40 h-[74px] bg-[#f9f9f9] border-t border-[#efc8c3] flex items-center justify-around px-4 pb-2 pt-1 md:hidden">
      {/* Home */}
      <button
        id="nav-btn-home"
        onClick={() => onNavigate('home')}
        aria-label="Home"
        className={`${tabBaseClass} ${currentScreen === 'home' ? selectedClass : inactiveClass}`}
      >
        <Home className="w-5 h-5" strokeWidth={2.25} />
        <span className="text-[12px] font-medium leading-none">Home</span>
      </button>

      {/* Requests */}
      <button
        id="nav-btn-requests"
        onClick={() => onNavigate('requests')}
        aria-label="Requests"
        className={`${tabBaseClass} ${currentScreen === 'requests' || currentScreen === 'tracking' ? selectedClass : inactiveClass}`}
      >
        <Radio className="w-5 h-5" strokeWidth={2.25} />
        <span className="text-[12px] font-medium leading-none">Requests</span>
        {activeRequestsCount > 0 && (
          <span className="absolute top-2 right-4 w-2 h-2 bg-[#b7131a] rounded-full"></span>
        )}
      </button>

      {/* Rewards - with dashed border */}
      <div className="relative flex items-center justify-center">
        <div className={`absolute inset-0 border-[2px] border-dashed border-[#cfc7c5] rounded-full transition-opacity ${currentScreen === 'rewards' ? 'opacity-0' : 'opacity-100'}`}></div>
        <button
          id="nav-btn-rewards"
          onClick={() => onNavigate('rewards')}
          aria-label="Rewards"
          className={`${tabBaseClass} ${currentScreen === 'rewards' ? selectedClass : inactiveClass} z-10`}
        >
          <Award className="w-6 h-5" strokeWidth={2.2} />
          <span className="text-[12px] font-medium leading-none">Rewards</span>
        </button>
      </div>

      {/* Profile */}
      <button
        id="nav-btn-profile"
        onClick={() => onNavigate('profile')}
        aria-label="Profile"
        className={`${tabBaseClass} ${currentScreen === 'profile' ? selectedClass : inactiveClass}`}
      >
        <User className="w-5 h-5" strokeWidth={2.25} />
        <span className="text-[12px] font-medium leading-none">Profile</span>
      </button>
    </nav>
  );
};
