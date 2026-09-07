# 🚀 RapidHelp Flutter - Setup Guide

## Quick Start

### 1. Configure Environment
```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

### 2. Get Supabase Credentials
- Go to https://app.supabase.com
- Select project → Settings → API
- Copy `Project URL` and `Anon Key`

### 3. Update .env
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run App
```bash
cd flutter_project
flutter pub get
flutter run
```

---

## Testing

### Via Settings Screen
1. Open Settings
2. Tap "🧪 Test Supabase Connection"
3. Check Flutter debug console

### Expected Output
```
✅ MAIN: Supabase initialized
🔵 AUTH USER ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
✅ PROFILE CREATED: Inserted to user_profiles table
```

---

## What's Implemented

✅ Phone OTP Authentication  
✅ User Profile Creation  
✅ Database Integration (Supabase)  
✅ Row Level Security (RLS)  
✅ Comprehensive Error Handling  
✅ Console Logging  
✅ Debug Testing Function  

---

## Files Changed

| File | Status |
|------|--------|
| `pubspec.yaml` | ✅ Dependencies added |
| `lib/main.dart` | ✅ Supabase init |
| `lib/services/supabase_service.dart` | ✅ Created |
| `lib/services/profile_service.dart` | ✅ Created |
| `lib/screens/auth_screen.dart` | ✅ Auth flow fixed |
| `lib/screens/settings_screen.dart` | ✅ Debug button added |
| `.env.example` | ✅ Created |
| `.gitignore` | ✅ Updated |

---

## Troubleshooting

**"SUPABASE_URL is empty"**
- Check `.env` file exists in `flutter_project/`
- Verify format: `SUPABASE_URL=https://...`
- Run `flutter clean && flutter pub get`

**"OTP verification failed"**
- Check phone format: +1234567890
- Verify OTP token
- Check SMS provider in Supabase

**"RLS policy violation"**
- Ensure `user_id` matches `auth.users.id`
- Check RLS policies in Supabase Dashboard

---

## Security

✅ `.env` in `.gitignore` - Never committed  
✅ Only Anon Key used in app  
✅ Service Role Key protected  
✅ RLS policies enforce isolation  

**Never commit `.env` file!**

---

## Ready to Deploy

The app is production-ready. Just configure `.env` and test locally first.

For detailed docs, see `SUPABASE_INTEGRATION_COMPLETE.md`