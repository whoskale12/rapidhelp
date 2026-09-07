export type ScreenType = 'auth' | 'home' | 'tracking' | 'chat' | 'rewards' | 'requests' | 'profile';

export type IssueType = 'flat_tire' | 'fuel' | 'engine' | 'battery' | 'lockout' | 'towing' | 'other';

export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  isDefault?: boolean;
}

export interface UserProfile {
  name: string;
  phone: string;
  countryCode: string;
  isVerified: boolean;
  avatarUrl: string;
  vehicles: Vehicle[];
  activeVehicleId: string;
  rewardPoints: number;
  silentMode: boolean;
  emergencyContacts: EmergencyContact[];
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  notifyOnSos: boolean;
}

export interface HelperDriver {
  id: string;
  name: string;
  role: string;
  rating: number;
  rescuesCount: number;
  vehicleDesc: string;
  plate: string;
  avatarUrl: string;
  phone: string;
  currentEtaMinutes: number;
  distanceMiles: number;
  location: { x: number; y: number };
}

export type RequestStatus = 'finding_helper' | 'accepted' | 'en_route' | 'arrived' | 'in_progress' | 'completed' | 'cancelled';

export interface AssistanceRequest {
  id: string;
  issueType: IssueType;
  issueTitle: string;
  issueDescription: string;
  locationAddress: string;
  locationCoordinates: { lat: number; lng: number };
  vehicle: Vehicle;
  createdAt: string;
  status: RequestStatus;
  helper?: HelperDriver;
  agreedPrice?: number;
  paymentMethod: 'cash_or_transfer' | 'rewards_pts';
  offerStatus?: 'pending' | 'accepted' | 'declined' | 'countered';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'helper' | 'system';
  text: string;
  timestamp: string;
  isOffer?: boolean;
  offerAmount?: number;
  offerStatus?: 'pending' | 'accepted' | 'declined';
  photoUrl?: string;
  locationSnippet?: string;
}

export interface Voucher {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  category: 'fuel' | 'maintenance' | 'food' | 'safety';
  imageUrl: string;
  code?: string;
  expiryDate?: string;
}

export interface RedeemedVoucher {
  id: string;
  voucherId: string;
  title: string;
  code: string;
  redeemedAt: string;
  pointsSpent: number;
  isUsed: boolean;
}
