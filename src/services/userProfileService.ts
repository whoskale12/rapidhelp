/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { supabase } from './supabaseClient';

/**
 * User Profile Data Interface
 */
export interface UserProfileData {
    user_id: string;
    full_name: string;
    phone_number: string;
    avatar_url?: string;
    emergency_contact_phone?: string;
    reputation_score?: number;
    is_helper?: boolean;
    created_at?: string;
    updated_at?: string;
}

/**
 * Get user profile by user_id
 */
export const getUserProfile = async (userId: string) => {
    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', userId)
            .single();
        
        if (error) throw error;
        return { data, error: null };
    } catch (error: any) {
        console.error('❌ Error fetching user profile:', error.message);
        return { data: null, error };
    }
};

/**
 * Get user profile by phone number
 */
export const getUserProfileByPhone = async (phoneNumber: string) => {
    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('phone_number', phoneNumber)
            .single();
        
        if (error) throw error;
        return { data, error: null };
    } catch (error: any) {
        console.error('❌ Error fetching user profile by phone:', error.message);
        return { data: null, error };
    }
};

/**
 * Create new user profile
 */
export const createUserProfile = async (profileData: UserProfileData) => {
    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .insert({
                user_id: profileData.user_id,
                full_name: profileData.full_name,
                phone_number: profileData.phone_number,
                avatar_url: profileData.avatar_url || null,
                emergency_contact_phone: profileData.emergency_contact_phone || null,
                is_helper: profileData.is_helper || false,
                reputation_score: 3.5,
            })
            .select()
            .single();
        
        if (error) throw error;
        console.log('✅ User profile created successfully');
        return { data, error: null };
    } catch (error: any) {
        console.error('❌ Error creating user profile:', error.message);
        return { data: null, error };
    }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId: string, updateData: Partial<UserProfileData>) => {
    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .update({
                full_name: updateData.full_name,
                avatar_url: updateData.avatar_url,
                emergency_contact_phone: updateData.emergency_contact_phone,
                is_helper: updateData.is_helper,
                updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId)
            .select()
            .single();
        
        if (error) throw error;
        console.log('✅ User profile updated successfully');
        return { data, error: null };
    } catch (error: any) {
        console.error('❌ Error updating user profile:', error.message);
        return { data: null, error };
    }
};

/**
 * Get all helpers
 */
export const getAllHelpers = async (limit: number = 100) => {
    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('is_helper', true)
            .order('reputation_score', { ascending: false })
            .limit(limit);
        
        if (error) throw error;
        return { data, error: null };
    } catch (error: any) {
        console.error('❌ Error fetching helpers:', error.message);
        return { data: null, error };
    }
};

/**
 * Update user reputation score
 */
export const updateUserReputation = async (userId: string, reputationDelta: number) => {
    try {
        const { data: profile, error: fetchError } = await getUserProfile(userId);
        if (fetchError || !profile) throw fetchError || new Error('Profile not found');
        
        const newReputation = Math.max(0, Math.min(5, profile.reputation_score + reputationDelta));
        
        const { data, error } = await supabase
            .from('user_profiles')
            .update({ reputation_score: newReputation })
            .eq('user_id', userId)
            .select()
            .single();
        
        if (error) throw error;
        console.log(`✅ User reputation updated: ${profile.reputation_score} → ${newReputation}`);
        return { data, error: null };
    } catch (error: any) {
        console.error('❌ Error updating user reputation:', error.message);
        return { data: null, error };
    }
};

/**
 * Subscribe to user profile changes
 */
export const subscribeToUserProfile = (userId: string, callback: (payload: any) => void) => {
    try {
        return supabase
            .channel(`user-profile-${userId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'user_profiles',
                    filter: `user_id=eq.${userId}`,
                },
                callback
            )
            .subscribe();
    } catch (error: any) {
        console.error('❌ Error subscribing to user profile changes:', error.message);
        return null;
    }
};