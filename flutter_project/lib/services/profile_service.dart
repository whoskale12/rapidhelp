import 'package:supabase_flutter/supabase_flutter.dart';
import 'supabase_service.dart';
import '../models/user_profile.dart';

/// Create user profile in Supabase after successful auth
Future<bool> createUserProfile({
  required String userId,
  required String fullName,
  required String phone,
  required String email,
  required Vehicle? vehicle,
}) async {
  try {
    print('🔵 PROFILE CREATION: Starting for user: $userId');
    print('📝 Full Name: $fullName');
    print('📱 Phone: $phone');
    print('📧 Email: $email');

    // Prepare vehicle data
    final vehicleData = vehicle != null
        ? {
            'make': vehicle.make,
            'model': vehicle.model,
            'year': vehicle.year,
            'color': vehicle.color,
            'license_plate': vehicle.licensePlate,
          }
        : null;

    // Insert into user_profiles table
    final response = await supabase
        .from('user_profiles')
        .insert({
          'user_id': userId,
          'full_name': fullName,
          'phone': phone,
          'email': email,
          'vehicle_info': vehicleData,
          'is_helper': false,
          'reputation_score': 0,
          'created_at': DateTime.now().toIso8601String(),
          'updated_at': DateTime.now().toIso8601String(),
        })
        .select();

    print('✅ PROFILE CREATED: Inserted to user_profiles table');
    print('🔵 SUPABASE RESPONSE: $response');
    return true;
  } on PostgrestException catch (e) {
    print('❌ POSTGREST ERROR: ${e.message}');
    print('📍 Error Code: ${e.code}');
    print('📍 Status Code: ${e.statusCode}');
    print('📍 Details: ${e.details}');
    print('📍 Hint: ${e.hint}');
    rethrow;
  } catch (e) {
    print('❌ PROFILE CREATION ERROR: ${e.toString()}');
    rethrow;
  }
}

/// Get user profile by user ID
Future<Map<String, dynamic>?> getUserProfile(String userId) async {
  try {
    print('🔵 PROFILE FETCH: Getting profile for user: $userId');

    final response = await supabase
        .from('user_profiles')
        .select()
        .eq('user_id', userId)
        .single();

    print('✅ PROFILE FETCHED: ${response['full_name']}');
    print('🔵 SUPABASE RESPONSE: $response');
    return response;
  } on PostgrestException catch (e) {
    if (e.code == 'PGRST116') {
      print('⚠️  PROFILE NOT FOUND: No profile for user: $userId');
      return null;
    }
    print('❌ POSTGREST ERROR: ${e.message}');
    print('📍 Error Code: ${e.code}');
    print('📍 Details: ${e.details}');
    rethrow;
  } catch (e) {
    print('❌ PROFILE FETCH ERROR: ${e.toString()}');
    rethrow;
  }
}

/// Update user profile
Future<bool> updateUserProfile({
  required String userId,
  String? fullName,
  String? email,
  int? reputationScore,
  Vehicle? vehicle,
}) async {
  try {
    print('🔵 PROFILE UPDATE: Updating user: $userId');

    final updates = <String, dynamic>{
      'updated_at': DateTime.now().toIso8601String(),
    };

    if (fullName != null) {
      updates['full_name'] = fullName;
      print('📝 Updating name: $fullName');
    }
    if (email != null) {
      updates['email'] = email;
      print('📧 Updating email: $email');
    }
    if (reputationScore != null) {
      updates['reputation_score'] = reputationScore;
      print('⭐ Updating reputation: $reputationScore');
    }
    if (vehicle != null) {
      updates['vehicle_info'] = {
        'make': vehicle.make,
        'model': vehicle.model,
        'year': vehicle.year,
        'color': vehicle.color,
        'license_plate': vehicle.licensePlate,
      };
      print('🚗 Updating vehicle: ${vehicle.year} ${vehicle.make} ${vehicle.model}');
    }

    await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', userId);

    print('✅ PROFILE UPDATED: Success');
    return true;
  } on PostgrestException catch (e) {
    print('❌ POSTGREST ERROR: ${e.message}');
    print('📍 Error Code: ${e.code}');
    print('📍 Details: ${e.details}');
    rethrow;
  } catch (e) {
    print('❌ PROFILE UPDATE ERROR: ${e.toString()}');
    rethrow;
  }
}

/// Test connection to Supabase - Simple check
Future<bool> testSupabaseConnection() async {
  try {
    print('🧪 TEST: Supabase connection check');

    // Try to count records in user_profiles
    final response = await supabase
        .from('user_profiles')
        .select('count', const FetchOptions(count: CountOption.exact))
        .limit(1);

    print('✅ TEST PASSED: Connection successful');
    print('🔵 TEST RESPONSE: $response');
    return true;
  } catch (e) {
    print('❌ TEST FAILED: ${e.toString()}');
    return false;
  }
}

/// Subscribe to user profile changes (Realtime)
void subscribeToProfileChanges(
  String userId,
  Function(Map<String, dynamic>) onData,
  Function(Object) onError,
) {
  try {
    print('🔵 REALTIME: Subscribing to profile changes for: $userId');

    supabase
        .from('user_profiles')
        .on(RealtimeListenTypes.all, (payload) {
          print('🔄 REALTIME UPDATE: Profile changed');
          print('🔵 PAYLOAD: ${payload.newRecord}');
          onData(payload.newRecord as Map<String, dynamic>);
        })
        .eq('user_id', userId)
        .subscribe();

    print('✅ REALTIME: Subscription active');
  } catch (e) {
    print('❌ REALTIME ERROR: ${e.toString()}');
    onError(e);
  }
}