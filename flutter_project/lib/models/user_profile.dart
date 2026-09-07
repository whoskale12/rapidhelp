class Vehicle {
  final String id;
  final String make;
  final String model;
  final int year;
  final String color;
  final String licensePlate;
  final bool isDefault;

  Vehicle({
    required this.id,
    required this.make,
    required this.model,
    required this.year,
    required this.color,
    required this.licensePlate,
    this.isDefault = false,
  });

  Vehicle copyWith({
    String? id,
    String? make,
    String? model,
    int? year,
    String? color,
    String? licensePlate,
    bool? isDefault,
  }) {
    return Vehicle(
      id: id ?? this.id,
      make: make ?? this.make,
      model: model ?? this.model,
      year: year ?? this.year,
      color: color ?? this.color,
      licensePlate: licensePlate ?? this.licensePlate,
      isDefault: isDefault ?? this.isDefault,
    );
  }
}

class EmergencyContact {
  final String id;
  final String name;
  final String relationship;
  final String phone;
  final bool notifyOnSos;

  EmergencyContact({
    required this.id,
    required this.name,
    required this.relationship,
    required this.phone,
    this.notifyOnSos = true,
  });

  EmergencyContact copyWith({
    String? id,
    String? name,
    String? relationship,
    String? phone,
    bool? notifyOnSos,
  }) {
    return EmergencyContact(
      id: id ?? this.id,
      name: name ?? this.name,
      relationship: relationship ?? this.relationship,
      phone: phone ?? this.phone,
      notifyOnSos: notifyOnSos ?? this.notifyOnSos,
    );
  }
}

class UserProfile {
  final String id;
  final String name;
  final String email;
  final String phone;
  final String avatarUrl;
  final bool isVerified;
  final int rewardPoints;
  final bool silentMode;
  final List<Vehicle> vehicles;
  final String activeVehicleId;
  final List<EmergencyContact> emergencyContacts;

  UserProfile({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    required this.avatarUrl,
    this.isVerified = true,
    this.rewardPoints = 1250,
    this.silentMode = false,
    required this.vehicles,
    required this.activeVehicleId,
    required this.emergencyContacts,
  });

  Vehicle? get activeVehicle {
    try {
      return vehicles.firstWhere((v) => v.id == activeVehicleId);
    } catch (_) {
      return vehicles.isNotEmpty ? vehicles.first : null;
    }
  }

  UserProfile copyWith({
    String? id,
    String? name,
    String? email,
    String? phone,
    String? avatarUrl,
    bool? isVerified,
    int? rewardPoints,
    bool? silentMode,
    List<Vehicle>? vehicles,
    String? activeVehicleId,
    List<EmergencyContact>? emergencyContacts,
  }) {
    return UserProfile(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      isVerified: isVerified ?? this.isVerified,
      rewardPoints: rewardPoints ?? this.rewardPoints,
      silentMode: silentMode ?? this.silentMode,
      vehicles: vehicles ?? this.vehicles,
      activeVehicleId: activeVehicleId ?? this.activeVehicleId,
      emergencyContacts: emergencyContacts ?? this.emergencyContacts,
    );
  }
}
