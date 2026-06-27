import 'dart:convert';

import 'marketplace_models.dart';
import 'marketplace_transport.dart';

class MarketplaceApiClient {
  MarketplaceApiClient({required this.baseUrl, MarketplaceTransport? transport})
    : transport = transport ?? const MarketplaceTransport();

  final String baseUrl;
  final MarketplaceTransport transport;

  Future<AuthResponse> login({
    required String email,
    required String password,
  }) async {
    final body = await _post(
      'auth/login',
      body: {'email': email.trim(), 'password': password},
    );

    return AuthResponse.fromJson(body is JsonMap ? body : {});
  }

  Future<AuthResponse> registerPatient({
    required String email,
    required String password,
    String? phone,
  }) async {
    final body = await _post(
      'auth/register/patient',
      body: {
        'email': email.trim(),
        'password': password,
        if (phone != null && phone.trim().isNotEmpty) 'phone': phone.trim(),
      },
    );

    return AuthResponse.fromJson(body is JsonMap ? body : {});
  }

  Future<List<MarketplaceProcedure>> listProcedures({String? q}) async {
    final body = await _get('procedures', query: {'q': q});

    if (body is! List) {
      return const [];
    }

    return body
        .whereType<JsonMap>()
        .map(MarketplaceProcedure.fromJson)
        .toList(growable: false);
  }

  Future<SearchOffersResponse> searchOffers({
    String? procedureSlug,
    String? countryCode,
    String? patientCountryCode,
    String? q,
    String sort = 'total_asc',
    int limit = 20,
  }) async {
    final body = await _get(
      'search/offers',
      query: {
        'procedureSlug': procedureSlug,
        'countryCode': countryCode,
        'patientCountryCode': patientCountryCode,
        'q': q,
        'sort': sort,
        'limit': limit.toString(),
      },
    );

    return SearchOffersResponse.fromJson(body is JsonMap ? body : {});
  }

  Future<QuoteRequestsResponse> createQuoteRequests({
    required List<String> offerIds,
    required bool antiBypassTermsAccepted,
    required String accessToken,
    String? patientMessage,
  }) async {
    final body = await _post(
      'quote-requests',
      body: {
        'offerIds': offerIds,
        'antiBypassTermsAccepted': antiBypassTermsAccepted,
        if (patientMessage != null && patientMessage.trim().isNotEmpty)
          'patientMessage': patientMessage.trim(),
      },
      headers: {'Authorization': 'Bearer $accessToken'},
    );

    return QuoteRequestsResponse.fromJson(body is JsonMap ? body : {});
  }

  Future<Object?> _get(
    String path, {
    Map<String, String?> query = const {},
  }) async {
    final uri = _buildUri(path, query);
    final json = await transport.get(uri);
    return jsonDecode(json);
  }

  Future<Object?> _post(
    String path, {
    required Object body,
    Map<String, String> headers = const {},
  }) async {
    final uri = _buildUri(path, const {});
    final json = await transport.post(uri, body: body, headers: headers);
    return jsonDecode(json);
  }

  Uri _buildUri(String path, Map<String, String?> query) {
    final base = Uri.parse(baseUrl);
    final cleanedBasePath = base.path.replaceFirst(RegExp(r'/$'), '');
    final cleanedPath = path.replaceFirst(RegExp(r'^/'), '');
    final fullPath = '$cleanedBasePath/$cleanedPath';
    final cleanQuery = <String, String>{};

    for (final entry in query.entries) {
      final value = entry.value?.trim();
      if (value != null && value.isNotEmpty) {
        cleanQuery[entry.key] = value;
      }
    }

    return base.replace(
      path: fullPath.startsWith('/') ? fullPath : '/$fullPath',
      queryParameters: cleanQuery.isEmpty ? null : cleanQuery,
    );
  }
}
