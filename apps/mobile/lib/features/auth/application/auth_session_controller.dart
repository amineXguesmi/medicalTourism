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

  Future<bool> login({required String email, required String password}) async {
    return _authenticate(
      () => _apiClient.login(email: email, password: password),
    );
  }

  Future<bool> registerPatient({
    required String email,
    required String password,
    String? phone,
  }) async {
    return _authenticate(
      () => _apiClient.registerPatient(
        email: email,
        password: password,
        phone: phone,
      ),
    );
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
