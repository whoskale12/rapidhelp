import React, { useState } from 'react';
import { X, Copy, Check, FileCode, Download, Folder, Code, Sparkles, Terminal } from 'lucide-react';

interface FlutterFile {
  name: string;
  path: string;
  description: string;
  code: string;
}

const flutterFilesList: FlutterFile[] = [
  {
    name: 'pubspec.yaml',
    path: 'pubspec.yaml',
    description: 'Flutter dependencies configuration file',
    code: `name: rapidhelp_roadside
description: "RapidHelp - 24/7 Roadside Assistance & Emergency Response App"
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.6
  google_fonts: ^6.1.0
  intl: ^0.19.0
  provider: ^6.1.1
  flutter_animate: ^4.5.0
  confetti: ^0.7.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true`
  },
  {
    name: 'main.dart',
    path: 'lib/main.dart',
    description: 'Main App Entrypoint, State orchestration, Material 3 Theme & NavigationBar',
    code: `import 'package:flutter/material.dart';
import 'models/user_profile.dart';
import 'models/assistance_request.dart';
import 'models/chat_message.dart';
import 'theme/app_theme.dart';
import 'screens/auth_screen.dart';
import 'screens/home_screen.dart';
import 'screens/tracking_screen.dart';
import 'screens/chat_screen.dart';
import 'screens/rewards_screen.dart';
import 'screens/requests_history_screen.dart';
import 'widgets/emergency_call_dialog.dart';
import 'widgets/emergency_contacts_dialog.dart';

void main() {
  runApp(const RapidHelpApp());
}

class RapidHelpApp extends StatelessWidget {
  const RapidHelpApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'RapidHelp Roadside Rescue',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: const MainNavigationHost(),
    );
  }
}`
  },
  {
    name: 'home_screen.dart',
    path: 'lib/screens/home_screen.dart',
    description: 'Home Map with custom road painter, issue triage grid, SOS button & dispatch modal',
    code: `import 'package:flutter/material.dart';
import '../models/user_profile.dart';
import '../models/assistance_request.dart';
import '../theme/app_theme.dart';

class HomeScreen extends StatefulWidget {
  final UserProfile user;
  final Function(AssistanceRequest) onDispatchSOS;
  final VoidCallback onNavigateToTracking;
  final bool hasActiveRequest;

  const HomeScreen({
    Key? key,
    required this.user,
    required this.onDispatchSOS,
    required this.onNavigateToTracking,
    this.hasActiveRequest = false,
  }) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}`
  },
  {
    name: 'tracking_screen.dart',
    path: 'lib/screens/tracking_screen.dart',
    description: 'Live Dispatch Tracking with 3-step progress stepper, ETA, driver card & stage simulator',
    code: `import 'dart:async';
import 'package:flutter/material.dart';
import '../models/assistance_request.dart';
import '../theme/app_theme.dart';

class TrackingScreen extends StatefulWidget {
  final AssistanceRequest request;
  final VoidCallback onOpenChat;
  final VoidCallback onStartCall;
  final VoidCallback onCompleteService;
  final VoidCallback onCancelRequest;

  const TrackingScreen({
    Key? key,
    required this.request,
    required this.onOpenChat,
    required this.onStartCall,
    required this.onCompleteService,
    required this.onCancelRequest,
  }) : super(key: key);

  @override
  State<TrackingScreen> createState() => _TrackingScreenState();
}`
  },
  {
    name: 'chat_screen.dart',
    path: 'lib/screens/chat_screen.dart',
    description: 'In-app negotiation chat with direct offer widget, cash notice, GPS & photo chips',
    code: `import 'package:flutter/material.dart';
import '../models/assistance_request.dart';
import '../models/chat_message.dart';
import '../theme/app_theme.dart';

class ChatScreen extends StatefulWidget {
  final AssistanceRequest request;
  final List<ChatMessage> initialMessages;
  final VoidCallback onBack;
  final VoidCallback onStartCall;
  final Function(double) onUpdateAgreedPrice;

  const ChatScreen({
    Key? key,
    required this.request,
    required this.initialMessages,
    required this.onBack,
    required this.onStartCall,
    required this.onUpdateAgreedPrice,
  }) : super(key: key);

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}`
  },
  {
    name: 'auth_screen.dart',
    path: 'lib/screens/auth_screen.dart',
    description: '4-step KYC onboarding with animated facial scanner, oval overlay & vehicle form',
    code: `import 'dart:async';
import 'package:flutter/material.dart';
import '../models/user_profile.dart';
import '../theme/app_theme.dart';

class AuthScreen extends StatefulWidget {
  final UserProfile initialUser;
  final Function(UserProfile) onCompleteAuth;

  const AuthScreen({
    Key? key,
    required this.initialUser,
    required this.onCompleteAuth,
  }) : super(key: key);

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}`
  },
  {
    name: 'rewards_screen.dart',
    path: 'lib/screens/rewards_screen.dart',
    description: 'Points balance, voucher claims, digital barcode wallet, silent mode & emergency contacts',
    code: `import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../models/user_profile.dart';
import '../models/voucher.dart';
import '../theme/app_theme.dart';

class RewardsScreen extends StatefulWidget {
  final UserProfile user;
  final Function(UserProfile) onUpdateUser;
  final VoidCallback onOpenEmergencyContacts;

  const RewardsScreen({
    Key? key,
    required this.user,
    required this.onUpdateUser,
    required this.onOpenEmergencyContacts,
  }) : super(key: key);

  @override
  State<RewardsScreen> createState() => _RewardsScreenState();
}`
  },
  {
    name: 'app_theme.dart',
    path: 'lib/theme/app_theme.dart',
    description: 'Brand color palette (#B7131A red, #FEB300 yellow, #005EA4 blue) and Material 3 styles',
    code: `import 'package:flutter/material.dart';

class AppColors {
  static const Color primary = Color(0xFFB7131A);
  static const Color primaryLight = Color(0xFFDB322F);
  static const Color primaryContainer = Color(0xFFFFDAD6);
  static const Color onPrimaryContainer = Color(0xFF93000D);
  static const Color accentAmber = Color(0xFFFEB300);
  static const Color accentBlue = Color(0xFF005EA4);
  static const Color accentGreen = Color(0xFF15803D);
  static const Color background = Color(0xFFF9F9F9);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceVariant = Color(0xFFEEEEEE);
  static const Color outline = Color(0xFFE2E2E2);
  static const Color textPrimary = Color(0xFF1A1C1C);
  static const Color textSecondary = Color(0xFF5B403D);
}`
  },
  {
    name: 'user_profile.dart',
    path: 'lib/models/user_profile.dart',
    description: 'Vehicle, Emergency Contact, and User Profile Dart entities',
    code: `class Vehicle {
  final String id;
  final String make;
  final String model;
  final int year;
  final String color;
  final String licensePlate;
  final bool isDefault;

  Vehicle({
    required this.id,
    required this.make,
    required this.model,
    required this.year,
    required this.color,
    required this.licensePlate,
    this.isDefault = false,
  });
}`
  },
  {
    name: 'assistance_request.dart',
    path: 'lib/models/assistance_request.dart',
    description: 'AssistanceRequest & HelperDriver models with stage statuses and prices',
    code: `enum IssueCategory {
  flatTire,
  fuel,
  engine,
  battery,
  lockout,
  towing,
  medical,
}

enum RequestStatus {
  searching,
  accepted,
  enRoute,
  arrived,
  inProgress,
  completed,
  cancelled,
}`
  }
];

