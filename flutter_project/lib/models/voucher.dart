class Voucher {
  final String id;
  final String title;
  final String description;
  final int pointsCost;
  final String imageUrl;
  final String category; // 'fuel' | 'service' | 'drink' | 'wash'

  Voucher({
    required this.id,
    required this.title,
    required this.description,
    required this.pointsCost,
    required this.imageUrl,
    required this.category,
  });
}

class RedeemedVoucher {
  final String id;
  final String voucherId;
  final String title;
  final String code;
  final String redeemedAt;
  final int pointsSpent;
  final bool isUsed;

  RedeemedVoucher({
    required this.id,
    required this.voucherId,
    required this.title,
    required this.code,
    required this.redeemedAt,
    required this.pointsSpent,
    this.isUsed = false,
  });
}
