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
Future<AuthUser?> getCurrentUser() async {
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
Future<({AuthResponse response, String? userId})> signUpWithPhone(String phone) async {
  try {
    print('🔵 AUTH FLOW: Starting phone signup with: $phone');
    
    final response = await supabase.auth.signUpWithPhone(phone);
    final userId = response.user?.id;
    
    if (response.session != null) {
      print('✅ AUTH PHONE SIGNUP: Session created');
      print('🔵 AUTH USER ID: $userId');
    } else {
      print('ℹ️  AUTH PHONE SIGNUP: OTP sent, awaiting verification');
    }
    
    return (response: response, userId: userId);
  } catch (e) {
    print('❌ AUTH SIGNUP ERROR: ${e.toString()}');
    if (e is AuthException) {
      print('❌ AUTH EXCEPTION: ${e.message}');
      print('📍 Status Code: ${e.statusCode}');
    }
    rethrow;
  }
}

/// Verify OTP token
Future<({AuthResponse response, String? userId})> verifyOtp({
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
      return (response: response, userId: userId);
    } else {
      print('❌ OTP VERIFICATION FAILED: No user returned');
      throw Exception('OTP verification failed - no user returned');
    }
  } catch (e) {
    print('❌ OTP VERIFY ERROR: ${e.toString()}');
    if (e is AuthException) {
      print('❌ AUTH EXCEPTION: ${e.message}');
      print('📍 Status Code: ${e.statusCode}');
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