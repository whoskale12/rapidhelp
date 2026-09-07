import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import '../models/user_profile.dart';

class UserProvider extends ChangeNotifier {
  UserProfile? _user;
  Position? _userLocation;
  String? _currentAddress;

  UserProfile? get user => _user;
  Position? get userLocation => _userLocation;
  String? get currentAddress => _currentAddress;

  void setUser(UserProfile userProfile) {
    _user = userProfile;
    notifyListeners();
  }

  void updateUser(UserProfile updatedUser) {
    _user = updatedUser;
    notifyListeners();
  }

  void clearUser() {
    _user = null;
    _userLocation = null;
    _currentAddress = null;
    notifyListeners();
  }

  void setUserLocation(Position position, String address) {
    _userLocation = position;
    _currentAddress = address;
    notifyListeners();
  }
}
