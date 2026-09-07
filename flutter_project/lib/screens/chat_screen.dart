import 'package:flutter/material.dart';
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
    super.key,
    required this.request,
    required this.initialMessages,
    required this.onBack,
    required this.onStartCall,
    required this.onUpdateAgreedPrice,
  });

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  late List<ChatMessage> _messages;
  final TextEditingController _textController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  bool _offerAccepted = false;

  @override
  void initState() {
    super.initState();
    _messages = List.from(widget.initialMessages);
    _offerAccepted = widget.request.offerStatus == 'accepted';
  }

  @override
  void dispose() {
    _textController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void _sendMessage([String? textToSend]) {
    final text = textToSend ?? _textController.text.trim();
    if (text.isEmpty) return;

    final userMsg = ChatMessage(
      id: 'msg_${DateTime.now().millisecondsSinceEpoch}',
      sender: 'user',
      text: text,
      timestamp: '${DateTime.now().hour}:${DateTime.now().minute.toString().padLeft(2, '0')}',
    );

    setState(() {
      _messages.add(userMsg);
      if (textToSend == null) _textController.clear();
    });
    _scrollToBottom();

    // Simulated driver reply
    Future.delayed(const Duration(milliseconds: 1200), () {
      if (!mounted) return;
      String reply = "Got it! Taking the quickest route around traffic. Hang tight!";
      if (text.toLowerCase().contains('location') || text.toLowerCase().contains('where')) {
        reply = "I see your GPS pin on my dispatch map. Arriving in ~3 minutes.";
      } else if (text.toLowerCase().contains('thank') || text.toLowerCase().contains('ok')) {
        reply = "Happy to help! Keep hazard blinkers active.";
      }

      setState(() {
        _messages.add(ChatMessage(
          id: 'msg_${DateTime.now().millisecondsSinceEpoch + 1}',
          sender: 'helper',
          text: reply,
          timestamp: '${DateTime.now().hour}:${DateTime.now().minute.toString().padLeft(2, '0')}',
        ));
      });
      _scrollToBottom();
    });
  }

  void _acceptOffer(double amount) {
    setState(() {
      _offerAccepted = true;
      _messages = _messages.map((m) => m.isOffer ? m.copyWith(offerStatus: 'accepted') : m).toList();

      _messages.add(ChatMessage(
        id: 'msg_${DateTime.now().millisecondsSinceEpoch}',
        sender: 'user',
        text: 'I accept the service offer of \$${amount.toStringAsFixed(2)}. Cash / transfer ready.',
        timestamp: '${DateTime.now().hour}:${DateTime.now().minute.toString().padLeft(2, '0')}',
      ));

      _messages.add(ChatMessage(
        id: 'msg_${DateTime.now().millisecondsSinceEpoch + 1}',
        sender: 'helper',
        text: 'Deal locked in! See you in a couple of minutes.',
        timestamp: '${DateTime.now().hour}:${DateTime.now().minute.toString().padLeft(2, '0')}',
      ));
    });

    widget.onUpdateAgreedPrice(amount);
    _scrollToBottom();
  }

  void _showCounterOfferDialog() {
    final amountController = TextEditingController(text: '45.00');

    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Text('Make Custom Offer', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('Propose an agreed direct cash or bank transfer payment:', style: TextStyle(fontSize: 12)),
              const SizedBox(height: 16),
              TextField(
                controller: amountController,
                keyboardType: TextInputType.number,
                decoration: InputDecoration(
                  prefixText: '\$ ',
                  labelText: 'Amount (USD)',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
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
                final amt = double.tryParse(amountController.text) ?? 45.00;
                Navigator.pop(ctx);
                _sendCustomOffer(amt);
              },
              child: const Text('Send Offer'),
            ),
          ],
        );
      },
    );
  }

  void _sendCustomOffer(double amount) {
    setState(() {
      _messages.add(ChatMessage(
        id: 'msg_${DateTime.now().millisecondsSinceEpoch}',
        sender: 'user',
        text: 'Would you be able to do \$${amount.toStringAsFixed(2)} for this service?',
        timestamp: '${DateTime.now().hour}:${DateTime.now().minute.toString().padLeft(2, '0')}',
      ));
    });
    _scrollToBottom();

    Future.delayed(const Duration(milliseconds: 1400), () {
      if (!mounted) return;
      setState(() {
        _offerAccepted = true;
        _messages.add(ChatMessage(
          id: 'msg_${DateTime.now().millisecondsSinceEpoch + 1}',
          sender: 'helper',
          text: 'Sure, \$${amount.toStringAsFixed(2)} works. Deal!',
          timestamp: '${DateTime.now().hour}:${DateTime.now().minute.toString().padLeft(2, '0')}',
          isOffer: true,
          offerAmount: amount,
          offerStatus: 'accepted',
        ));
      });
      widget.onUpdateAgreedPrice(amount);
      _scrollToBottom();
    });
  }

  @override
  Widget build(BuildContext context) {
    final helper = widget.request.helper;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 1,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.textSecondary),
          onPressed: widget.onBack,
        ),
        title: Row(
          children: [
            CircleAvatar(
              radius: 18,
              backgroundImage: NetworkImage(helper?.avatarUrl ?? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    helper?.name ?? 'John D. - Tow Truck',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.primary),
                  ),
                  const Text(
                    'Online • Active Dispatch',
                    style: TextStyle(fontSize: 10, color: AppColors.accentGreen, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.phone, color: AppColors.primary),
            onPressed: widget.onStartCall,
          ),
        ],
      ),
      body: Column(
        children: [
          // Safety Notice Banner
          Container(
            margin: const EdgeInsets.fromLTRB(16, 12, 16, 4),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: AppColors.surfaceVariant,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.outlineWarm),
            ),
            child: const Row(
              children: [
                Icon(Icons.info_outline, color: AppColors.accentBlue, size: 18),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Payment is settled directly on-site via Cash or Bank Transfer upon arrival.',
                    style: TextStyle(fontSize: 11, color: AppColors.textSecondary),
                  ),
                ),
              ],
            ),
          ),

          // Messages List
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final msg = _messages[index];
                return _buildMessageItem(msg);
              },
            ),
          ),

          // Quick Action Chips
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            color: Colors.white,
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildQuickActionChip(
                    icon: Icons.attach_money,
                    label: 'Make Offer',
                    color: AppColors.accentAmberDark,
                    onTap: _showCounterOfferDialog,
                  ),
                  const SizedBox(width: 8),
                  _buildQuickActionChip(
                    icon: Icons.location_on,
                    label: 'Share Location',
                    color: AppColors.accentBlue,
                    onTap: () => _sendMessage('📍 Shared exact GPS location: ${widget.request.locationAddress}'),
                  ),
                  const SizedBox(width: 8),
                  _buildQuickActionChip(
                    icon: Icons.camera_alt,
                    label: 'Send Photo',
                    color: AppColors.primary,
                    onTap: () => _sendMessage('📷 Sent photo of the vehicle and roadside conditions.'),
                  ),
                ],
              ),
            ),
          ),

          // Bottom Input Bar
          Container(
            padding: const EdgeInsets.fromLTRB(12, 8, 12, 16),
            color: Colors.white,
            child: Row(
              children: [
                IconButton(
                  icon: const Icon(Icons.add_circle_outline, color: AppColors.textSecondary),
                  onPressed: () => _sendMessage('📷 Vehicle photo shared'),
                ),
                Expanded(
                  child: TextField(
                    controller: _textController,
                    decoration: InputDecoration(
                      hintText: 'Type a message...',
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      filled: true,
                      fillColor: AppColors.surfaceVariant,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(24),
                        borderSide: BorderSide.none,
                      ),
                    ),
                    onSubmitted: (_) => _sendMessage(),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton(
                  icon: const Icon(Icons.send, color: Colors.white, size: 18),
                  style: IconButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    padding: const EdgeInsets.all(12),
                  ),
                  onPressed: () => _sendMessage(),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActionChip({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: AppColors.surfaceVariant,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppColors.outlineWarm),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 14, color: color),
            const SizedBox(width: 4),
            Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.textSecondary)),
          ],
        ),
      ),
    );
  }

  Widget _buildMessageItem(ChatMessage msg) {
    final isUser = msg.sender == 'user';

    return Container(
      margin: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        children: [
          Container(
            constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isUser
                  ? AppColors.primaryLight
                  : msg.isOffer
                      ? Colors.white
                      : AppColors.surfaceVariant,
              borderRadius: BorderRadius.circular(16),
              border: msg.isOffer ? Border.all(color: AppColors.outlineWarm) : null,
              boxShadow: [
                BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 4, offset: const Offset(0, 2)),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  msg.text,
                  style: TextStyle(
                    fontSize: 13,
                    color: isUser ? Colors.white : AppColors.textPrimary,
                  ),
                ),
                if (msg.isOffer) ...[
                  const SizedBox(height: 10),
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppColors.accentAmber.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Service Offer', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.textSecondary)),
                            Text('\$${(msg.offerAmount ?? 50.0).toStringAsFixed(2)}', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.primary)),
                          ],
                        ),
                        const SizedBox(height: 8),
                        if (_offerAccepted || msg.offerStatus == 'accepted') ...[
                          Container(
                            padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
                            decoration: BoxDecoration(
                              color: const Color(0xFFDCFCE7),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: const Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.check, size: 14, color: AppColors.accentGreen),
                                SizedBox(width: 4),
                                Text('Offer Accepted', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.accentGreen)),
                              ],
                            ),
                          ),
                        ] else ...[
                          Row(
                            children: [
                              Expanded(
                                child: OutlinedButton(
                                  onPressed: _showCounterOfferDialog,
                                  child: const Text('Decline / Counter', style: TextStyle(fontSize: 11)),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: ElevatedButton(
                                  onPressed: () => _acceptOffer(msg.offerAmount ?? 50.0),
                                  style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
                                  child: const Text('Accept', style: TextStyle(fontSize: 11)),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ],
                    ),
                  ),
                ],
                const SizedBox(height: 4),
                Text(
                  msg.timestamp,
                  style: TextStyle(
                    fontSize: 9,
                    color: isUser ? Colors.white70 : AppColors.textMuted,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
