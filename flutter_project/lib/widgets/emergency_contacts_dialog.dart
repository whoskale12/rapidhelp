import 'package:flutter/material.dart';
import '../models/user_profile.dart';
import '../theme/app_theme.dart';

class EmergencyContactsDialog extends StatefulWidget {
  final List<EmergencyContact> contacts;
  final Function(List<EmergencyContact>) onSave;

  const EmergencyContactsDialog({
    super.key,
    required this.contacts,
    required this.onSave,
  });

  @override
  State<EmergencyContactsDialog> createState() => _EmergencyContactsDialogState();
}

class _EmergencyContactsDialogState extends State<EmergencyContactsDialog> {
  late List<EmergencyContact> _list;
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();
  final String _relationship = 'Family';

  @override
  void initState() {
    super.initState();
    _list = List.from(widget.contacts);
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  void _addContact() {
    if (_nameController.text.trim().isEmpty || _phoneController.text.trim().isEmpty) return;

    final newC = EmergencyContact(
      id: 'ec_${DateTime.now().millisecondsSinceEpoch}',
      name: _nameController.text.trim(),
      relationship: _relationship,
      phone: _phoneController.text.trim(),
      notifyOnSos: true,
    );

    setState(() {
      _list.add(newC);
      _nameController.clear();
      _phoneController.clear();
    });
    widget.onSave(_list);
  }

  void _removeContact(String id) {
    setState(() {
      _list.removeWhere((c) => c.id == id);
    });
    widget.onSave(_list);
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Row(
                  children: [
                    Icon(Icons.shield, color: AppColors.primary, size: 22),
                    SizedBox(width: 8),
                    Text('Emergency Contacts', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  ],
                ),
                IconButton(
                  icon: const Icon(Icons.close, size: 20),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
            const Text(
              'These contacts receive an automated SMS broadcast with your live GPS location during SOS dispatches.',
              style: TextStyle(fontSize: 11, color: AppColors.textSecondary),
            ),
            const SizedBox(height: 16),

            // Contacts List
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _list.length,
              itemBuilder: (ctx, idx) {
                final c = _list[idx];
                return Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceVariant,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    children: [
                      CircleAvatar(
                        radius: 16,
                        backgroundColor: AppColors.primaryContainer,
                        child: Text(c.name.isNotEmpty ? c.name[0] : 'E', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: AppColors.primary)),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(c.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                            Text('${c.relationship} • ${c.phone}', style: const TextStyle(fontSize: 10, color: AppColors.textSecondary)),
                          ],
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.delete_outline, color: AppColors.primary, size: 18),
                        onPressed: () => _removeContact(c.id),
                      ),
                    ],
                  ),
                );
              },
            ),

            const SizedBox(height: 12),
            const Divider(),
            const SizedBox(height: 8),
            const Text('Add Contact', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
            const SizedBox(height: 8),
            TextField(
              controller: _nameController,
              decoration: InputDecoration(
                labelText: 'Name',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              ),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _phoneController,
              keyboardType: TextInputType.phone,
              decoration: InputDecoration(
                labelText: 'Phone Number',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              ),
            ),
            const SizedBox(height: 12),
            ElevatedButton(
              onPressed: _addContact,
              child: const Text('Add to SOS Broadcast'),
            ),
          ],
        ),
      ),
    );
  }
}
