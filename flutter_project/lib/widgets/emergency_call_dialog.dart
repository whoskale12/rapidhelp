import 'dart:async';
import 'package:flutter/material.dart';
import '../models/assistance_request.dart';
import '../theme/app_theme.dart';

class EmergencyCallDialog extends StatefulWidget {
  final HelperDriver helper;
  final VoidCallback onEndCall;

  const EmergencyCallDialog({
    super.key,
    required this.helper,
    required this.onEndCall,
  });

  @override
  State<EmergencyCallDialog> createState() => _EmergencyCallDialogState();
}

class _EmergencyCallDialogState extends State<EmergencyCallDialog> {
  int _seconds = 0;
  Timer? _timer;
  bool _isMuted = false;
  bool _isSpeaker = true;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (mounted) setState(() => _seconds++);
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  String _formatDuration(int sec) {
    final m = (sec ~/ 60).toString().padLeft(2, '0');
    final s = (sec % 60).toString().padLeft(2, '0');
    return '$m:$s';
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: const Color(0xFF1E293B),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.white12,
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.shield, color: AppColors.accentAmber, size: 14),
                  SizedBox(width: 6),
                  Text('Encrypted RapidHelp Dispatch Call', style: TextStyle(color: Colors.white70, fontSize: 10, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
            const SizedBox(height: 20),
            CircleAvatar(
              radius: 40,
              backgroundImage: NetworkImage(widget.helper.avatarUrl),
            ),
            const SizedBox(height: 12),
            Text(widget.helper.name, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
            Text('${widget.helper.role} • ${widget.helper.plate}', style: const TextStyle(color: Colors.white60, fontSize: 11)),
            const SizedBox(height: 10),
            Text(_formatDuration(_seconds), style: const TextStyle(color: AppColors.accentAmber, fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                IconButton(
                  onPressed: () => setState(() => _isMuted = !_isMuted),
                  icon: Icon(_isMuted ? Icons.mic_off : Icons.mic, color: _isMuted ? AppColors.primary : Colors.white),
                  style: IconButton.styleFrom(backgroundColor: Colors.white12, padding: const EdgeInsets.all(14)),
                ),
                IconButton(
                  onPressed: () => setState(() => _isSpeaker = !_isSpeaker),
                  icon: Icon(_isSpeaker ? Icons.volume_up : Icons.volume_mute, color: _isSpeaker ? AppColors.accentBlue : Colors.white),
                  style: IconButton.styleFrom(backgroundColor: Colors.white12, padding: const EdgeInsets.all(14)),
                ),
              ],
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: widget.onEndCall,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              ),
              icon: const Icon(Icons.call_end, color: Colors.white),
              label: const Text('End Call'),
            ),
          ],
        ),
      ),
    );
  }
}
