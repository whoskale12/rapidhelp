import 'user_profile.dart';

enum IssueCategory {
  flatTire,
  fuel,
  engine,
  battery,
  lockout,
  towing,
  medical,
}

enum RequestStatus {
  searching,
  accepted,
  enRoute,
  arrived,
  inProgress,
  completed,
  cancelled,
}

class HelperDriver {
  final String id;
  final String name;
  final String role;
  final double rating;
  final int rescuesCount;
  final String vehicleDesc;
  final String plate;
  final String avatarUrl;
  final String phone;
  final int currentEtaMinutes;
  final double distanceMiles;
  final double locationX;
  final double locationY;

  HelperDriver({
    required this.id,
    required this.name,
    required this.role,
    required this.rating,
    required this.rescuesCount,
    required this.vehicleDesc,
    required this.plate,
    required this.avatarUrl,
    required this.phone,
    required this.currentEtaMinutes,
    required this.distanceMiles,
    required this.locationX,
    required this.locationY,
  });

  HelperDriver copyWith({
    String? id,
    String? name,
    String? role,
    double? rating,
    int? rescuesCount,
    String? vehicleDesc,
    String? plate,
    String? avatarUrl,
    String? phone,
    int? currentEtaMinutes,
    double? distanceMiles,
    double? locationX,
    double? locationY,
  }) {
    return HelperDriver(
      id: id ?? this.id,
      name: name ?? this.name,
      role: role ?? this.role,
      rating: rating ?? this.rating,
      rescuesCount: rescuesCount ?? this.rescuesCount,
      vehicleDesc: vehicleDesc ?? this.vehicleDesc,
      plate: plate ?? this.plate,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      phone: phone ?? this.phone,
      currentEtaMinutes: currentEtaMinutes ?? this.currentEtaMinutes,
      distanceMiles: distanceMiles ?? this.distanceMiles,
      locationX: locationX ?? this.locationX,
      locationY: locationY ?? this.locationY,
    );
  }
}

class AssistanceRequest {
  final String id;
  final String userId;
  final IssueCategory category;
  final String issueTitle;
  final String issueDescription;
  final String locationAddress;
  final Vehicle vehicle;
  final RequestStatus status;
  final HelperDriver? helper;
  final String createdAt;
  final double estimatedCost;
  final double? agreedPrice;
  final String offerStatus; // 'pending' | 'accepted' | 'declined'

  AssistanceRequest({
    required this.id,
    required this.userId,
    required this.category,
    required this.issueTitle,
    required this.issueDescription,
    required this.locationAddress,
    required this.vehicle,
    required this.status,
    this.helper,
    required this.createdAt,
    required this.estimatedCost,
    this.agreedPrice,
    this.offerStatus = 'pending',
  });

  AssistanceRequest copyWith({
    String? id,
    String? userId,
    IssueCategory? category,
    String? issueTitle,
    String? issueDescription,
    String? locationAddress,
    Vehicle? vehicle,
    RequestStatus? status,
    HelperDriver? helper,
    String? createdAt,
    double? estimatedCost,
    double? agreedPrice,
    String? offerStatus,
  }) {
    return AssistanceRequest(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      category: category ?? this.category,
      issueTitle: issueTitle ?? this.issueTitle,
      issueDescription: issueDescription ?? this.issueDescription,
      locationAddress: locationAddress ?? this.locationAddress,
      vehicle: vehicle ?? this.vehicle,
      status: status ?? this.status,
      helper: helper ?? this.helper,
      createdAt: createdAt ?? this.createdAt,
      estimatedCost: estimatedCost ?? this.estimatedCost,
      agreedPrice: agreedPrice ?? this.agreedPrice,
      offerStatus: offerStatus ?? this.offerStatus,
    );
  }
}
