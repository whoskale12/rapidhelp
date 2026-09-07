# RapidHelp - Supabase Integration Documentation

## 📋 Overview

RapidHelp menggunakan Supabase sebagai backend untuk authentication, database, dan real-time features.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install @supabase/supabase-js
```

### 2. Environment Variables
```
VITE_SUPABASE_URL=https://buvamcvrwhwbggkcmqra.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_Aal0bi6F8iCIU3qQJd83xg_jrwNsHqp
```

### 3. Database Schema
Schema sudah di-setup di Supabase. File referensi: `supabase/schema.sql`

## 🔐 Authentication

### Phone-based Sign Up
```typescript
import { signUpWithPhone, verifyOtp, createUserProfile } from '@/services/authService';

// Step 1: Send OTP
const { data } = await signUpWithPhone('+1234567890');

// Step 2: Verify OTP
const { data: session } = await verifyOtp('+1234567890', 'OTP_CODE', 'sms');

// Step 3: Create profile
const user = await getCurrentUser();
await createUserProfile(user.id, {
    full_name: 'John Doe',
    phone_number: '+1234567890',
});
```

### Listen to Auth Changes
```typescript
import { onAuthStateChange } from '@/services/authService';

const { data: { subscription } } = onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
        console.log('User signed in');
    }
});
```

## 🆘 SOS Requests

### Create Request
```typescript
import { createSOSRequest } from '@/services/sosService';

const { data } = await createSOSRequest(
    userId,
    'Battery Jump Start',
    'Car died at mall',
    34.0522,
    -118.2437
);
```

### Find Nearby Requests
```typescript
import { getNearbySOSRequests } from '@/services/sosService';

// Find within 5km
const { data: nearby } = await getNearbySOSRequests(lat, lng, 5000);
```

### Accept Request
```typescript
import { assignHelper } from '@/services/sosService';

const { data } = await assignHelper(requestId, helperId);
```

## 📡 Real-time Subscriptions

```typescript
import { subscribeToSOSRequest } from '@/services/sosService';

const sub = subscribeToSOSRequest(requestId, (payload) => {
    console.log('Request updated:', payload.new);
});

// Clean up
await sub.unsubscribe();
```

## 📚 Services

### authService.ts
- `signUpWithPhone()` - Register with phone
- `verifyOtp()` - Verify OTP code
- `getCurrentUser()` - Get logged-in user
- `createUserProfile()` - Create user profile
- `getVerificationStatus()` - Check verification
- `submitVerification()` - Submit ID/face verification

### sosService.ts
- `createSOSRequest()` - Create SOS request
- `getNearbySOSRequests()` - Find nearby requests
- `assignHelper()` - Assign helper to request
- `updateSOSRequestStatus()` - Update request status
- `subscribeToSOSRequest()` - Real-time updates

### supabaseClient.ts
- Supabase client initialization
- Environment configuration

## 🗄️ Database Tables

### user_profiles
- id, user_id, full_name, phone_number, avatar_url, emergency_contact_phone
- reputation_score, is_verified, created_at, updated_at

### verifications
- id, user_id, id_card_number, id_card_image_path, face_image_path
- verification_status, rejection_reason, verified_at, created_at, updated_at

### sos_requests
- id, requester_id, helper_id, title, description
- latitude, longitude, location_geog (PostGIS)
- status, created_at, updated_at

## 🔒 Row Level Security (RLS)

- **user_profiles**: Read all, update own
- **verifications**: Read own, update service_role only
- **sos_requests**: Read SEARCHING (all), read own, update own/assigned

## 📖 Next Steps

1. Install dependencies: `npm install`
2. Configure environment variables in `.env.local`
3. Implement auth screen with phone verification
4. Add SOS request creation to HomeScreen
5. Add real-time subscription listeners
6. Test with Supabase dashboard