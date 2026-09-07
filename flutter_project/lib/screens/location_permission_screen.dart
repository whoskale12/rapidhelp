import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:permission_handler/permission_handler.dart';
import '../theme/app_theme.dart';

class LocationPermissionScreen extends StatefulWidget {
  const LocationPermissionScreen({super.key});

  @override
  State<LocationPermissionScreen> createState() =>
      _LocationPermissionScreenState();
}

class _LocationPermissionScreenState extends State<LocationPermissionScreen> {
  bool _isLocationChecking = false;
  String _statusMessage = 'Please allow location access to enable GPS tracking';

  Future<void> _requestLocationPermission() async {
    setState(() {
      _isLocationChecking = true;
    });

    try {
      // Check current permission status
      var status = await Geolocator.checkPermission();

      if (status == LocationPermission.deniedForever) {
        // Show dialog explaining why permission is needed
        _showPermissionsDeniedDialog();
        return;
      }

      if (status == LocationPermission.denied) {
        // Request permission (geolocator 9.0.2 doesn't accept parameters)
        status = await Geolocator.requestPermission();
      }

      if (status == LocationPermission.always ||
          status == LocationPermission.whileInUse) {
        // Permission granted
        if (mounted) {
          setState(() {
            _statusMessage = 'Location access granted!';
          });
          await Future.delayed(const Duration(milliseconds: 500));
          // Navigate to home screen
          if (mounted) {
            Navigator.pushReplacementNamed(context, '/home');
          }
        }
      } else {
        // Permission denied
        if (mounted) {
          setState(() {
            _statusMessage = 'Location access is required for GPS tracking';
            _isLocationChecking = false;
          });
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _statusMessage = 'Error checking location permission';
          _isLocationChecking = false;
        });
      }
    }
  }

  Future<void> _showPermissionsDeniedDialog() async {
    return showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return AlertDialog(
          backgroundColor: AppColors.background,
          title: const Text(
            'Location Permission Denied',
            style: TextStyle(color: AppColors.primary),
          ),
          content: const Text(
            'RapidHelp requires location access to track nearby helpers and provide roadside assistance. Please enable location permissions in your device settings.',
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
                // Open app settings
                openAppSettings();
              },
              child: const Text('Open Settings'),
            ),
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
                _requestLocationPermission();
              },
              child: const Text('Try Again'),
            ),
          ],
        );
      },
    );
  }

  @override
  void initState() {
    super.initState();
    _requestLocationPermission();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const SizedBox(height: 40),
              Container(
                width: 100,
                height: 100,
                decoration: const BoxDecoration(
                  color: AppColors.primaryContainer,
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  _isLocationChecking ? Icons.gps_not_fixed : Icons.location_on,
                  size: 50,
                  color: _isLocationChecking
                      ? AppColors.accentAmber
                      : AppColors.primary,
                ),
              ),
              const SizedBox(height: 32),
              Text(
                _statusMessage,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 16,
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: 40),
              if (_isLocationChecking)
                const CircularProgressIndicator(
                  valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
                ),
              if (!_isLocationChecking)
                ElevatedButton.icon(
                  onPressed: _requestLocationPermission,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: AppColors.onPrimary,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 32,
                      vertical: 16,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  icon: const Icon(Icons.location_on),
                  label: const Text('Enable GPS Tracking'),
                ),
              const SizedBox(height: 24),
              TextButton(
                onPressed: () {
                  // Allow user to skip for now - they can enable later
                  Navigator.pushReplacementNamed(context, '/home');
                },
                child: const Text(
                  'Skip for Now',
                  style: TextStyle(
                    color: AppColors.textMuted,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
