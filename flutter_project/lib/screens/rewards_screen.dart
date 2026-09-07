import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../models/user_profile.dart';
import '../models/voucher.dart';
import '../theme/app_theme.dart';

class RewardsScreen extends StatefulWidget {
  final UserProfile user;
  final Function(UserProfile) onUpdateUser;
  final VoidCallback onOpenEmergencyContacts;

  const RewardsScreen({
    super.key,
    required this.user,
    required this.onUpdateUser,
    required this.onOpenEmergencyContacts,
  });

  @override
  State<RewardsScreen> createState() => _RewardsScreenState();
}

class _RewardsScreenState extends State<RewardsScreen> {
  int _selectedTab = 0; // 0: Catalog, 1: My Vouchers

  final List<Voucher> _vouchers = [
    Voucher(
      id: 'v_gas',
      title: '\$10 Shell / Chevron Fuel Pass',
      description: 'Instant discount voucher at any affiliated fueling partner.',
      pointsCost: 600,
      imageUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80',
      category: 'fuel',
    ),
    Voucher(
      id: 'v_oil',
      title: 'Free Synthetic Oil Inspection',
      description: 'Comprehensive fluid level and filter diagnostic check.',
      pointsCost: 900,
      imageUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80',
      category: 'service',
    ),
    Voucher(
      id: 'v_coffee',
      title: 'Roadside Coffee & Snack Combo',
      description: 'Enjoy a free hot beverage and bakery item while you wait.',
      pointsCost: 350,
      imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80',
      category: 'drink',
    ),
  ];

  final List<RedeemedVoucher> _myVouchers = [
    RedeemedVoucher(
      id: 'red_1',
      voucherId: 'v_coffee',
      title: 'Roadside Coffee & Snack Combo',
      code: 'RH-COFFEE-9921',
      redeemedAt: 'Yesterday',
      pointsSpent: 350,
    ),
  ];

