/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { supabase } from './supabaseClient';

/**
 * Verification Status Enum
 */
export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

/**
 * Verification Data Interface
 */
export interface VerificationData {
    id?: string;
    user_id: string;
    id_card_number?: string;
    id_card_image_path?: string;
    face_image_path?: string;
    verification_status?: VerificationStatus;
    rejection_reason?: string;
    verified_at?: string;
    created_at?: string;
    updated_at?: string;
}

/**
 * Get verification record by user_id
 */
export const getVerificationByUserId = async (userId: string) => {
    try {
        const { data, error } = await supabase
            .from('verifications')
            .select('*')
            .eq('user_id', userId)
            .single();
        
        if (error) throw error;
        return { data, error: null };
    } catch (error: any) {
        console.error('❌ Error fetching verification:', error.message);
        return { data: null, error };
    }
};

/**
 * Get verification by status
 */
export const getVerificationsByStatus = async (status: VerificationStatus) => {
    try {
        const { data, error } = await supabase
            .from('verifications')
            .select('*')
            .eq('verification_status', status)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return { data, error: null };
    } catch (error: any) {
        console.error('❌ Error fetching verifications by status:', error.message);
        return { data: null, error };
    }
};

/**
 * Create new verification record
 */
export const createVerification = async (verificationData: Omit<VerificationData, 'id' | 'created_at' | 'updated_at'>) => {
    try {
        const { data, error } = await supabase
            .from('verifications')
            .insert({
                user_id: verificationData.user_id,
                id_card_number: verificationData.id_card_number,
                id_card_image_path: verificationData.id_card_image_path,
                face_image_path: verificationData.face_image_path,
                verification_status: 'PENDING',
            })
            .select()
            .single();
        
        if (error) throw error;
        console.log('✅ Verification record created successfully');
        return { data, error: null };
    } catch (error: any) {
        console.error('❌ Error creating verification:', error.message);
        return { data: null, error };
    }
};

/**
 * Update verification record
 */
export const updateVerification = async (verificationId: string, updateData: Partial<VerificationData>) => {
    try {
        const { data, error } = await supabase
            .from('verifications')
            .update({
                id_card_number: updateData.id_card_number,
                id_card_image_path: updateData.id_card_image_path,
                face_image_path: updateData.face_image_path,
                verification_status: updateData.verification_status,
                rejection_reason: updateData.rejection_reason,
                verified_at: updateData.verified_at || null,
                updated_at: new Date().toISOString(),
            })
            .eq('id', verificationId)
            .select()
            .single();
        
        if (error) throw error;
        console.log('✅ Verification record updated successfully');
        return { data, error: null };
    } catch (error: any) {
        console.error('❌ Error updating verification:', error.message);
        return { data: null, error };
    }
};

/**
 * Approve verification
 */
export const approveVerification = async (verificationId: string) => {
    try {
        const { data, error } = await supabase
            .from('verifications')
            .update({
                verification_status: 'APPROVED',
                verified_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq('id', verificationId)
            .select()
            .single();
        
        if (error) throw error;
        console.log('✅ Verification approved');
        return { data, error: null };
    } catch (error: any) {
        console.error('❌ Error approving verification:', error.message);
        return { data: null, error };
    }
};

/**
 * Reject verification
 */
export const rejectVerification = async (verificationId: string, rejectionReason: string) => {
    try {
        const { data, error } = await supabase
            .from('verifications')
            .update({
                verification_status: 'REJECTED',
                rejection_reason: rejectionReason,
                updated_at: new Date().toISOString(),
            })
            .eq('id', verificationId)
            .select()
            .single();
        
        if (error) throw error;
        console.log('✅ Verification rejected');
        return { data, error: null };
    } catch (error: any) {
        console.error('❌ Error rejecting verification:', error.message);
        return { data: null, error };
    }
};

/**
 * Subscribe to verification status changes
 */
export const subscribeToVerification = (userId: string, callback: (payload: any) => void) => {
    try {
        return supabase
            .channel(`verification-${userId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'verifications',
                    filter: `user_id=eq.${userId}`,
                },
                callback
            )
            .subscribe();
    } catch (error: any) {
        console.error('❌ Error subscribing to verification changes:', error.message);
        return null;
    }
};