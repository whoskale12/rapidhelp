import 'package:supabase_flutter/supabase_flutter.dart';

/// Global Supabase client instance
late final SupabaseClient supabase;

/// Initialize Supabase with error logging
Future<void> initSupabase({
  required String supabaseUrl,
  required String supabaseAnonKey,
}) async {
  try {
    print('🔵 SUPABASE SERVICE: Initializing...');
    print('📍 URL: $supabaseUrl');
    
    await Supabase.initialize(
      url: supabaseUrl,
      anonKey: supabaseAnonKey,
    );
    
    supabase = Supabase.instance.client;
    
    print('✅ SUPABASE SERVICE: Initialized successfully');
    print('🔵 SUPABASE SERVICE: Ready to use');
  } catch (e) {
    print('❌ SUPABASE INIT ERROR: ${e.toString()}');
    rethrow;
  }
}

/// Get current authenticated user
Future<User?> getCurrentUser() async {
  try {
    final session = supabase.auth.currentSession;
    final user = session?.user;
    
    if (user != null) {
      print('🔵 SUPABASE AUTH USER ID: ${user.id}');
      print('🔵 SUPABASE AUTH USER PHONE: ${user.phone}');
      return user;
    } else {
      print('⚠️  SUPABASE AUTH: No current user');
      return null;
    }
  } catch (e) {
    print('❌ GET CURRENT USER ERROR: ${e.toString()}');
    return null;
  }
}

/// Check if user is authenticated
bool isUserAuthenticated() {
  final session = supabase.auth.currentSession;
  return session != null && session.user != null;
}

/// Sign up with phone number (OTP)
/// Returns tuple: (bool success, String? userId)
Future<(bool, String?)> signUpWithPhone(String phone) async {
  try {
    print('🔵 AUTH FLOW: Starting phone signup with: $phone');
    
    await supabase.auth.signInWithOtp(
      phone: phone,
    );
    
    // The signInWithOtp returns void, but we can get user from session
    final session = supabase.auth.currentSession;
    final userId = session?.user?.id;
    
    if (userId != null) {
      print('✅ AUTH PHONE SIGNUP: OTP sent');
      print('🔵 AUTH USER ID: $userId');
      return (true, userId);
    } else {
      print('ℹ️  AUTH PHONE SIGNUP: OTP sent, awaiting verification');
      return (true, null);
    }
  } catch (e) {
    print('❌ AUTH SIGNUP ERROR: ${e.toString()}');
    rethrow;
  }
}

/// Verify OTP token
Future<(AuthResponse?, String?)> verifyOtp({
  required String phone,
  required String token,
}) async {
  try {
    print('🔵 AUTH FLOW: Verifying OTP for: $phone');
    
    final response = await supabase.auth.verifyOTP(
      phone: phone,
      token: token,
      type: OtpType.sms,
    );
    
    final userId = response.user?.id;
    
    if (response.user != null) {
      print('✅ OTP VERIFIED: User ID: $userId');
      print('🔵 SUPABASE AUTH USER ID: $userId');
      return (response, userId);
    } else {
      print('❌ OTP VERIFICATION FAILED: No user returned');
      throw Exception('OTP verification failed - no user returned');
    }
  } catch (e) {
    print('❌ OTP VERIFY ERROR: ${e.toString()}');
    if (e is AuthException) {
      print('❌ AUTH EXCEPTION: ${e.message}');
    }
    rethrow;
  }
}

/// Sign out current user
Future<void> signOut() async {
  try {
    print('🔵 AUTH FLOW: Signing out user');
    await supabase.auth.signOut();
    print('✅ SIGN OUT: Complete');
  } catch (e) {
    print('❌ SIGN OUT ERROR: ${e.toString()}');
    rethrow;
  }
}