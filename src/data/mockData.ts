import { HelperDriver, UserProfile, Vehicle, Voucher, AssistanceRequest, ChatMessage } from '../types';

export const initialUserProfile: UserProfile = {
  name: 'John Doe',
  phone: '(555) 000-0000',
  countryCode: '+1',
  isVerified: true,
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  vehicles: [
    {
      id: 'veh_1',
      make: 'Toyota',
      model: 'Camry',
      year: 2019,
      color: 'Silver',
      licensePlate: '7ABC123',
      isDefault: true,
    },
    {
      id: 'veh_2',
      make: 'Ford',
      model: 'F-150',
      year: 2022,
      color: 'Black',
      licensePlate: '9XYZ890',
      isDefault: false,
    },
  ],
  activeVehicleId: 'veh_1',
  rewardPoints: 4250,
  silentMode: true,
  emergencyContacts: [
    {
      id: 'ec_1',
      name: 'Sarah Doe',
      relationship: 'Spouse',
      phone: '(555) 987-6543',
      notifyOnSos: true,
    },
    {
      id: 'ec_2',
      name: 'Michael Doe',
      relationship: 'Brother',
      phone: '(555) 234-5678',
      notifyOnSos: true,
    },
  ],
};

export const defaultHelperMarcus: HelperDriver = {
  id: 'helper_marcus',
  name: 'Marcus T.',
  role: 'Heavy Duty & Towing Specialist',
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

export const defaultHelperJohn: HelperDriver = {
  id: 'helper_john',
  name: 'John D.',
  role: 'Tow Truck & Roadside Mechanic',
  rating: 4.9,
  rescuesCount: 180,
  vehicleDesc: 'Flatbed Rescue Rig',
  plate: 'TOW-5590',
  avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDwV0Vx7EQzDKXjS1HarH4xBTk3gCvWGerR-Br4kNwXK7HCMMUlSvZSzm4B9w97h-Ze_cWmy7QdJqRLQfMusNdtKjBrDlF0E_evSRy4H50uyZzCkXcEvDmLLmopkuMqzP_Od8q9sh-Rip4PH1i4CwvS4BnJ8qeWfLGDDf-UNQni5vCgP5x7_IN-C47n1LpNFrvaweLIJzx0ZlkyLM-Xv90kWCqABxMFLooPPONuOEi-8n8EeJDlNyC5',
  phone: '+1 (555) 890-1234',
  currentEtaMinutes: 5,
  distanceMiles: 1.4,
  location: { x: 55, y: 35 },
};

export const availableVouchers: Voucher[] = [
  {
    id: 'vouch_gas_10',
    title: '$10 Gasoline Card',
    description: 'Valid at all major stations (Shell, Chevron, Mobil, BP)',
    pointsCost: 1000,
    category: 'fuel',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBxIw1tWYlhScw4Ar66RUqI8RkTUr_a5gggWBZYaG5dF3x7iXSS8WpGsFOXf3oo0zgskHfmv5Mn2uWz3KG8i-pYjrTwqr7iEoP5K5fh5yv2TZVDFWV5JbEYv8Rasg-F7V9i85i1Gogdv3QmpPvWsY0tiCu4JI70Z_aOXihDSncQch2Ndd5_yGzZm174psLEPSEDfv6H2-sDaDFli0Do_uDEIz2xnMJReE8pfyCtgiaxjBhPiuOCk1Gd',
  },
  {
    id: 'vouch_oil_change',
    title: 'Standard Oil Change',
    description: 'Up to 5 quarts conventional oil & filter replacement',
    pointsCost: 2500,
    category: 'maintenance',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBywmzPqNZIMy9VzUHX7NOyzpdZBOkHBiDkLhp6_Yy6kBoxMWHr3PucQ4Zyd-9iTMjS6jdHAD7B7oP18jmhowE-wbJ-zKonVueRYKUqXNyYo5ZSaTyznY2hROtau--eYMfib0iMuOmh9yMBKysoETXuCnHk3jZho5CCq6lWVQSalbpH7OHMos1y4Ty5DJhj0W45TxFjJRrgC6PSqcLSjhAkiBww08LskM1a-lN4Fk1Ahv_aaUGkOn8W',
  },
  {
    id: 'vouch_coffee',
    title: 'Premium Coffee',
    description: 'Any size hot/iced brew at partner roadside cafes',
    pointsCost: 500,
    category: 'food',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDeS0EISGjjqM1HSwNWgciirLaAUhawzKCLRKKgCpXbOZUsNMdCTzMw9XniZqy1RuOcGq-0hYWdHM7sgVhbsIlfZXZJgwuvJJIGEaNYvmUptFeDg3wf2cMS9vlPmn6O2sM6rZG37hyRXFY3IiTFAC2D3dhsUYMpBPXi4aD1Z68K8f33R1BbqVpO3f6lrURgU0J88yGX0N78IYlc1_K35Zvwa_SeUmJzfPjCqAc-w3IR9oMLnzqFTg_J',
  },
  {
    id: 'vouch_tire_rotation',
    title: 'Tire Pressure & Rotation',
    description: 'Complimentary 4-wheel inspection and tire rotation',
    pointsCost: 1500,
    category: 'maintenance',
    imageUrl: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=600&q=80',
  },
];

export const initialChatMessages: ChatMessage[] = [
  {
    id: 'msg_1',
    sender: 'helper',
    text: "Hi there, I see your request for a battery jump. I'm about 15 minutes away.",
    timestamp: '10:42 AM',
  },
  {
    id: 'msg_2',
    sender: 'user',
    text: "Great, thanks. I'm parked near the main entrance of the mall.",
    timestamp: '10:44 AM',
  },
  {
    id: 'msg_3',
    sender: 'helper',
    text: 'Can do the jump start for $50. Does that work for you?',
    timestamp: '10:46 AM',
    isOffer: true,
    offerAmount: 50.00,
    offerStatus: 'pending',
  },
];

export const initialPastRequests: AssistanceRequest[] = [
  {
    id: 'REQ-8821',
    issueType: 'battery',
    issueTitle: 'Battery Jump Start',
    issueDescription: 'Car won’t crank in underground mall parking level B2',
    locationAddress: '1-10 E 1st St, Los Angeles, CA',
    locationCoordinates: { lat: 34.0522, lng: -118.2437 },
    vehicle: {
      id: 'veh_1',
      make: 'Toyota',
      model: 'Camry',
      year: 2019,
      color: 'Silver',
      licensePlate: '7ABC123',
    },
    createdAt: 'Today, 10:35 AM',
    status: 'en_route',
    helper: defaultHelperMarcus,
    agreedPrice: 50.00,
    paymentMethod: 'cash_or_transfer',
    offerStatus: 'pending',
  },
  {
    id: 'REQ-7910',
    issueType: 'flat_tire',
    issueTitle: 'Flat Tire Replacement',
    issueDescription: 'Punctured rear right tire on freeway shoulder',
    locationAddress: 'I-5 Northbound Exit 138, Los Angeles, CA',
    locationCoordinates: { lat: 34.0722, lng: -118.2337 },
    vehicle: {
      id: 'veh_1',
      make: 'Toyota',
      model: 'Camry',
      year: 2019,
      color: 'Silver',
      licensePlate: '7ABC123',
    },
    createdAt: 'May 12, 2026',
    status: 'completed',
    helper: defaultHelperJohn,
    agreedPrice: 45.00,
    paymentMethod: 'cash_or_transfer',
    offerStatus: 'accepted',
  },
];
