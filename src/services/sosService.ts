/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { supabase } from './supabaseClient';

export type SOSRequestStatus = 'SEARCHING' | 'ACCEPTED' | 'RESOLVED' | 'CANCELLED';

export interface SOSRequest {
    id: string;
    requester_id: string;
    helper_id: string | null;
    title: string;
    description: string;
    latitude: number;
    longitude: number;
    location_geog: any;
    status: SOSRequestStatus;
    created_at: string;
    updated_at: string;
}

export interface NearbySOSRequest {
    id: string;
    requester_id: string;
    title: string;
    description: string;
    latitude: number;
    longitude: number;
    status: SOSRequestStatus;
    distance_meters: number;
    created_at: string;
}

/**
 * Create a new SOS request
 */
export const createSOSRequest = async (
    requesterId: string,
    title: string,
    description: string,
    latitude: number,
    longitude: number
): Promise<{ data: SOSRequest | null; error: any }> => {
    const { data, error } = await supabase
        .from('sos_requests')
        .insert({
            requester_id: requesterId,
            title,
            description,
            latitude,
            longitude,
            status: 'SEARCHING',
        })
        .select()
        .single();
    
    return { data, error };
};

/**
 * Update SOS request status
 */
export const updateSOSRequestStatus = async (
    requestId: string,
    status: SOSRequestStatus
): Promise<{ data: SOSRequest | null; error: any }> => {
    const { data, error } = await supabase
        .from('sos_requests')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', requestId)
        .select()
        .single();
    
    return { data, error };
};

/**
 * Assign a helper to SOS request
 */
export const assignHelper = async (
    requestId: string,
    helperId: string
): Promise<{ data: SOSRequest | null; error: any }> => {
    const { data, error } = await supabase
        .from('sos_requests')
        .update({ 
            helper_id: helperId, 
            status: 'ACCEPTED',
            updated_at: new Date().toISOString() 
        })
        .eq('id', requestId)
        .select()
        .single();
    
    return { data, error };
};

/**
 * Cancel SOS request
 */
export const cancelSOSRequest = async (
    requestId: string,
    userId: string
): Promise<{ data: SOSRequest | null; error: any }> => {
    const { data, error } = await supabase
        .from('sos_requests')
        .update({ status: 'CANCELLED', updated_at: new Date().toISOString() })
        .eq('id', requestId)
        .eq('requester_id', userId)
        .select()
        .single();
    
    return { data, error };
};

/**
 * Resolve SOS request (completion)
 */
export const resolveSOSRequest = async (
    requestId: string
): Promise<{ data: SOSRequest | null; error: any }> => {
    const { data, error } = await supabase
        .from('sos_requests')
        .update({ status: 'RESOLVED', updated_at: new Date().toISOString() })
        .eq('id', requestId)
        .select()
        .single();
    
    return { data, error };
};

/**
 * Get active SOS requests (SEARCHING status)
 */
export const getActiveSOSRequests = async (): Promise<{ data: SOSRequest[] | null; error: any }> => {
    const { data, error } = await supabase
        .from('sos_requests')
        .select('*')
        .eq('status', 'SEARCHING')
        .order('created_at', { ascending: false });
    
    return { data, error };
};

/**
 * Get SOS requests near user location using PostGIS proximity search
 */
export const getNearbySOSRequests = async (
    latitude: number,
    longitude: number,
    radiusMeters: number = 5000
): Promise<{ data: NearbySOSRequest[] | null; error: any }> => {
    const { data, error } = await supabase.rpc('find_sos_requests_nearby', {
        user_latitude: latitude,
        user_longitude: longitude,
        distance_meters: radiusMeters,
    });
    
    return { data, error };
};

/**
 * Get SOS request by ID
 */
export const getSOSRequestById = async (
    requestId: string
): Promise<{ data: SOSRequest | null; error: any }> => {
    const { data, error } = await supabase
        .from('sos_requests')
        .select('*')
        .eq('id', requestId)
        .single();
    
    return { data, error };
};

/**
 * Subscribe to real-time SOS request changes
 */
export const subscribeToSOSRequests = (
    callback: (payload: any) => void
) => {
    return supabase
        .channel('sos-requests-channel')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'sos_requests',
            },
            callback
        )
        .subscribe();
};

/**
 * Subscribe to specific SOS request changes
 */
export const subscribeToSOSRequest = (
    requestId: string,
    callback: (payload: any) => void
) => {
    return supabase
        .channel(`sos-request-${requestId}`)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'sos_requests',
                filter: `id=eq.${requestId}`,
            },
            callback
        )
        .subscribe();
};