interface FlutterCodeHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FlutterCodeHubModal: React.FC<FlutterCodeHubModalProps> = ({ isOpen, onClose }) => {
  const [selectedFileIdx, setSelectedFileIdx] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentFile = flutterFilesList[selectedFileIdx];

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(currentFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadAll = () => {
    const combined = flutterFilesList
      .map((f) => `// ================================\n// FILE: ${f.path}\n// ================================\n\n${f.code}\n\n`)
      .join('\n');
    
    const blob = new Blob([combined], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rapidhelp_flutter_source_code.dart';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 font-['Inter',sans-serif]">
      <div className="bg-[#1e293b] text-white w-full max-w-5xl h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-700 animate-scaleUp">
        {/* Modal Header */}
        <div className="p-4 md:px-6 bg-[#0f172a] border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#02569B] text-white flex items-center justify-center shadow-md font-extrabold text-lg">
              🎯
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base md:text-lg text-white">
                  Flutter (Dart) Source Code Workspace
                </h3>
                <span className="bg-[#02569B] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Flutter 3.x / Dart
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Semua kode aplikasi telah dikonversi secara lengkap ke Flutter & Dart siap pakai!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadAll}
              className="bg-[#02569B] hover:bg-[#0175C2] text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export Semua File</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Left File Tree + Right Code Viewer */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* File Explorer Sidebar */}
          <div className="w-full md:w-64 bg-[#0f172a]/70 border-r border-slate-700 p-3 overflow-y-auto flex flex-col gap-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1 flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-[#feb300]" />
              <span>Project Files</span>
            </div>

            {flutterFilesList.map((file, idx) => (
              <button
                key={file.path}
                onClick={() => setSelectedFileIdx(idx)}
                className={`flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-all cursor-pointer ${
                  selectedFileIdx === idx
                    ? 'bg-[#02569B] text-white font-bold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <FileCode className={`w-4 h-4 shrink-0 ${selectedFileIdx === idx ? 'text-white' : 'text-[#feb300]'}`} />
                  <span className="truncate">{file.name}</span>
                </div>
              </button>
            ))}

            <div className="mt-4 p-3 bg-slate-800/50 rounded-xl border border-slate-700 text-[11px] text-slate-400 flex flex-col gap-1">
              <div className="font-bold text-white flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5 text-[#4ade80]" />
                <span>Run Command:</span>
              </div>
              <code className="bg-black/40 p-1.5 rounded font-mono text-[10px] text-emerald-400">
                flutter pub get<br />
                flutter run
              </code>
            </div>
          </div>

          {/* Code Viewer Panel */}
          <div className="flex-1 bg-[#1e293b] flex flex-col overflow-hidden">
            {/* Active file bar */}
            <div className="bg-[#182234] border-b border-slate-700 px-4 py-2.5 flex items-center justify-between">
              <div>
                <div className="font-mono text-xs text-blue-400 font-semibold">{currentFile.path}</div>
                <div className="text-[11px] text-slate-400">{currentFile.description}</div>
              </div>

              <button
                onClick={handleCopyCode}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  copied
                    ? 'bg-[#15803d] text-white'
                    : 'bg-slate-700 hover:bg-slate-600 text-white'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin!' : 'Salin Kode'}</span>
              </button>
            </div>

            {/* Code Body */}
            <div className="flex-1 p-4 overflow-auto bg-[#0a0f1d] font-mono text-xs text-slate-200 leading-relaxed select-text">
              <pre className="whitespace-pre">{currentFile.code}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
