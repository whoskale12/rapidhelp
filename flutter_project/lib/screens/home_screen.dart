import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';
import 'package:provider/provider.dart';
import '../models/user_profile.dart';
import '../providers/user_provider.dart';
import '../models/assistance_request.dart';
import '../theme/app_theme.dart';

class HomeScreen extends StatefulWidget {
  final UserProfile user;
  final Function(AssistanceRequest) onDispatchSOS;
  final VoidCallback onNavigateToTracking;
  final bool hasActiveRequest;

  const HomeScreen({
    super.key,
    required this.user,
    required this.onDispatchSOS,
    required this.onNavigateToTracking,
    this.hasActiveRequest = false,
  });

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen>
    with SingleTickerProviderStateMixin {
  IssueCategory _selectedCategory = IssueCategory.flatTire;
  final TextEditingController _notesController = TextEditingController();
  late AnimationController _pulseController;

  // User's current location
  late Future<Position> _currentPositionFuture;

  // Map camera position. Default to Jakarta while the real GPS position is loading.
  CameraPosition _initialCameraPosition = const CameraPosition(
    target: LatLng(-6.200000, 106.816666),
    zoom: 14.0,
  );

  // Current address display
  String _currentAddress = 'Locating your location...';

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);

    // Initialize with user's current location from geolocator
    _currentPositionFuture = _getCurrentLocation();
    _currentPositionFuture.then((position) {
      if (!mounted) return;
      final address =
          'Lat ${position.latitude.toStringAsFixed(5)}, Lng ${position.longitude.toStringAsFixed(5)}';
      Provider.of<UserProvider>(context, listen: false)
          .setUserLocation(position, address);
      setState(() {
        _initialCameraPosition = CameraPosition(
          target: LatLng(position.latitude, position.longitude),
          zoom: 16.0,
        );
        _currentAddress = address;
      });
    }).catchError((_) {
      if (!mounted) return;
      setState(() {
        _currentAddress = 'GPS unavailable. Enable location from settings.';
      });
    });
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<Position> _getCurrentLocation() async {
    final serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      throw Exception('Location service is disabled');
    }

