import React from 'react';
import { ScreenType } from '../types';
import { Menu, Bell, ShieldAlert, ArrowLeft } from 'lucide-react';

interface NavigationHeaderProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  onOpenMenu: () => void;
  onOpenNotifications: () => void;
  hasActiveRequest?: boolean;
  titleOverride?: string;
  showBack?: boolean;
  onBack?: () => void;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  currentScreen,
  onNavigate,
  onOpenMenu,
  onOpenNotifications,
  hasActiveRequest,
  titleOverride,
  showBack,
  onBack,
}) => {
  return (
    <header className="fixed top-0 left-0 w-full z-50 h-20 bg-[#f9f9f9] border-b border-[#eeeeee] flex items-center justify-between px-[54px] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-center w-11">
        {showBack ? (
          <button
            id="header-back-btn"
            onClick={onBack}
            aria-label="Go back"
            className="p-2 text-[#5b403d] hover:bg-[#eeeeee] active:scale-95 rounded-full transition-all flex items-center justify-center cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={2.25} />
          </button>
        ) : (
          <button
            id="header-menu-btn"
            onClick={onOpenMenu}
            aria-label="Open menu"
            className="p-2 text-[#5b403d] hover:bg-[#eeeeee] active:scale-95 rounded-full transition-all flex items-center justify-center cursor-pointer"
          >
            <Menu className="w-5 h-5" strokeWidth={2.4} />
          </button>
        )}
      </div>

      <button
        type="button"
        className="flex items-center justify-center gap-2 cursor-pointer"
        onClick={() => onNavigate('home')}
      >
        <span className="font-['Inter'] font-bold text-xl text-[#c70f18] tracking-[-0.02em]">
          {titleOverride || 'RapidHelp'}
        </span>
        {hasActiveRequest && currentScreen !== 'tracking' && (
          <span className="flex items-center gap-1 bg-[#ffdad6] text-[#93000d] text-[10px] font-semibold px-2 py-0.5 rounded-full animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-[#b7131a]"></span>
            Active
          </span>
        )}
      </button>

      <div className="flex items-center justify-center w-11">
        {hasActiveRequest && currentScreen !== 'home' ? (
          <button
            id="header-active-request-btn"
            onClick={() => onNavigate('tracking')}
            aria-label="Track active request"
            className="p-2 text-[#5b403d] hover:bg-[#eeeeee] active:scale-95 rounded-full transition-all flex items-center justify-center cursor-pointer"
          >
            <ShieldAlert className="w-5 h-5" strokeWidth={2.25} />
          </button>
        ) : (
          <button
            id="header-notifications-btn"
            onClick={onOpenNotifications}
            aria-label="Notifications"
            className="p-2 text-[#5b403d] hover:bg-[#eeeeee] active:scale-95 rounded-full transition-all relative flex items-center justify-center cursor-pointer"
          >
            <Bell className="w-5 h-5" strokeWidth={2.25} />
          </button>
        )}
      </div>
    </header>
  );
};
