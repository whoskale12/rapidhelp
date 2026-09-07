import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

import 'models/user_profile.dart';
import 'models/assistance_request.dart';
import 'screens/location_permission_screen.dart';
import 'screens/auth_screen.dart';
import 'screens/home_screen.dart';
import 'screens/tracking_screen.dart';
import 'screens/chat_screen.dart';
import 'screens/requests_history_screen.dart';
import 'screens/rewards_screen.dart';
import 'screens/settings_screen.dart';
import 'theme/app_theme.dart';
import 'providers/user_provider.dart';
import 'widgets/emergency_contacts_dialog.dart';
import 'services/supabase_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  print('🔵 MAIN: App initialization starting');
  
  try {
    // Load environment variables
    await dotenv.load(fileName: ".env");
    print('✅ MAIN: Environment variables loaded');
    
    // Get Supabase credentials
    final supabaseUrl = dotenv.env['SUPABASE_URL'] ?? '';
    final supabaseAnonKey = dotenv.env['SUPABASE_ANON_KEY'] ?? '';
    
    if (supabaseUrl.isEmpty || supabaseAnonKey.isEmpty) {
      print('❌ MAIN ERROR: Supabase credentials not found in .env');
      print('📍 SUPABASE_URL: ${supabaseUrl.isEmpty ? "MISSING" : "OK"}');
      print('📍 SUPABASE_ANON_KEY: ${supabaseAnonKey.isEmpty ? "MISSING" : "OK"}');
      throw Exception('Missing Supabase credentials in .env');
    }
    
    print('📍 SUPABASE_URL: $supabaseUrl');
    
    // Initialize Supabase
    await initSupabase(
      supabaseUrl: supabaseUrl,
      supabaseAnonKey: supabaseAnonKey,
    );
    
    print('✅ MAIN: Supabase initialized');
    print('✅ MAIN: App ready to run');
    
  } catch (e) {
    print('❌ MAIN INIT ERROR: ${e.toString()}');
    // Continue anyway for testing
  }
  
  runApp(const RapidHelpApp());
}

class RapidHelpApp extends StatelessWidget {
  const RapidHelpApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(
          create: (_) => UserProvider(),
        ),
      ],
      child: MaterialApp(
        title: 'RapidHelp',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        initialRoute: '/auth',
        routes: {
          '/auth': (context) => const AuthScreen(),
          '/location-permission': (context) => const LocationPermissionScreen(),
          '/home': (context) => const HomeScreenWrapper(),
          '/tracking': (context) => const TrackingScreenWrapper(),
          '/chat': (context) => const ChatScreenWrapper(),
          '/history': (context) => const RequestsHistoryScreenWrapper(),
          '/rewards': (context) => const RewardsScreenWrapper(),
          '/settings': (context) => const SettingsScreenWrapper(),
        },
      ),
    );
  }
}

// Wrapper widgets to provide proper context
class LocationPermissionScreenWrapper extends StatelessWidget {
  const LocationPermissionScreenWrapper({super.key});

  @override
  Widget build(BuildContext context) {
    return const LocationPermissionScreen();
  }
}

class HomeScreenWrapper extends StatelessWidget {
  const HomeScreenWrapper({super.key});

  @override
  Widget build(BuildContext context) {
    return const HomeScreenWrapperContent();
  }
}

class HomeScreenWrapperContent extends StatefulWidget {
  const HomeScreenWrapperContent({super.key});

  @override
  State<HomeScreenWrapperContent> createState() =>
      _HomeScreenWrapperContentState();
}

class _HomeScreenWrapperContentState extends State<HomeScreenWrapperContent> {
  late List<AssistanceRequest> _requests;
  bool _hasActiveRequest = false;

  @override
  void initState() {
    super.initState();
    // Initialize with empty requests
    _requests = [];
  }

  void _handleDispatchSOS(AssistanceRequest request) {
    setState(() {
      _requests.insert(0, request);
      _hasActiveRequest = true;
    });

    // Navigate to tracking screen after delay
    Future.delayed(const Duration(seconds: 1), () {
      if (mounted) {
        Navigator.pushNamed(context, '/tracking');
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider.value(
      value: Provider.of<UserProvider>(context, listen: false),
      child: Scaffold(
        body: HomeScreen(
          user: Provider.of<UserProvider>(context).user!,
          onDispatchSOS: _handleDispatchSOS,
          onNavigateToTracking: () {
            if (mounted) {
              Navigator.pushNamed(context, '/tracking');
            }
          },
          hasActiveRequest: _hasActiveRequest,
        ),
      ),
    );
  }
}

class TrackingScreenWrapper extends StatelessWidget {
  const TrackingScreenWrapper({super.key});

  @override
  Widget build(BuildContext context) {
    final userProvider = Provider.of<UserProvider>(context);

    return Scaffold(
      body: TrackingScreen(
        user: userProvider.user!,
        requests: const [],
      ),
    );
  }
}

class ChatScreenWrapper extends StatelessWidget {
  const ChatScreenWrapper({super.key});

  @override
  Widget build(BuildContext context) {
    final userProvider = Provider.of<UserProvider>(context);
    final defaultVehicle = userProvider.user?.activeVehicle ??
        Vehicle(
          id: 'default_vehicle',
          make: 'Vehicle',
          model: 'Unknown',
          year: 2024,
          color: 'Unknown',
          licensePlate: 'N/A',
        );
    return Scaffold(
      body: ChatScreen(
        request: AssistanceRequest(
          id: 'chat_req',
          userId: userProvider.user?.id ?? '',
          category: IssueCategory.flatTire,
          issueTitle: 'Chat',
          issueDescription: '',
          locationAddress: '',
          vehicle: defaultVehicle,
          status: RequestStatus.accepted,
          helper: null,
          createdAt: '',
          estimatedCost: 0,
          agreedPrice: null,
          offerStatus: 'pending',
        ),
        initialMessages: const [],
        onBack: () => Navigator.pop(context),
        onStartCall: () {},
        onUpdateAgreedPrice: (price) {},
      ),
    );
  }
}

class RequestsHistoryScreenWrapper extends StatelessWidget {
  const RequestsHistoryScreenWrapper({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: RequestsHistoryScreen(
        pastRequests: const [],
        onSelectActiveRequest: () {},
        onSelectPastRequest: (request) {
          // Handle past request selection
        },
      ),
    );
  }
}

class RewardsScreenWrapper extends StatelessWidget {
  const RewardsScreenWrapper({super.key});

  @override
  Widget build(BuildContext context) {
    final userProvider = Provider.of<UserProvider>(context);

    return Scaffold(
      body: RewardsScreen(
        user: userProvider.user!,
        onUpdateUser: (updatedUser) {
          userProvider.updateUser(updatedUser);
        },
        onOpenEmergencyContacts: () {
          showDialog(
            context: context,
            builder: (ctx) => EmergencyContactsDialog(
              contacts: userProvider.user?.emergencyContacts ?? [],
              onSave: (contacts) {
                final currentUser = userProvider.user;
                if (currentUser == null) return;
                userProvider.updateUser(
                  currentUser.copyWith(emergencyContacts: contacts),
                );
              },
            ),
          );
        },
      ),
    );
  }
}

class SettingsScreenWrapper extends StatelessWidget {
  const SettingsScreenWrapper({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: SettingsScreen(),
    );
  }
}
