import 'runtime_platform.dart';

abstract final class AppConfig {
  static const _configuredApiBaseUrl = String.fromEnvironment(
    'MEDTOUR_API_BASE_URL',
  );

  static String get apiBaseUrl {
    if (_configuredApiBaseUrl.trim().isNotEmpty) {
      return _withoutTrailingSlash(_configuredApiBaseUrl.trim());
    }

    final host = RuntimePlatform.isAndroid ? '10.0.2.2' : 'localhost';
    return 'http://$host:3001/api/v1';
  }

  static String _withoutTrailingSlash(String value) {
    return value.endsWith('/') ? value.substring(0, value.length - 1) : value;
  }
}
