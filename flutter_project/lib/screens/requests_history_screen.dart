import 'package:flutter/material.dart';
import '../models/assistance_request.dart';
import '../theme/app_theme.dart';

class RequestsHistoryScreen extends StatelessWidget {
  final AssistanceRequest? activeRequest;
  final List<AssistanceRequest> pastRequests;
  final VoidCallback onSelectActiveRequest;
  final Function(AssistanceRequest) onSelectPastRequest;

  const RequestsHistoryScreen({
    super.key,
    this.activeRequest,
    required this.pastRequests,
    required this.onSelectActiveRequest,
    required this.onSelectPastRequest,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text(
            'Roadside Requests',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
          ),
          const SizedBox(height: 4),
          const Text(
            'Track active dispatches and view historical rescue logs.',
            style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
          ),
          const SizedBox(height: 16),

          // Active Request Card
          if (activeRequest != null) ...[
            Card(
              elevation: 2,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(18),
                side: const BorderSide(color: AppColors.primary, width: 2),
              ),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Row(
                          children: [
                            Icon(Icons.circle, color: AppColors.primary, size: 10),
                            SizedBox(width: 6),
                            Text('LIVE DISPATCH IN PROGRESS', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primary)),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: AppColors.primaryContainer,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            'ETA: ${activeRequest!.helper?.currentEtaMinutes ?? 4} min',
                            style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.onPrimaryContainer),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Text(activeRequest!.issueTitle, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    const SizedBox(height: 2),
                    Text(activeRequest!.locationAddress, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                    const SizedBox(height: 12),
                    ElevatedButton(
                      onPressed: onSelectActiveRequest,
                      style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text('Open Live Tracking Map'),
                          SizedBox(width: 8),
                          Icon(Icons.arrow_forward, size: 16),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),
          ],

          // Past Requests
          const Text(
            'Past Assistance Records',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
          ),
          const SizedBox(height: 10),

          if (pastRequests.isEmpty)
            const Center(
              child: Padding(
                padding: EdgeInsets.all(32),
                child: Text('No previous roadside service records yet.'),
              ),
            )
          else
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: pastRequests.length,
              itemBuilder: (context, index) {
                final req = pastRequests[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 10),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  child: ListTile(
                    leading: Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: AppColors.surfaceVariant,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.car_crash, color: AppColors.accentBlue),
                    ),
                    title: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(req.issueTitle, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0xFFDCFCE7),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Text('Completed', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: AppColors.accentGreen)),
                        ),
                      ],
                    ),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(req.locationAddress, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                        Text('${req.createdAt} • Driver: ${req.helper?.name ?? "John D."} • \$${req.agreedPrice?.toStringAsFixed(2) ?? "50.00"}', style: const TextStyle(fontSize: 10, color: AppColors.textMuted)),
                      ],
                    ),
                    trailing: const Icon(Icons.arrow_forward_ios, size: 14),
                    onTap: () => onSelectPastRequest(req),
                  ),
                );
              },
            ),
        ],
      ),
    );
  }
}
