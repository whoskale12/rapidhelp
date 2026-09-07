/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { supabase, signUpWithPhone, verifyOtp, getCurrentUser, createUserProfile, getUserProfile } from '../services';

export const SupabaseAuthHandler = ({ children, onCompleteAuth, initialUser }: { 
  children: React.ReactNode; 
  onCompleteAuth: (user: any) => void;
  initialUser?: any;
}) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      const existingUser = await getCurrentUser();
      if (existingUser) {
        setUser(existingUser);
        setLoading(false);
        
        // Try to fetch user profile
        const { data: profile } = await getUserProfile(existingUser.id);
        if (profile) {
          onCompleteAuth(profile);
        }
      } else {
        setLoading(false);
      }
    };

    checkSession();

    // Subscribe to auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      
      if (currentUser && event === 'SIGNED_IN') {
        const { data: profile } = await getUserProfile(currentUser.id);
        if (profile) {
          onCompleteAuth(profile);
        } else {
          // User exists but no profile - create one
          const newUser = {
            user_id: currentUser.id,
            full_name: currentUser.email ? currentUser.email.split('@')[0] : 'User',
            phone_number: currentUser.phone || '',
          };
          await createUserProfile({
            user_id: newUser.user_id,
            full_name: newUser.full_name,
            phone_number: newUser.phone_number,
          });
        }
      } else if (!currentUser) {
        onCompleteAuth(initialUser || null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9f9f9]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#b7131a] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#1a1c1c] font-medium">Loading RapidHelp...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};