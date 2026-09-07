/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Supabase configuration from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Validate configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase configuration missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
  console.error('   VITE_SUPABASE_URL:', supabaseUrl ? '✅ set' : '❌ missing');
  console.error('   VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ set' : '❌ missing');
}

// Create primary Supabase client for client-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-client-info': 'rapidhelp/1.0',
    },
  },
});

// Create admin client for backend operations (optional, use with service role key)
export const supabaseAdmin = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

// Log connection status (development only)
if (import.meta.env.DEV) {
  console.log('🌱 Supabase initialized');
  console.log('   URL:', supabaseUrl);
  console.log('   Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : '❌ missing');
  console.log('   Admin client:', supabaseAdmin ? '✅ available' : '⚠️  not configured');
}

// ============================================================================
// REALTIME LISTENER UTILITIES
// ============================================================================

/**
 * Realtime subscription manager
 */
interface Subscription {
  channel: any;
  subscription: any;
}

const subscriptions = new Map<string, Subscription>();

/**
 * Subscribe to Realtime changes on a table
 */
export const subscribeToTable = (
  tableName: string,
  callback: (payload: any) => void
): { unsubscribe: () => void } => {
  const channelId = `table-${tableName}`;
  
  // Unsubscribe if already subscribed
  if (subscriptions.has(channelId)) {
    subscriptions.get(channelId)?.subscription.unsubscribe();
  }

  const channel = supabase.channel(channelId);
  
  const subscription = channel
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: tableName,
      },
      callback
    )
    .subscribe((status: string) => {
      if (import.meta.env.DEV) {
        console.log(`🚀 Subscribed to ${tableName} (${status})`);
      }
    });

  subscriptions.set(channelId, { channel, subscription });

  return {
    unsubscribe: () => {
      subscription.unsubscribe();
      subscriptions.delete(channelId);
      if (import.meta.env.DEV) {
        console.log(`Stopped subscription to ${tableName}`);
      }
    },
  };
};

/**
 * Subscribe to specific row changes
 */
export const subscribeToRow = (
  tableName: string,
  rowId: string,
  callback: (payload: any) => void
): { unsubscribe: () => void } => {
  const channelId = `row-${tableName}-${rowId}`;

  if (subscriptions.has(channelId)) {
    subscriptions.get(channelId)?.subscription.unsubscribe();
  }

  const channel = supabase.channel(channelId);

  const subscription = channel
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: tableName,
        filter: `id=eq.${rowId}`,
      },
      callback
    )
    .subscribe((status: string) => {
      if (import.meta.env.DEV) {
        console.log(`🚀 Subscribed to ${tableName} row ${rowId} (${status})`);
      }
    });

  subscriptions.set(channelId, { channel, subscription });

  return {
    unsubscribe: () => {
      subscription.unsubscribe();
      subscriptions.delete(channelId);
    },
  };
};

/**
 * Subscribe to SOS request changes (wrapper for sosService)
 */
export const subscribeToSOSRequestChanges = (
  callback: (payload: any) => void
): { unsubscribe: () => void } => {
  return subscribeToTable('sos_requests', callback);
};

/**
 * Subscribe to user profile changes
 */
export const subscribeToUserProfileChanges = (
  userId: string,
  callback: (payload: any) => void
): { unsubscribe: () => void } => {
  return subscribeToRow('user_profiles', userId, callback);
};

/**
 * Subscribe to verification status changes
 */
export const subscribeToVerificationChanges = (
  userId: string,
  callback: (payload: any) => void
): { unsubscribe: () => void } => {
  return subscribeToRow('verifications', userId, callback);
};

/**
 * Cleanup all subscriptions (call on unmount)
 */
export const cleanupAllSubscriptions = () => {
  subscriptions.forEach((sub, key) => {
    sub.subscription.unsubscribe();
    if (import.meta.env.DEV) {
      console.log(`Stopped subscription: ${key}`);
    }
  });
  subscriptions.clear();
};

// Auto-cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', cleanupAllSubscriptions);
}