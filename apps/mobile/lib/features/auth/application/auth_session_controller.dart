import 'package:flutter/foundation.dart';

import '../../../core/api/marketplace_api_client.dart';
import '../../../core/api/marketplace_models.dart';
import '../../../core/config/app_config.dart';

class AuthSessionController extends ChangeNotifier {
  AuthSessionController({MarketplaceApiClient? apiClient})
    : _apiClient =
          apiClient ?? MarketplaceApiClient(baseUrl: AppConfig.apiBaseUrl);

  final MarketplaceApiClient _apiClient;

  AuthUser? user;
  String? accessToken;
  bool isLoading = false;
  String? errorMessage;

  bool get isAuthenticated => accessToken != null && user != null;
  String? get patientCountryCode => user?.patientProfile?.countryCode;

  Future<bool> login({required String email, required String password}) async {
    return _authenticate(
      () => _apiClient.login(email: email, password: password),
    );
  }

  Future<bool> registerPatient({
    required String fullName,
    required String email,
    required String password,
    required String phone,
    required String countryCode,
    required String residenceCity,
    String? languageCode,
    String? currencyCode,
    String? biologicalSex,
    String? genderIdentity,
    String? dateOfBirth,
    double? latitude,
    double? longitude,
    int? travelRadiusKm,
    String? preferredDestinationCountryCode,
    String? medicalSummary,
  }) async {
    return _authenticate(
      () => _apiClient.registerPatient(
        fullName: fullName,
        email: email,
        password: password,
        phone: phone,
        countryCode: countryCode,
        residenceCity: residenceCity,
        languageCode: languageCode,
        currencyCode: currencyCode,
        biologicalSex: biologicalSex,
        genderIdentity: genderIdentity,
        dateOfBirth: dateOfBirth,
        latitude: latitude,
        longitude: longitude,
        travelRadiusKm: travelRadiusKm,
        preferredDestinationCountryCode: preferredDestinationCountryCode,
        medicalSummary: medicalSummary,
      ),
    );
  }

  Future<bool> updateProfile({
    String? fullName,
    String? phone,
    String? countryCode,
    String? residenceCity,
    String? languageCode,
    String? currencyCode,
    String? biologicalSex,
    String? genderIdentity,
    String? dateOfBirth,
    double? latitude,
    double? longitude,
    int? travelRadiusKm,
    String? preferredDestinationCountryCode,
    String? medicalSummary,
  }) async {
    final token = accessToken;
    if (token == null || token.isEmpty || isLoading) {
      return false;
    }

    isLoading = true;
    errorMessage = null;
    notifyListeners();

    try {
      user = await _apiClient.updateMe(
        accessToken: token,
        fullName: fullName,
        phone: phone,
        countryCode: countryCode,
        residenceCity: residenceCity,
        languageCode: languageCode,
        currencyCode: currencyCode,
        biologicalSex: biologicalSex,
        genderIdentity: genderIdentity,
        dateOfBirth: dateOfBirth,
        latitude: latitude,
        longitude: longitude,
        travelRadiusKm: travelRadiusKm,
        preferredDestinationCountryCode: preferredDestinationCountryCode,
        medicalSummary: medicalSummary,
      );
      return true;
    } catch (_) {
      errorMessage = 'Could not save the profile. Please try again.';
      return false;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> loginWithDemoPatient() {
    return login(
      email: 'patient.demo@medtour.local',
      password: 'ChangeMeMvp2026!',
    );
  }

  void signOut() {
    user = null;
    accessToken = null;
    errorMessage = null;
    notifyListeners();
  }

  Future<bool> _authenticate(Future<AuthResponse> Function() request) async {
    if (isLoading) {
      return false;
    }

    isLoading = true;
    errorMessage = null;
    notifyListeners();

    try {
      final response = await request();
      if (response.accessToken.isEmpty || response.user.id.isEmpty) {
        throw const FormatException('Invalid authentication response.');
      }

      user = response.user;
      accessToken = response.accessToken;
      return true;
    } catch (_) {
      errorMessage = 'Could not sign in. Check the backend and credentials.';
      return false;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }
}
