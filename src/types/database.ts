/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Database types for Supabase integration
 * These types match the PostgreSQL schema
 */

export interface UserProfile {
    id: string;
    user_id: string;
    full_name: string;
    phone_number: string;
    avatar_url: string | null;
    emergency_contact_phone: string | null;
    reputation_score: number;
    is_verified: boolean;
    created_at: string;
    updated_at: string;
}

export interface Verification {
    id: string;
    user_id: string;
    id_card_number: string | null;
    id_card_image_path: string;
    face_image_path: string;
    verification_status: 'PENDING' | 'APPROVED' | 'REJECTED';
    rejection_reason: string | null;
    verified_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface SOSRequest {
    id: string;
    requester_id: string;
    helper_id: string | null;
    title: string;
    description: string;
    latitude: number;
    longitude: number;
    location_geog: {
        type: string;
        coordinates: [number, number];
    };
    status: 'SEARCHING' | 'ACCEPTED' | 'RESOLVED' | 'CANCELLED';
    created_at: string;
    updated_at: string;
}

export interface ActiveSOSRequestWithRequester extends SOSRequest {
    requester_name: string;
    requester_phone: string;
    requester_avatar: string | null;
    time_elapsed: string;
}

export interface CompletedRequestWithHelper {
    id: string;
    requester_id: string;
    requester_name: string;
    helper_id: string | null;
    helper_name: string | null;
    helper_reputation: number | null;
    title: string;
    description: string;
    latitude: number;
    longitude: number;
    status: 'RESOLVED' | 'CANCELLED';
    created_at: string;
    updated_at: string;
    resolution_time: string;
}

export interface NearbySOSRequest {
    id: string;
    requester_id: string;
    title: string;
    description: string;
    latitude: number;
    longitude: number;
    status: 'SEARCHING';
    distance_meters: number;
    created_at: string;
}