  void _showRedeemConfirmation(Voucher voucher) {
    if (widget.user.rewardPoints < voucher.pointsCost) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('You need ${voucher.pointsCost} points, but currently have ${widget.user.rewardPoints} points.'),
          backgroundColor: AppColors.primary,
        ),
      );
      return;
    }

    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          title: Text('Redeem ${voucher.title}?'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                height: 120,
                width: double.infinity,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  image: DecorationImage(image: NetworkImage(voucher.imageUrl), fit: BoxFit.cover),
                ),
              ),
              const SizedBox(height: 12),
              Text(
                '${voucher.pointsCost} points will be deducted from your balance.',
                style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(ctx);
                _executeRedemption(voucher);
              },
              child: const Text('Confirm Redeem'),
            ),
          ],
        );
      },
    );
  }

  void _executeRedemption(Voucher voucher) {
    final updatedProfile = widget.user.copyWith(
      rewardPoints: widget.user.rewardPoints - voucher.pointsCost,
    );
    widget.onUpdateUser(updatedProfile);

    setState(() {
      _myVouchers.insert(
        0,
        RedeemedVoucher(
          id: 'red_${DateTime.now().millisecondsSinceEpoch}',
          voucherId: voucher.id,
          title: voucher.title,
          code: 'RH-${voucher.category.toUpperCase()}-${1000 + DateTime.now().millisecond}',
          redeemedAt: 'Just now',
          pointsSpent: voucher.pointsCost,
        ),
      );
      _selectedTab = 1;
    });

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Voucher claimed successfully! Check your active wallet.'),
        backgroundColor: AppColors.accentGreen,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Points Balance Hero Card
          Card(
            elevation: 0,
            color: Colors.white,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(24),
              side: const BorderSide(color: AppColors.outline),
            ),
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  const Text(
                    'YOUR BALANCE',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.2, color: AppColors.textSecondary),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: const BoxDecoration(
                          color: AppColors.accentAmber,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.monetization_on, color: Colors.white, size: 28),
                      ),
                      const SizedBox(width: 12),
                      Text(
                        '${widget.user.rewardPoints}',
                        style: const TextStyle(fontSize: 36, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Points available to redeem for roadside perks',
                    style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      ChoiceChip(
                        label: const Text('Browse Catalog'),
                        selected: _selectedTab == 0,
                        onSelected: (val) => setState(() => _selectedTab = 0),
                        selectedColor: AppColors.primary,
                        labelStyle: TextStyle(
                          color: _selectedTab == 0 ? Colors.white : AppColors.textSecondary,
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                      const SizedBox(width: 8),
                      ChoiceChip(
                        label: Text('My Vouchers (${_myVouchers.length})'),
                        selected: _selectedTab == 1,
                        onSelected: (val) => setState(() => _selectedTab = 1),
                        selectedColor: AppColors.primary,
                        labelStyle: TextStyle(
                          color: _selectedTab == 1 ? Colors.white : AppColors.textSecondary,
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 20),

          // Vouchers List
          if (_selectedTab == 0) ...[
            const Text(
              'Redeemable Vouchers',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
            ),
            const SizedBox(height: 10),
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _vouchers.length,
              itemBuilder: (context, index) {
                final voucher = _vouchers[index];
                final canAfford = widget.user.rewardPoints >= voucher.pointsCost;

                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Container(
                        height: 130,
                        decoration: BoxDecoration(
                          borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                          image: DecorationImage(
                            image: NetworkImage(voucher.imageUrl),
                            fit: BoxFit.cover,
                          ),
                        ),
                        child: Align(
                          alignment: Alignment.topRight,
                          child: Container(
                            margin: const EdgeInsets.all(10),
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.95),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              '${voucher.pointsCost} pts',
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: AppColors.textPrimary),
                            ),
                          ),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(14),
                        child: Row(
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(voucher.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                                  const SizedBox(height: 2),
                                  Text(voucher.description, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                                ],
                              ),
                            ),
                            const SizedBox(width: 8),
                            ElevatedButton(
                              onPressed: canAfford ? () => _showRedeemConfirmation(voucher) : null,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: canAfford ? AppColors.primary : AppColors.surfaceVariant,
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                              ),
                              child: Text(canAfford ? 'Redeem' : 'Need Pts', style: const TextStyle(fontSize: 11)),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ] else ...[
            const Text(
              'My Claimed Wallet',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
            ),
            const SizedBox(height: 10),
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _myVouchers.length,
              itemBuilder: (context, index) {
                final item = _myVouchers[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(item.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: const Color(0xFFDCFCE7),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Text('Ready to Use', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.accentGreen)),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text('Claimed: ${item.redeemedAt}', style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                        const SizedBox(height: 10),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          decoration: BoxDecoration(
                            color: AppColors.surfaceVariant,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(item.code, style: const TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.bold, color: AppColors.accentBlue)),
                              IconButton(
                                icon: const Icon(Icons.copy, size: 16, color: AppColors.textSecondary),
                                onPressed: () {
                                  Clipboard.setData(ClipboardData(text: item.code));
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(content: Text('Voucher code copied to clipboard!')),
                                  );
                                },
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ],

          const SizedBox(height: 20),

          // Safety Preferences Section
          const Text(
            'Safety & App Preferences',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
          ),
          const SizedBox(height: 10),

          Card(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            child: Column(
              children: [
                SwitchListTile(
                  title: const Text('Silent Mode', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                  subtitle: const Text('Mute broadcast audio sirens during SOS', style: TextStyle(fontSize: 11)),
                  value: widget.user.silentMode,
                  activeThumbColor: AppColors.primary,
                  onChanged: (val) {
                    widget.onUpdateUser(widget.user.copyWith(silentMode: val));
                  },
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(Icons.contact_phone, color: AppColors.primary),
                  title: const Text('Emergency Contacts', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                  subtitle: Text('${widget.user.emergencyContacts.length} contacts notified during SOS', style: const TextStyle(fontSize: 11)),
                  trailing: const Icon(Icons.arrow_forward_ios, size: 14),
                  onTap: widget.onOpenEmergencyContacts,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
