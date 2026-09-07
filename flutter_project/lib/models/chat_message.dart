class ChatMessage {
  final String id;
  final String sender; // 'user' | 'helper' | 'system'
  final String text;
  final String timestamp;
  final bool isOffer;
  final double? offerAmount;
  final String? offerStatus; // 'pending' | 'accepted' | 'declined'
  final String? photoUrl;

  ChatMessage({
    required this.id,
    required this.sender,
    required this.text,
    required this.timestamp,
    this.isOffer = false,
    this.offerAmount,
    this.offerStatus,
    this.photoUrl,
  });

  ChatMessage copyWith({
    String? id,
    String? sender,
    String? text,
    String? timestamp,
    bool? isOffer,
    double? offerAmount,
    String? offerStatus,
    String? photoUrl,
  }) {
    return ChatMessage(
      id: id ?? this.id,
      sender: sender ?? this.sender,
      text: text ?? this.text,
      timestamp: timestamp ?? this.timestamp,
      isOffer: isOffer ?? this.isOffer,
      offerAmount: offerAmount ?? this.offerAmount,
      offerStatus: offerStatus ?? this.offerStatus,
      photoUrl: photoUrl ?? this.photoUrl,
    );
  }
}
