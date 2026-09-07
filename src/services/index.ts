/** 
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Supabase Client - Explicit exports to avoid conflicts
export { supabase, supabaseAdmin, subscribeToTable, subscribeToRow, subscribeToUserProfileChanges, subscribeToVerificationChanges, cleanupAllSubscriptions } from './supabaseClient';

// Auth Service - Only auth-specific functions
export { signUpWithEmail, signUpWithPhone, signInWithEmail, signInWithPhone, verifyOtp, signOut, getCurrentUser, onAuthStateChange, createUserProfile as authCreateUserProfile } from './authService';

// User Profile Service - Profile-specific functions
export { getUserProfile, getUserProfileByPhone, createUserProfile, updateUserProfile, getAllHelpers, updateUserReputation, subscribeToUserProfile } from './userProfileService';

// Verifications Service
export { getVerificationByUserId, getVerificationsByStatus, createVerification, updateVerification, approveVerification, rejectVerification, subscribeToVerification } from './verificationsService';

// SOS Service
export { createSOSRequest, updateSOSRequestStatus, assignHelper, cancelSOSRequest, resolveSOSRequest, getActiveSOSRequests, getNearbySOSRequests, getSOSRequestById, subscribeToSOSRequests, subscribeToSOSRequest } from './sosService';

// Testing Functions
export { testSupabaseConnection, simpleSupabaseTest } from './supabaseTest';
