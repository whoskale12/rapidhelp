# 📚 SUPABASE INTEGRATION - COMPLETE

## ✅ Status: Production Ready

Supabase fully integrated dengan:
- ✅ Auth (Email, Phone OTP)
- ✅ User Profiles
- ✅ KYC Verification
- ✅ SOS Requests
- ✅ Realtime Listeners
- ✅ RLS Policies

---

## 🔧 Setup

**File: `.env`**
```env
VITE_SUPABASE_URL="https://buvamcvrwhwbggkcmqra.supabase.co"
VITE_SUPABASE_ANON_KEY="sb_publishable_Aal0bi6F8iCIU3qQJd83xg_jrwNsHqp"
```

---

## 📁 Services

```
src/services/
├── supabaseClient.ts      # Client + Realtime
├── authService.ts         # Auth functions
├── userProfileService.ts  # User CRUD
├── verificationsService.ts # KYC
├── sosService.ts          # SOS + Realtime
└── index.ts              # Exports
```

---

## 🚀 Usage Examples

### Auth
```typescript
import { signUpWithPhone, verifyOtp, getCurrentUser } from '../services';

const { data } = await signUpWithPhone('+62812345678');
const { data: session } = await verifyOtp('+62812345678', '123456', 'sms');
const user = await getCurrentUser();
```

### Profile
```typescript
import { getUserProfile, updateUserProfile, getAllHelpers } from '../services';

const { data: profile } = await getUserProfile('user-id');
await updateUserProfile('user-id', { full_name: 'Jane' });
const { data: helpers } = await getAllHelpers(50);
```

### SOS + Realtime
```typescript
import { createSOSRequest, subscribeToSOSRequestChanges } from '../services';

const { data: request } = await createSOSRequest(
  'user-id', 'Flat Tire', 'Punctured', -6.2088, 106.8456
);

const { unsubscribe } = subscribeToSOSRequestChanges((payload) => {
  console.log('Update:', payload.new);
});
```

### Verification
```typescript
import { createVerification, getVerificationByUserId } from '../services';

await createVerification({
  user_id: 'user-id',
  id_card_image_path: 'storage/id.jpg',
  face_image_path: 'storage/face.jpg',
});

const { data: verification } = await getVerificationByUserId('user-id');
```

---

## 🔔 Realtime in React
```typescript
import { useEffect } from 'react';
import { subscribeToSOSRequestChanges } from '../services';

export function SOSTracker() {
  useEffect(() => {
    const { unsubscribe } = subscribeToSOSRequestChanges((payload) => {
      console.log('Real-time:', payload.new);
    });
    return () => unsubscribe();
  }, []);
}
```

---

## 💾 Tables

**user_profiles** - user_id, full_name, phone_number, avatar_url, reputation_score, is_helper

**verifications** - id, user_id, id_card_number, verification_status (PENDING/APPROVED/REJECTED)

**sos_requests** - id, requester_id, helper_id, title, description, latitude, longitude, status (SEARCHING/ACCEPTED/RESOLVED/CANCELLED)

---

**Last Updated:** Sept 7, 2026 | Status: ✅ Ready
