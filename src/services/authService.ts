/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { supabase } from './supabaseClient';
import type { AuthResponse, User } from '@supabase/supabase-js';

/**
 * Authentication service for Supabase integration
 */
export interface AuthResponseData {
    user: User | null;
    session: any;
    error: Error | null;
}

/**
 * Sign up with email and password
 */
export const signUpWithEmail = async (
    email: string,
    password: string
): Promise<any> => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
    });
    return { data, error };
};

/**
 * Sign up with phone number (OTP)
 */
export const signUpWithPhone = async (
    phone: string
): Promise<any> => {
    const { data, error } = await supabase.auth.signInWithOtp({
        phone,
        options: {
            channel: 'sms',
        },
    });
    return { data, error };
};

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (
    email: string,
    password: string
): Promise<any> => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    return { data, error };
};

/**
 * Sign in with phone and OTP
 */
export const signInWithPhone = async (
    phone: string,
    otp: string
): Promise<AuthResponse> => {
    const { data, error } = await supabase.auth.signInWithOtp({
        phone,
        options: {
            channel: 'sms',
        },
    });
    return { data, error };
};

/**
 * Sign in with OTP token
 */
export const verifyOtp = async (
    phone: string,
    token: string,
    type: 'sms' | 'phone_change'
): Promise<any> => {
    const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type,
    });
    return { data, error };
};

/**
 * Sign in/out current session
 */
export const signOut = async (): Promise<{ error: Error | null }> => {
    const { error } = await supabase.auth.signOut();
    return { error };
};

/**
 * Get current user from session
 */
export const getCurrentUser = async (): Promise<User | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChange = (
    callback: (event: string, session: any) => void
) => {
    return supabase.auth.onAuthStateChange(callback);
};

/**
 * Update user profile after authentication
 */
export const updateUserProfile = async (
    userId: string,
    data: {
        full_name?: string;
        phone_number?: string;
        avatar_url?: string;
        emergency_contact_phone?: string;
    }
) => {
    const { data: result, error } = await supabase
        .from('user_profiles')
        .upsert({ user_id: userId, ...data }, {
            onConflict: 'user_id'
        })
        .select()
        .single();
    
    return { data: result, error };
};

/**
 * Create user profile after signup
 */
export const createUserProfile = async (
    userId: string,
    data: {
        full_name: string;
        phone_number: string;
        avatar_url?: string;
        emergency_contact_phone?: string;
    }
) => {
    const { data: result, error } = await supabase
        .from('user_profiles')
        .insert({ user_id: userId, ...data })
        .select()
        .single();
    
    return { data: result, error };
};

/**
 * Check if user has verification record
 */
export const getVerificationStatus = async (userId: string) => {
    const { data, error } = await supabase
        .from('verifications')
        .select('*')
        .eq('user_id', userId)
        .single();
    
    return { data, error };
};

/**
 * Submit verification request
 */
export const submitVerification = async (
    userId: string,
    data: {
        id_card_number?: string;
        id_card_image_path: string;
        face_image_path: string;
    }
) => {
    const { data: result, error } = await supabase
        .from('verifications')
        .insert({ user_id: userId, ...data })
        .select()
        .single();
    
    return { data: result, error };
};

/**
 * Get user profile by user_id
 */
export const getUserProfile = async (userId: string) => {
    const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
    
    return { data, error };
};

/**
 * Get user profile by phone number
 */
export const getUserProfileByPhone = async (phoneNumber: string) => {
    const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('phone_number', phoneNumber)
        .single();
    
    return { data, error };
};