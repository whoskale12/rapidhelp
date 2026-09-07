import React from 'react';
import { UserProfile, ScreenType } from '../types';
import {
  X, Home, Radio, Award, User, ShieldAlert, Flashlight, PhoneCall,
  Settings, LogOut, ShieldCheck, HelpCircle, ChevronRight, Car,
  Sparkles, BellRing,
} from 'lucide-react';

interface SideMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onNavigate: (screen: ScreenType) => void;
  onSignOut: () => void;
}

export const SideMenuDrawer: React.FC<SideMenuDrawerProps> = ({
  isOpen,
  onClose,
  user,
  onNavigate,
  onSignOut,
}) => {
  if (!isOpen) return null;

  const activeVehicle = user.vehicles.find((vehicle) => vehicle.id === user.activeVehicleId) || user.vehicles[0];

  const navigateAndClose = (screen: ScreenType) => {
    onNavigate(screen);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/55 backdrop-blur-xs transition-opacity cursor-pointer"
      ></div>

      <aside className="relative w-[320px] max-w-[88vw] bg-[#f9f9f9] h-full shadow-2xl z-10 flex flex-col border-r border-[#e2e2e2] animate-slideRight font-['Inter',sans-serif] overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 bg-white">
          <div>
            <span className="block font-extrabold text-xl text-[#b7131a] tracking-tight">RapidHelp</span>
            <span className="text-[11px] font-semibold text-[#5b403d]">Roadside rescue companion</span>
          </div>
          <button onClick={onClose} className="p-2 text-[#5b403d] hover:bg-[#f3f3f3] rounded-full transition-colors cursor-pointer" aria-label="Close menu">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
          <section className="relative overflow-hidden rounded-3xl bg-[#1a1c1c] text-white p-4 shadow-lg">
            <div className="absolute -right-10 -top-12 w-32 h-32 rounded-full bg-[#b7131a]/45"></div>
            <div className="absolute right-8 bottom-5 w-16 h-16 rounded-full bg-[#feb300]/25"></div>
            <div className="relative flex items-start gap-3">
              <img src={user.avatarUrl} alt={user.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-white/80 shadow-md" />
              <div className="flex-1 min-w-0 pt-1">
                <div className="font-extrabold text-lg leading-tight truncate">{user.name}</div>
                <div className="text-xs text-white/75 truncate mt-0.5">{user.phone}</div>
                {user.isVerified && (
                  <div className="inline-flex items-center gap-1.5 text-[10px] text-[#dcfce7] font-bold mt-2 bg-white/10 border border-white/10 px-2 py-1 rounded-full">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Verified member</span>
                  </div>
                )}
              </div>
            </div>
            <button onClick={() => navigateAndClose('profile')} className="relative mt-4 w-full h-11 rounded-2xl bg-white text-[#1a1c1c] text-xs font-extrabold flex items-center justify-center gap-2 hover:bg-[#f3f3f3] active:scale-[0.98] transition-all cursor-pointer">
              <User className="w-4 h-4 text-[#b7131a]" />
              <span>View Profile & Vehicles</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </section>

          <button onClick={() => navigateAndClose('rewards')} className="rounded-3xl bg-[#fff7df] border border-[#ffe19a] p-4 text-left shadow-xs hover:shadow-md active:scale-[0.99] transition-all cursor-pointer">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#feb300] text-[#1a1c1c] flex items-center justify-center shadow-sm">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wide text-[#7a4d00]">Rewards balance</div>
                  <div className="text-2xl font-extrabold text-[#1a1c1c] leading-tight">{user.rewardPoints.toLocaleString()} pts</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#7a4d00]" />
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-[#7a4d00]">
              <Sparkles className="w-4 h-4" />
              <span>Redeem fuel, food, safety and maintenance vouchers</span>
            </div>
          </button>

          {activeVehicle && (
            <div className="bg-white rounded-2xl border border-[#e2e2e2] p-3 flex items-center gap-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#d3e4ff] flex items-center justify-center text-[#005ea4]">
                <Car className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-wide text-[#5b403d]">Active vehicle</div>
                <div className="text-sm font-extrabold text-[#1a1c1c] truncate">{activeVehicle.year} {activeVehicle.make} {activeVehicle.model}</div>
                <div className="text-[11px] font-mono text-[#5b403d] truncate">{activeVehicle.licensePlate}</div>
              </div>
            </div>
          )}

          <nav className="flex flex-col gap-2">
            <button onClick={() => navigateAndClose('home')} className="flex items-center gap-3 p-3 rounded-2xl text-sm font-bold text-[#1a1c1c] bg-white border border-[#e2e2e2] hover:bg-[#f3f3f3] transition-colors cursor-pointer">
              <span className="w-10 h-10 rounded-xl bg-[#d3e4ff] flex items-center justify-center"><Home className="w-5 h-5 text-[#005ea4]" /></span>
              <span className="flex-1 text-left">Home Map</span><ChevronRight className="w-4 h-4 text-[#5b403d]" />
            </button>
            <button onClick={() => navigateAndClose('requests')} className="flex items-center gap-3 p-3 rounded-2xl text-sm font-bold text-[#1a1c1c] bg-white border border-[#e2e2e2] hover:bg-[#f3f3f3] transition-colors cursor-pointer">
              <span className="w-10 h-10 rounded-xl bg-[#ffdad6] flex items-center justify-center"><Radio className="w-5 h-5 text-[#b7131a]" /></span>
              <span className="flex-1 text-left">Rescue Requests</span><ChevronRight className="w-4 h-4 text-[#5b403d]" />
            </button>
            <button onClick={() => navigateAndClose('profile')} className="flex items-center gap-3 p-3 rounded-2xl text-sm font-bold text-[#1a1c1c] bg-white border border-[#e2e2e2] hover:bg-[#f3f3f3] transition-colors cursor-pointer">
              <span className="w-10 h-10 rounded-xl bg-[#f3f3f3] flex items-center justify-center"><User className="w-5 h-5 text-[#5b403d]" /></span>
              <span className="flex-1 text-left">Profile & Vehicles</span><ChevronRight className="w-4 h-4 text-[#5b403d]" />
            </button>
          </nav>

          <section className="bg-white rounded-2xl border border-[#e2e2e2] overflow-hidden shadow-xs">
            {[
              { icon: BellRing, label: 'Notification Preferences', color: 'text-[#005ea4]' },
              { icon: Flashlight, label: 'Safety Toolkit', color: 'text-[#feb300]' },
              { icon: HelpCircle, label: 'Help Center', color: 'text-[#15803d]' },
              { icon: Settings, label: 'Account Settings', color: 'text-[#5b403d]' },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <React.Fragment key={item.label}>
                  {index > 0 && <div className="h-px bg-[#e2e2e2] ml-10"></div>}
                  <button className="w-full flex items-center gap-3 px-3 py-3 text-sm font-semibold text-[#1a1c1c] hover:bg-[#f3f3f3] transition-colors cursor-pointer">
                    <Icon className={`w-4 h-4 ${item.color}`} />
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronRight className="w-4 h-4 text-[#5b403d]" />
                  </button>
                </React.Fragment>
              );
            })}
          </section>
        </div>

        <div className="bg-white border-t border-[#e2e2e2] p-4 flex flex-col gap-3">
          <div className="bg-[#ffdad6]/45 p-3 rounded-2xl border border-[#ffdad6] flex items-start gap-2 text-xs text-[#93000d]">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-extrabold">24/7 Roadside Hotline</div>
              <div className="flex items-center gap-1.5 mt-1 font-semibold"><PhoneCall className="w-3.5 h-3.5" /><span>1-800-RAPID-911</span></div>
            </div>
          </div>
          <button onClick={() => { onSignOut(); onClose(); }} className="flex items-center justify-center gap-2 px-3 py-3 rounded-2xl text-xs font-extrabold text-[#ba1a1a] bg-[#fff8f7] hover:bg-[#ffdad6]/45 transition-colors cursor-pointer">
            <LogOut className="w-4 h-4" />
            <span>Switch / Re-Authenticate Account</span>
          </button>
        </div>
      </aside>
    </div>
  );
};
