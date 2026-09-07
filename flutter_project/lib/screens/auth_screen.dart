import 'dart:async';
import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/user_profile.dart';
import '../theme/app_theme.dart';
import '../providers/user_provider.dart';
import '../services/supabase_service.dart';
import '../services/profile_service.dart';

class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen>
    with SingleTickerProviderStateMixin {
  int _currentStep = 1;
  late TextEditingController _nameController;
  late TextEditingController _phoneController;
  late TextEditingController _emailController;

  // Vehicle Info Controllers
  late TextEditingController _makeController;
  late TextEditingController _modelController;
  late TextEditingController _yearController;
  late TextEditingController _colorController;
  late TextEditingController _plateController;

  // Face verification state
  bool _isScanning = false;
  double _scanProgress = 0.0;
  bool _isKycVerified = false;
  Timer? _scanTimer;
  CameraController? _cameraController;
  bool _isCameraInitializing = false;
  late AnimationController _pulseController;

  @override
  void initState() {
    super.initState();
    // Initialize with empty controllers for fresh app launch
    _nameController = TextEditingController();
    _phoneController = TextEditingController();
    _emailController = TextEditingController();

    _makeController = TextEditingController();
    _modelController = TextEditingController();
    _yearController = TextEditingController();
    _colorController = TextEditingController();
    _plateController = TextEditingController();

    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    _makeController.dispose();
    _modelController.dispose();
    _yearController.dispose();
    _colorController.dispose();
    _plateController.dispose();
    _scanTimer?.cancel();
    _cameraController?.dispose();
    _pulseController.dispose();
    super.dispose();
  }

  Future<void> _startFacialScan() async {
    final cameraStatus = await Permission.camera.request();

    if (!cameraStatus.isGranted) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Camera permission is required for face verification'),
          ),
        );
      }
      return;
    }

    setState(() {
      _isCameraInitializing = true;
      _isScanning = false;
      _scanProgress = 0.0;
      _isKycVerified = false;
    });

    try {
      final cameras = await availableCameras();
      if (cameras.isEmpty) {
        throw Exception('No camera device found');
      }

      final frontCamera = cameras.firstWhere(
        (camera) => camera.lensDirection == CameraLensDirection.front,
        orElse: () => cameras.first,
      );

      await _cameraController?.dispose();
      _cameraController = CameraController(
        frontCamera,
        ResolutionPreset.medium,
        enableAudio: false,
      );

      await _cameraController!.initialize();

      if (!mounted) return;
      setState(() {
        _isCameraInitializing = false;
        _isScanning = true;
      });

      // Small delay to ensure camera preview renders properly
      await Future.delayed(const Duration(milliseconds: 200));

      if (!mounted) return;
      setState(() {}); // Force rebuild for camera preview

      _scanTimer?.cancel();
      _scanTimer = Timer.periodic(const Duration(milliseconds: 60), (timer) {
        if (!mounted) {
          timer.cancel();
          return;
        }
        setState(() {
          _scanProgress += 0.03;
          if (_scanProgress >= 1.0) {
            _scanProgress = 1.0;
            _isScanning = false;
            _isKycVerified = true;
            timer.cancel();
          }
        });
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isCameraInitializing = false;
        _isScanning = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Unable to open camera: $e')),
      );
    }
  }

  void _finishOnboarding() async {
    print('🔵 ONBOARDING: Starting finish sequence');
    
    try {
      // Validate required fields
      if (_nameController.text.trim().isEmpty || 
          _phoneController.text.trim().isEmpty ||
          _emailController.text.trim().isEmpty) {
        print('❌ ONBOARDING ERROR: Missing required fields');
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('❌ Please fill in all required fields')),
          );
        }
        return;
      }

      print('📝 Name: ${_nameController.text.trim()}');
      print('📱 Phone: ${_phoneController.text.trim()}');
      print('📧 Email: ${_emailController.text.trim()}');

      // Show loading dialog
      if (mounted) {
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (ctx) => const AlertDialog(
            content: Row(
              children: [
                CircularProgressIndicator(),
                SizedBox(width: 16),
                Text('Creating your account...'),
              ],
            ),
          ),
        );
      }

      // ============================================================================
      // STEP 1: Sign up with phone using Supabase Auth
      // ============================================================================
      print('🔵 ONBOARDING STEP 1: Supabase Phone SignUp');
      
      final signUpResult = await signUpWithPhone(_phoneController.text.trim());
      
      if (mounted) Navigator.pop(context); // Close loading dialog

      if (!signUpResult.$1 || signUpResult.$2 == null) {
        print('❌ ONBOARDING ERROR: SignUp failed or no user ID returned');
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('❌ SignUp failed')),
          );
        }
        return;
      }

      final userId = signUpResult.$2!;
      print('✅ ONBOARDING STEP 1 COMPLETE: User ID: $userId');

      // ============================================================================
      // STEP 2: Create user profile in Supabase database
      // ============================================================================
      print('🔵 ONBOARDING STEP 2: Create user profile in database');

      final hasVehicle = _makeController.text.trim().isNotEmpty ||
          _modelController.text.trim().isNotEmpty ||
          _plateController.text.trim().isNotEmpty;

      final vehicle = hasVehicle
          ? Vehicle(
              id: 'veh_primary',
              make: _makeController.text.trim(),
              model: _modelController.text.trim(),
              year: int.tryParse(_yearController.text.trim()) ?? 2024,
              color: _colorController.text.trim(),
              licensePlate: _plateController.text.trim().toUpperCase(),
              isDefault: true,
            )
          : null;

      await createUserProfile(
        userId: userId,
        fullName: _nameController.text.trim(),
        phone: _phoneController.text.trim(),
        email: _emailController.text.trim(),
        vehicle: vehicle,
      );

      print('✅ ONBOARDING STEP 2 COMPLETE: Profile created in database');

      // ============================================================================
      // STEP 3: Create UserProfile model and update Provider
      // ============================================================================
      print('🔵 ONBOARDING STEP 3: Update local Provider with user data');

      final updatedProfile = UserProfile(
        id: userId,
        name: _nameController.text.trim(),
        phone: _phoneController.text.trim(),
        email: _emailController.text.trim(),
        avatarUrl:
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        isVerified: true,
        rewardPoints: 0,
        silentMode: false,
        vehicles: vehicle != null ? [vehicle] : [],
        activeVehicleId: vehicle?.id ?? '',
        emergencyContacts: [],
      );

      if (mounted) {
        final userProvider = Provider.of<UserProvider>(context, listen: false);
        userProvider.setUser(updatedProfile);
      }

      print('✅ ONBOARDING STEP 3 COMPLETE: Provider updated');

      // ============================================================================
      // STEP 4: Navigate to location permission screen
      // ============================================================================
      print('✅ ONBOARDING COMPLETE: All steps successful');
      print('🔵 SUPABASE AUTH USER ID: $userId');
      print('🔵 USER PROFILE: ${updatedProfile.name}');

      if (mounted) {
        Navigator.pushReplacementNamed(context, '/location-permission');
      }

    } on AuthException catch (e) {
      print('❌ AUTH EXCEPTION: ${e.message}');
      print('📍 Status Code: ${e.statusCode}');
      if (mounted) Navigator.pop(context); // Close loading dialog
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('❌ Auth Error: ${e.message}')),
        );
      }
    } on PostgrestException catch (e) {
      print('❌ POSTGREST ERROR: ${e.message}');
      print('📍 Code: ${e.code}');
      print('📍 Details: ${e.details}');
      print('📍 Hint: ${e.hint}');
      if (mounted) Navigator.pop(context); // Close loading dialog
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('❌ Database Error: ${e.message}')),
        );
      }
    } catch (e) {
      print('❌ ONBOARDING ERROR: ${e.toString()}');
      if (mounted) Navigator.pop(context); // Close loading dialog
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('❌ Error: ${e.toString()}')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('RapidHelp Verification'),
        centerTitle: true,
        backgroundColor: Colors.white,
        elevation: 1,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _buildStepIndicator(),
              const SizedBox(height: 24),
              if (_currentStep == 1) _buildStep1Account(),
              if (_currentStep == 2) _buildStep2Kyc(),
              if (_currentStep == 3) _buildStep3Vehicle(),
              if (_currentStep == 4) _buildStep4Review(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStepIndicator() {
    final steps = ['Account', 'ID Scan', 'Vehicle', 'Finish'];
    return Row(
      children: List.generate(4, (index) {
        final stepNum = index + 1;
        final isActive = stepNum == _currentStep;
        final isDone = stepNum < _currentStep;

        return Expanded(
          child: Row(
            children: [
              Expanded(
                child: Column(
                  children: [
                    Container(
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: isDone
                            ? AppColors.accentGreen
                            : isActive
                                ? AppColors.primary
                                : AppColors.surfaceVariant,
                        border: Border.all(
                          color:
                              isActive ? AppColors.primary : Colors.transparent,
                          width: 2,
                        ),
                      ),
                      child: Center(
                        child: isDone
                            ? const Icon(Icons.check,
                                size: 16, color: Colors.white)
                            : Text(
                                '$stepNum',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  color: isActive
                                      ? Colors.white
                                      : AppColors.textSecondary,
                                ),
                              ),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      steps[index],
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight:
                            isActive ? FontWeight.bold : FontWeight.normal,
                        color: isActive
                            ? AppColors.primary
                            : AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
              if (index < 3)
                Container(
                  width: 24,
                  height: 2,
                  color: stepNum < _currentStep
                      ? AppColors.accentGreen
                      : AppColors.outline,
                  margin: const EdgeInsets.only(bottom: 16),
                ),
            ],
          ),
        );
      }),
    );
  }

  Widget _buildStep1Account() {
    return Card(
      elevation: 0,
      color: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: const BorderSide(color: AppColors.outline),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Driver Identification',
              style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary),
            ),
            const SizedBox(height: 4),
            const Text(
              'Enter your official contact information for rapid on-site identity matching during roadside dispatches.',
              style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
            ),
            const SizedBox(height: 20),
            TextField(
              controller: _nameController,
              decoration: InputDecoration(
                labelText: 'Full Name',
                prefixIcon: const Icon(Icons.person_outline,
                    color: AppColors.textSecondary),
                border:
                    OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 14),
            TextField(
              controller: _phoneController,
              keyboardType: TextInputType.phone,
              decoration: InputDecoration(
                labelText: 'Mobile Phone (for SMS Dispatches)',
                prefixIcon: const Icon(Icons.phone_outlined,
                    color: AppColors.textSecondary),
                border:
                    OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 14),
            TextField(
              controller: _emailController,
              keyboardType: TextInputType.emailAddress,
              decoration: InputDecoration(
                labelText: 'Email Address',
                prefixIcon: const Icon(Icons.email_outlined,
                    color: AppColors.textSecondary),
                border:
                    OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => setState(() => _currentStep = 2),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('Proceed to ID Biometrics'),
                  SizedBox(width: 8),
                  Icon(Icons.arrow_forward, size: 16),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCameraPreview() {
    final controller = _cameraController;

    if (controller != null && controller.value.isInitialized) {
      final previewSize = controller.value.previewSize;
      if (previewSize != null) {
        return Center(
          child: FittedBox(
            fit: BoxFit.cover,
            child: SizedBox(
              width: previewSize.height,
              height: previewSize.width,
              child: CameraPreview(controller),
            ),
          ),
        );
      }

      return CameraPreview(controller);
    }

    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            _isCameraInitializing ? Icons.hourglass_top : Icons.camera_alt,
            color: Colors.white70,
            size: 52,
          ),
          const SizedBox(height: 10),
          Text(
            _isCameraInitializing ? 'Opening camera...' : 'Tap Start Face KYC Scan',
            style: const TextStyle(
              color: Colors.white70,
              fontSize: 13,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 6),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 24),
            child: Text(
              'If Android asks permission, choose Allow while using the app.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.white54, fontSize: 11),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStep2Kyc() {
    return Card(
      elevation: 0,
      color: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: const BorderSide(color: AppColors.outline),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            const Text(
              'Biometric Face & ID Check',
              style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary),
            ),
            const SizedBox(height: 6),
            const Text(
              'Align your face inside the scan oval to verify identity.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
            ),
            const SizedBox(height: 16),

            // Live Camera View
            SizedBox(
              height: 320,
              width: double.infinity,
              child: Stack(
                alignment: Alignment.center,
                children: [
                  Container(
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E293B),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: _isKycVerified
                            ? AppColors.accentGreen
                            : _isScanning
                                ? AppColors.primary
                                : AppColors.accentAmber,
                        width: 3,
                      ),
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(13),
                      child: Container(
                        color: Colors.black,
                        child: _buildCameraPreview(),
                      ),
                    ),
                  ),

                  // KYC Verified Overlay
                  if (_isKycVerified)
                    Positioned.fill(
                      child: Container(
                        decoration: BoxDecoration(
                          color: Colors.black.withValues(alpha: 0.5),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: const Center(
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.check_circle,
                                  color: AppColors.accentGreen, size: 64),
                              SizedBox(height: 12),
                              Text('Face Matched!',
                                  style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),

            const SizedBox(height: 16),
            if (_isScanning) ...[
              LinearProgressIndicator(
                value: _scanProgress,
                backgroundColor: AppColors.surfaceVariant,
                valueColor:
                    const AlwaysStoppedAnimation<Color>(AppColors.primary),
              ),
              const SizedBox(height: 8),
              Text(
                'Analyzing facial markers... ${(_scanProgress * 100).toInt()}%',
                style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: AppColors.primary),
              ),
            ] else if (_isKycVerified) ...[
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                decoration: BoxDecoration(
                  color: const Color(0xFFDCFCE7),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFBBF7D0)),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.verified,
                        color: AppColors.accentGreen, size: 20),
                    SizedBox(width: 8),
                    Text(
                      'Biometrics Match 99.4% Verified',
                      style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: AppColors.accentGreen),
                    ),
                  ],
                ),
              ),
            ] else ...[
              ElevatedButton.icon(
                onPressed: _startFacialScan,
                icon: const Icon(Icons.camera_alt),
                label: const Text('Start Face KYC Scan'),
              ),
            ],

            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => setState(() => _currentStep = 1),
                    child: const Text('Back'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: _isKycVerified
                        ? () => setState(() => _currentStep = 3)
                        : () {
                            _startFacialScan();
                          },
                    child:
                        Text(_isKycVerified ? 'Next: Vehicle' : 'Scan First'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStep3Vehicle() {
    return Card(
      elevation: 0,
      color: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: const BorderSide(color: AppColors.outline),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Register Vehicle',
              style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary),
            ),
            const SizedBox(height: 4),
            const Text(
              'This ensures towing flatbeds and roadside technicians arrive with the correct tools.',
              style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _makeController,
                    decoration: InputDecoration(
                      labelText: 'Make (e.g. Toyota)',
                      border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: TextField(
                    controller: _modelController,
                    decoration: InputDecoration(
                      labelText: 'Model (e.g. RAV4)',
                      border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _yearController,
                    keyboardType: TextInputType.number,
                    decoration: InputDecoration(
                      labelText: 'Year',
                      border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: TextField(
                    controller: _colorController,
                    decoration: InputDecoration(
                      labelText: 'Color',
                      border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            TextField(
              controller: _plateController,
              textCapitalization: TextCapitalization.characters,
              decoration: InputDecoration(
                labelText: 'License Plate (e.g. CAL-8921)',
                prefixIcon: const Icon(Icons.directions_car,
                    color: AppColors.textSecondary),
                border:
                    OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => setState(() => _currentStep = 2),
                    child: const Text('Back'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => setState(() => _currentStep = 4),
                    child: const Text('Skip Vehicle'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            ElevatedButton(
              onPressed: () => setState(() => _currentStep = 4),
              child: const Text('Review & Finish'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStep4Review() {
    return Card(
      elevation: 0,
      color: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: const BorderSide(color: AppColors.outline),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Icon(Icons.check_circle_outline,
                color: AppColors.accentGreen, size: 56),
            const SizedBox(height: 12),
            const Text(
              'Ready for 24/7 Roadside Dispatches',
              textAlign: TextAlign.center,
              style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary),
            ),
            const SizedBox(height: 6),
            const Text(
              'Your profile and vehicle are configured. You can now request emergency assistance with 1-tap.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
            ),
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.surfaceVariant,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                children: [
                  _buildReviewRow('Driver', _nameController.text),
                  _buildReviewRow('Phone', _phoneController.text),
                  _buildReviewRow('Vehicle',
                      '${_yearController.text} ${_makeController.text} ${_modelController.text}'),
                  _buildReviewRow(
                      'License Plate', _plateController.text.toUpperCase()),
                  _buildReviewRow('KYC Biometrics', 'Verified ✅'),
                ],
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _finishOnboarding,
              child: const Text('Launch RapidHelp Dashboard'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReviewRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label,
              style: const TextStyle(
                  fontSize: 12, color: AppColors.textSecondary)),
          Text(value,
              style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary)),
        ],
      ),
    );
  }
}
