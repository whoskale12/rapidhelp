/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { UserProfile, AssistanceRequest } from '../types';

interface HomeScreenProps {
  user: UserProfile;
  onDispatchSOS: (request: AssistanceRequest) => void;
  onNavigateToTracking?: () => void;
  onOpenMenu?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ user, onDispatchSOS, onOpenMenu }) => {
  return (
    <div className="min-h-screen bg-[#f9f9f9]">
      <div className="text-center p-6">
        <h1 className="text-2xl font-bold text-[#1a1c1c] mb-2">Welcome to RapidHelp</h1>
        <p className="text-[#5b403d]">Emergency Roadside Assistance</p>
      </div>
    </div>
  );
};