    var permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }

    if (permission == LocationPermission.denied ||
        permission == LocationPermission.deniedForever) {
      throw Exception('Location permission is denied');
    }

    return Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.high,
    );
  }

  void _showDispatchBottomSheet() {
    final vehicle = widget.user.activeVehicle ??
        Vehicle(
          id: 'v1',
          make: 'Toyota',
          model: 'RAV4',
          year: 2022,
          color: 'Silver',
          licensePlate: 'CAL-8921',
        );

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return Container(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
            top: 20,
            left: 20,
            right: 20,
          ),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: AppColors.outline,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.primaryContainer,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.warning_amber_rounded,
                        color: AppColors.primary, size: 24),
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Confirm Roadside Dispatch',
                          style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: AppColors.textPrimary),
                        ),
                        Text(
                          'Certified technician arriving in ~4-8 minutes',
                          style: TextStyle(
                              fontSize: 12, color: AppColors.textSecondary),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.surfaceVariant,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  children: [
                    _buildInfoRow(
                        'Service Type', _getCategoryTitle(_selectedCategory)),
                    _buildInfoRow('Location', _currentAddress),
                    _buildInfoRow('Vehicle',
                        '${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})'),
                    _buildInfoRow('Est. Base Price',
                        '\$45.00 - \$55.00 (Negotiable in chat)'),
                  ],
                ),
              ),
              const SizedBox(height: 14),
              TextField(
                controller: _notesController,
                decoration: InputDecoration(
                  labelText:
                      'Optional details (e.g. front left tire flat, near mile marker 4)',
                  border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12)),
                  prefixIcon: const Icon(Icons.edit_note),
                ),
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: () {
                  Navigator.pop(ctx);
                  _triggerSOS();
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: const Text('DISPATCH TECHNICIAN NOW',
                    style: TextStyle(fontSize: 15, letterSpacing: 0.5)),
              ),
            ],
          ),
        );
      },
    );
  }

  void _triggerSOS() {
    final vehicle = widget.user.activeVehicle ??
        Vehicle(
          id: 'v1',
          make: 'Toyota',
          model: 'RAV4',
          year: 2022,
          color: 'Silver',
          licensePlate: 'CAL-8921',
        );

    final helper = HelperDriver(
      id: 'helper_marcus',
      name: 'Marcus Vance',
      role: 'Master Mechanic & Towing',
      rating: 4.9,
      rescuesCount: 340,
      vehicleDesc: 'Heavy Duty Flatbed Tow',
      plate: 'TOW-7729',
      avatarUrl:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      phone: '+1 (555) 728-1920',
      currentEtaMinutes: 4,
      distanceMiles: 1.2,
      locationX: 58,
      locationY: 32,
    );

    final newRequest = AssistanceRequest(
      id: 'req_${DateTime.now().millisecondsSinceEpoch}',
      userId: widget.user.id,
      category: _selectedCategory,
      issueTitle: _getCategoryTitle(_selectedCategory),
      issueDescription: _notesController.text.trim().isEmpty
          ? 'Emergency ${_getCategoryTitle(_selectedCategory)} assistance requested via RapidHelp.'
          : _notesController.text.trim(),
      locationAddress: _currentAddress,
      vehicle: vehicle,
      status: RequestStatus.accepted,
      helper: helper,
      createdAt: 'Just now',
      estimatedCost: 50.00,
      agreedPrice: null,
      offerStatus: 'pending',
    );

    widget.onDispatchSOS(newRequest);
  }

  String _getCategoryTitle(IssueCategory cat) {
    switch (cat) {
      case IssueCategory.flatTire:
        return 'Flat Tire Change';
      case IssueCategory.fuel:
        return 'Emergency Fuel Delivery';
      case IssueCategory.engine:
        return 'Engine Overheat / Breakdown';
      case IssueCategory.battery:
        return 'Jump Start & Battery Test';
      case IssueCategory.lockout:
        return 'Vehicle Lockout Service';
      case IssueCategory.towing:
        return 'Flatbed Towing Support';
      case IssueCategory.medical:
        return 'Critical Medical SOS';
    }
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label,
              style: const TextStyle(
                  fontSize: 11, color: AppColors.textSecondary)),
          Flexible(
            child: Text(
              value,
              textAlign: TextAlign.right,
              style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // Google Maps Widget
        Positioned.fill(
          child: FutureBuilder<Position>(
            future: _currentPositionFuture,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.done &&
                  snapshot.hasData) {
                return GoogleMap(
                  initialCameraPosition: _initialCameraPosition,
                  myLocationEnabled: true,
                  myLocationButtonEnabled: true,
                  compassEnabled: true,
                  mapToolbarEnabled: false,
                  zoomControlsEnabled: true,
                );
              }
              // Fallback while loading
              return Container(
                color: const Color(0xFFE8ECEF),
                child: CustomPaint(
                  painter: MapRoadsPainter(pulseAnimation: _pulseController),
                ),
              );
            },
          ),
        ),

        // Live Active Tracking Banner if there is an in-progress dispatch
        if (widget.hasActiveRequest)
          Positioned(
            top: 12,
            left: 16,
            right: 16,
            child: InkWell(
              onTap: widget.onNavigateToTracking,
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                        color: AppColors.primary.withValues(alpha: 0.3),
                        blurRadius: 10,
                        offset: const Offset(0, 4)),
                  ],
                ),
                child: const Row(
                  children: [
                    Icon(Icons.directions_car, color: Colors.white, size: 22),
                    SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Active Dispatch in Progress',
                              style: TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 13)),
                          Text('Marcus Vance is 4 min away • Tap to track',
                              style: TextStyle(
                                  color: Colors.white70, fontSize: 11)),
                        ],
                      ),
                    ),
                    Icon(Icons.arrow_forward_ios,
                        color: Colors.white, size: 14),
                  ],
                ),
              ),
            ),
          ),

        // Top Search Bar
        Positioned(
          top: widget.hasActiveRequest ? 80 : 12,
          left: 16,
          right: 16,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              boxShadow: [
                BoxShadow(
                    color: Colors.black.withValues(alpha: 0.08),
                    blurRadius: 12,
                    offset: const Offset(0, 2)),
              ],
            ),
            child: Row(
              children: [
                const Icon(Icons.location_on,
                    color: AppColors.primary, size: 20),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    _currentAddress,
                    style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.mic,
                      color: AppColors.accentBlue, size: 20),
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                          content: Text(
                              'Voice search: "Tire shop near Downtown Los Angeles"')),
                    );
                  },
                ),
              ],
            ),
          ),
        ),

        // Bottom Dashboard Floating Sheet
        Positioned(
          bottom: 0,
          left: 0,
          right: 0,
          child: Container(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius:
                  const BorderRadius.vertical(top: Radius.circular(24)),
              boxShadow: [
                BoxShadow(
                    color: Colors.black.withValues(alpha: 0.12),
                    blurRadius: 20,
                    offset: const Offset(0, -4)),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Emergency Assistance',
                      style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary),
                    ),
                    Text(
                      'Vehicle: ${widget.user.activeVehicle?.make ?? "RAV4"}',
                      style: const TextStyle(
                          fontSize: 11, color: AppColors.textSecondary),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // Issue Category Grid
                GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 3,
                  crossAxisSpacing: 8,
                  mainAxisSpacing: 8,
                  childAspectRatio: 1.3,
                  children: [
                    _buildCategoryCard(
                        IssueCategory.flatTire, 'Flat Tire', Icons.tire_repair),
                    _buildCategoryCard(
                        IssueCategory.battery, 'Jump Start', Icons.bolt),
                    _buildCategoryCard(IssueCategory.fuel, 'Out of Gas',
                        Icons.local_gas_station),
                    _buildCategoryCard(
                        IssueCategory.engine, 'Overheat', Icons.car_repair),
                    _buildCategoryCard(
                        IssueCategory.lockout, 'Lockout', Icons.key),
                    _buildCategoryCard(
                        IssueCategory.towing, 'Towing', Icons.local_shipping),
                  ],
                ),

                const SizedBox(height: 16),

                // SOS Trigger Button
                ElevatedButton(
                  onPressed: _showDispatchBottomSheet,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16)),
                  ),
                  child: const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.crisis_alert, size: 22),
                      SizedBox(width: 8),
                      Text(
                        'REQUEST RAPID RESCUE',
                        style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.5),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildCategoryCard(
      IssueCategory category, String label, IconData icon) {
    final isSelected = _selectedCategory == category;
    return InkWell(
      onTap: () => setState(() => _selectedCategory = category),
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 4),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.primaryContainer
              : AppColors.surfaceVariant,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? AppColors.primary : Colors.transparent,
            width: 1.5,
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: 20,
              color: isSelected ? AppColors.primary : AppColors.textSecondary,
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 10,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                color: isSelected ? AppColors.primary : AppColors.textPrimary,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

// Custom Map Roads Painter with simulated nodes & animated responder pins
class MapRoadsPainter extends CustomPainter {
  final Animation<double> pulseAnimation;

  MapRoadsPainter({required this.pulseAnimation})
      : super(repaint: pulseAnimation);

  @override
  void paint(Canvas canvas, Size size) {
    final roadPaint = Paint()
      ..color = Colors.white
      ..strokeWidth = 14
      ..style = PaintingStyle.stroke;

    final roadBorderPaint = Paint()
      ..color = const Color(0xFFD4D8DC)
      ..strokeWidth = 16
      ..style = PaintingStyle.stroke;

    // Draw Roads
    final path1 = Path()
      ..moveTo(0, size.height * 0.3)
      ..lineTo(size.width, size.height * 0.35);

    final path2 = Path()
      ..moveTo(size.width * 0.25, 0)
      ..lineTo(size.width * 0.3, size.height);

    final path3 = Path()
      ..moveTo(size.width * 0.75, 0)
      ..lineTo(size.width * 0.7, size.height);

    canvas.drawPath(path1, roadBorderPaint);
    canvas.drawPath(path1, roadPaint);
    canvas.drawPath(path2, roadBorderPaint);
    canvas.drawPath(path2, roadPaint);
    canvas.drawPath(path3, roadBorderPaint);
    canvas.drawPath(path3, roadPaint);

    // User Location Pin
    final userPos = Offset(size.width * 0.5, size.height * 0.35);
    final pulsePaint = Paint()
      ..color = AppColors.accentBlue
          .withValues(alpha: 0.25 * (1.0 - pulseAnimation.value))
      ..style = PaintingStyle.fill;

    canvas.drawCircle(userPos, 28 * pulseAnimation.value, pulsePaint);

    final dotPaint = Paint()
      ..color = AppColors.accentBlue
      ..style = PaintingStyle.fill;
    canvas.drawCircle(userPos, 9, dotPaint);

    final whiteCenter = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill;
    canvas.drawCircle(userPos, 4, whiteCenter);

    // Nearby Tow Trucks
    final helper1 = Offset(size.width * 0.7, size.height * 0.25);
    final helper2 = Offset(size.width * 0.3, size.height * 0.5);

    _drawHelperMarker(canvas, helper1, 'Tow Unit #4');
    _drawHelperMarker(canvas, helper2, 'Rapid Van #8');
  }

  void _drawHelperMarker(Canvas canvas, Offset offset, String label) {
    final bgPaint = Paint()
      ..color = AppColors.accentAmber
      ..style = PaintingStyle.fill;
    canvas.drawCircle(offset, 12, bgPaint);

    final borderPaint = Paint()
      ..color = Colors.white
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;
    canvas.drawCircle(offset, 12, borderPaint);
  }

  @override
  bool shouldRepaint(covariant MapRoadsPainter oldDelegate) => true;
}
