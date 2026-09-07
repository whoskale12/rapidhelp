import React, { useState } from 'react';
import { UserProfile, Voucher, RedeemedVoucher } from '../types';
import { availableVouchers } from '../data/mockData';
import { 
  Coins, 
  Sparkles, 
  VolumeX, 
  Volume2, 
  PhoneCall, 
  ChevronRight, 
  QrCode, 
  CheckCircle2, 
  Car, 
  Plus, 
  Trash2, 
  ExternalLink,
  ShieldCheck,
  X,
  Copy,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RewardsScreenProps {
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onOpenEmergencyContacts: () => void;
}

export const RewardsScreen: React.FC<RewardsScreenProps> = ({
  user,
  onUpdateUser,
  onOpenEmergencyContacts,
}) => {
  const [vouchers] = useState<Voucher[]>(availableVouchers);
  const [selectedVoucherForRedeem, setSelectedVoucherForRedeem] = useState<Voucher | null>(null);
  const [redeemedVouchers, setRedeemedVouchers] = useState<RedeemedVoucher[]>([
    {
      id: 'red_1',
      voucherId: 'vouch_coffee',
      title: 'Premium Coffee Voucher',
      code: 'RH-COFFEE-8821',
      redeemedAt: 'Yesterday',
      pointsSpent: 500,
      isUsed: false,
    },
  ]);
  const [activeTab, setActiveTab] = useState<'vouchers' | 'my_wallet'>('vouchers');
  const [activeCodeCopied, setActiveCodeCopied] = useState<boolean>(false);
  const [showVehicleManager, setShowVehicleManager] = useState<boolean>(false);
  const [newMake, setNewMake] = useState<string>('');
  const [newModel, setNewModel] = useState<string>('');
  const [newPlate, setNewPlate] = useState<string>('');

  const handleToggleSilent = (val: boolean) => {
    onUpdateUser({ silentMode: val });
  };

  const handleConfirmRedeem = (voucher: Voucher) => {
    if (user.rewardPoints < voucher.pointsCost) {
      alert(`You need ${voucher.pointsCost} points, but have ${user.rewardPoints}. Earn more points with safe rides and feedback!`);
      return;
    }

    const newRedeemed: RedeemedVoucher = {
      id: `red_${Date.now()}`,
      voucherId: voucher.id,
      title: voucher.title,
      code: `RH-${voucher.category.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      redeemedAt: 'Just now',
      pointsSpent: voucher.pointsCost,
      isUsed: false,
    };

    onUpdateUser({ rewardPoints: user.rewardPoints - voucher.pointsCost });
    setRedeemedVouchers((prev) => [newRedeemed, ...prev]);
    setSelectedVoucherForRedeem(null);

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#feb300', '#b7131a', '#005ea4'],
    });
  };

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMake || !newModel || !newPlate) return;

    const newVeh = {
      id: `veh_${Date.now()}`,
      make: newMake,
      model: newModel,
      year: 2023,
      color: 'Black',
      licensePlate: newPlate.toUpperCase(),
      isDefault: false,
    };

    onUpdateUser({ vehicles: [...user.vehicles, newVeh] });
    setNewMake('');
    setNewModel('');
    setNewPlate('');
  };

  const handleRemoveVehicle = (id: string) => {
    if (user.vehicles.length <= 1) {
      alert('You must have at least one registered vehicle.');
      return;
    }
    const updated = user.vehicles.filter((v) => v.id !== id);
    onUpdateUser({
      vehicles: updated,
      activeVehicleId: user.activeVehicleId === id ? updated[0].id : user.activeVehicleId,
    });
  };

  return (
    <div className="bg-[#f9f9f9] text-[#1a1c1c] min-h-[calc(100vh-56px)] mt-14 pb-28 md:pb-12 px-4 md:px-6 max-w-4xl mx-auto flex flex-col gap-6 pt-4 font-['Inter',sans-serif]">
      {/* Rewards Hero Section matching Screenshot 5 */}
      <section className="flex flex-col gap-4">
        {/* Balance Card matching Screenshot 5 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e2e2] flex flex-col items-center justify-center text-center relative overflow-hidden">
          {/* Subtle Golden Glow */}
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#ffdeac] rounded-full blur-2xl opacity-60 pointer-events-none"></div>

          <h2 className="text-xs font-bold text-[#5b403d] uppercase tracking-wider mb-2">
            YOUR BALANCE
          </h2>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#feb300] text-[#6a4800] flex items-center justify-center shadow-md">
              <Coins className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="text-3xl md:text-4xl font-extrabold text-[#1a1c1c] tracking-tight">
              {user.rewardPoints.toLocaleString()}
            </span>
          </div>

          <p className="text-xs md:text-sm text-[#5b403d] mt-2 font-medium">
            Points available to redeem for roadside perks
          </p>

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab('vouchers')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'vouchers'
                  ? 'bg-[#b7131a] text-white shadow-xs'
                  : 'bg-[#f3f3f3] text-[#5b403d] hover:bg-[#e8e8e8]'
              }`}
            >
              Browse Catalog
            </button>
            <button
              onClick={() => setActiveTab('my_wallet')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'my_wallet'
                  ? 'bg-[#b7131a] text-white shadow-xs'
                  : 'bg-[#f3f3f3] text-[#5b403d] hover:bg-[#e8e8e8]'
              }`}
            >
              My Vouchers ({redeemedVouchers.length})
            </button>
          </div>
        </div>

        {/* Redeemable Vouchers View */}
        {activeTab === 'vouchers' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between mt-2">
              <h3 className="font-bold text-lg md:text-xl text-[#1a1c1c]">
                Redeemable Vouchers
              </h3>
              <span className="text-xs font-semibold text-[#b7131a]">
                Instant Digital Delivery
              </span>
            </div>

            {/* Vouchers Grid matching Screenshot 5 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {vouchers.map((voucher) => (
                <div
                  key={voucher.id}
                  className="bg-white rounded-2xl shadow-xs border border-[#e2e2e2] overflow-hidden hover:shadow-md transition-all flex flex-col group"
                >
                  {/* Image with point badge */}
                  <div
                    className="bg-cover bg-center w-full h-36 relative"
                    style={{ backgroundImage: `url('${voucher.imageUrl}')` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                    <div className="absolute top-2.5 right-2.5 bg-white/95 text-[#1a1c1c] text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                      {voucher.pointsCost.toLocaleString()} pts
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 flex flex-col flex-grow justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-sm text-[#1a1c1c] group-hover:text-[#b7131a] transition-colors">
                        {voucher.title}
                      </h4>
                      <p className="text-xs text-[#5b403d] mt-1 line-clamp-2">
                        {voucher.description}
                      </p>
                    </div>

                    <button
                      id={`redeem-${voucher.id}-btn`}
                      onClick={() => setSelectedVoucherForRedeem(voucher)}
                      disabled={user.rewardPoints < voucher.pointsCost}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 ${
                        user.rewardPoints >= voucher.pointsCost
                          ? 'bg-[#db322f] hover:bg-[#b7131a] text-white shadow-xs'
                          : 'bg-[#eeeeee] text-[#5b403d] cursor-not-allowed opacity-70'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{user.rewardPoints >= voucher.pointsCost ? 'Redeem Voucher' : 'Need More Points'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* My Redeemed Wallet View */}
        {activeTab === 'my_wallet' && (
          <div className="flex flex-col gap-3">
            <h3 className="font-bold text-lg text-[#1a1c1c]">My Active Vouchers</h3>
            {redeemedVouchers.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-[#e2e2e2] text-[#5b403d] text-sm">
                You haven't redeemed any vouchers yet. Earn points by requesting roadside help or referring friends!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {redeemedVouchers.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border-2 border-dashed border-[#e4beb9] rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-xs"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-sm text-[#1a1c1c]">{item.title}</h4>
                        <span className="text-[10px] bg-[#dcfce7] text-[#15803d] font-bold px-2 py-0.5 rounded-full">
                          Ready to Use
                        </span>
                      </div>
                      <p className="text-xs text-[#5b403d] mt-1">Redeemed: {item.redeemedAt}</p>
                    </div>

                    <div className="bg-[#f3f3f3] p-3 rounded-xl flex items-center justify-between">
                      <span className="font-mono font-bold text-sm text-[#005ea4]">
                        {item.code}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText(item.code);
                          setActiveCodeCopied(true);
                          setTimeout(() => setActiveCodeCopied(false), 1500);
                        }}
                        className="p-1.5 text-[#5b403d] hover:bg-[#e8e8e8] rounded-lg cursor-pointer transition-colors"
                        title="Copy code"
                      >
                        {activeCodeCopied ? <Check className="w-4 h-4 text-[#15803d]" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Divider */}
      <hr className="border-[#e4beb9]/60 my-1" />

      {/* Settings & Preferences Section matching Screenshot 5 */}
      <section className="flex flex-col gap-3">
        <h3 className="font-bold text-lg md:text-xl text-[#1a1c1c]">Preferences</h3>
        
        <div className="bg-white rounded-2xl shadow-xs border border-[#e2e2e2] overflow-hidden flex flex-col divide-y divide-[#e2e2e2]">
          {/* Silent Mode Toggle matching Screenshot 5 */}
          <div className="p-4 flex items-center justify-between hover:bg-[#f9f9f9] transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#eeeeee] flex items-center justify-center text-[#5b403d]">
                {user.silentMode ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </div>
              <div>
                <div className="font-bold text-sm text-[#1a1c1c]">Silent Mode</div>
                <div className="text-xs text-[#5b403d]">Mute SOS broadcast sound notifications</div>
              </div>
            </div>

            {/* Custom Toggle Switch matching screenshot */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                id="silent-mode-toggle"
                type="checkbox"
                checked={user.silentMode}
                onChange={(e) => handleToggleSilent(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#e2e2e2] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#e2e2e2] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#b7131a]"></div>
            </label>
          </div>

          {/* Emergency Contacts Row matching Screenshot 5 */}
          <button
            id="pref-emergency-contacts-btn"
            onClick={onOpenEmergencyContacts}
            className="p-4 flex items-center justify-between hover:bg-[#f9f9f9] transition-colors text-left w-full cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#eeeeee] flex items-center justify-center text-[#5b403d] group-hover:bg-[#ffdad6] group-hover:text-[#b7131a] transition-colors">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-[#1a1c1c]">Emergency Contacts</div>
                <div className="text-xs text-[#5b403d]">
                  {user.emergencyContacts.length} contacts notified during critical SOS
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#5b403d]" />
          </button>

          {/* Manage Vehicles Row */}
          <button
            onClick={() => setShowVehicleManager(true)}
            className="p-4 flex items-center justify-between hover:bg-[#f9f9f9] transition-colors text-left w-full cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#eeeeee] flex items-center justify-center text-[#5b403d] group-hover:bg-[#d3e4ff] group-hover:text-[#005ea4] transition-colors">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-[#1a1c1c]">My Vehicles</div>
                <div className="text-xs text-[#5b403d]">
                  {user.vehicles.length} vehicle(s) configured
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#5b403d]" />
          </button>
        </div>
      </section>

      {/* Modal: Confirm Redeem Voucher */}
      {selectedVoucherForRedeem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-scaleUp flex flex-col gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-[#feb300]/20 text-[#7e5700] flex items-center justify-center mx-auto">
              <QrCode className="w-7 h-7" />
            </div>

            <div>
              <h3 className="font-bold text-lg text-[#1a1c1c]">
                Redeem {selectedVoucherForRedeem.title}?
              </h3>
              <p className="text-xs text-[#5b403d] mt-1">
                {selectedVoucherForRedeem.pointsCost.toLocaleString()} points will be deducted from your balance.
              </p>
            </div>

            <div className="bg-[#f3f3f3] p-3 rounded-xl text-left text-xs flex flex-col gap-1 text-[#5b403d]">
              <div>• Instant digital barcode redemption</div>
              <div>• Valid for 90 days from claim date</div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedVoucherForRedeem(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#906f6c] text-[#1a1c1c] text-xs font-bold hover:bg-[#f3f3f3] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmRedeem(selectedVoucherForRedeem)}
                className="flex-1 py-2.5 rounded-xl bg-[#b7131a] hover:bg-[#db322f] text-white text-xs font-bold shadow-md cursor-pointer active:scale-95 transition-all"
              >
                Confirm Redeem
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Vehicle Manager */}
      {showVehicleManager && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-scaleUp flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-[#1a1c1c]">My Vehicles</h3>
              <button
                onClick={() => setShowVehicleManager(false)}
                className="p-1 text-[#5b403d] hover:bg-[#eeeeee] rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {user.vehicles.map((veh) => (
                <div
                  key={veh.id}
                  className="bg-[#f3f3f3] rounded-xl p-3 flex items-center justify-between border border-[#e2e2e2]"
                >
                  <div className="flex items-center gap-3">
                    <Car className="w-5 h-5 text-[#b7131a]" />
                    <div>
                      <div className="font-bold text-xs text-[#1a1c1c]">
                        {veh.year} {veh.make} {veh.model} ({veh.color})
                      </div>
                      <div className="text-[11px] text-[#5b403d] font-mono">{veh.licensePlate}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {user.activeVehicleId === veh.id ? (
                      <span className="text-[10px] bg-[#dcfce7] text-[#15803d] font-bold px-2 py-0.5 rounded-full">
                        Active Default
                      </span>
                    ) : (
                      <button
                        onClick={() => onUpdateUser({ activeVehicleId: veh.id })}
                        className="text-[10px] bg-white border border-[#e2e2e2] text-[#005ea4] font-bold px-2 py-0.5 rounded-full hover:bg-[#d3e4ff] cursor-pointer"
                      >
                        Set Active
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveVehicle(veh.id)}
                      className="p-1 text-[#ba1a1a] hover:bg-[#ffdad6] rounded-md cursor-pointer"
                      title="Remove vehicle"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddVehicle} className="mt-2 border-t border-[#e2e2e2] pt-4 flex flex-col gap-2">
              <span className="text-xs font-bold text-[#1a1c1c]">Add Another Vehicle</span>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Make"
                  value={newMake}
                  onChange={(e) => setNewMake(e.target.value)}
                  className="h-10 px-2.5 rounded-lg border border-[#e2e2e2] text-xs"
                />
                <input
                  type="text"
                  placeholder="Model"
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  className="h-10 px-2.5 rounded-lg border border-[#e2e2e2] text-xs"
                />
                <input
                  type="text"
                  placeholder="Plate"
                  value={newPlate}
                  onChange={(e) => setNewPlate(e.target.value)}
                  className="h-10 px-2.5 rounded-lg border border-[#e2e2e2] text-xs font-mono uppercase"
                />
              </div>
              <button
                type="submit"
                className="mt-1 w-full py-2 bg-[#005ea4] hover:bg-[#0077ce] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Add Vehicle
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
