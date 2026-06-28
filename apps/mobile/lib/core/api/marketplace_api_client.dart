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
    final body = await _post(
      'auth/register/patient',
      body: {
        'fullName': fullName.trim(),
        'email': email.trim(),
        'password': password,
        'phone': phone.trim(),
        'countryCode': countryCode.trim().toUpperCase(),
        'residenceCity': residenceCity.trim(),
        ..._profileFields(
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
      },
    );

    return AuthResponse.fromJson(body is JsonMap ? body : {});
  }

  Future<AuthUser> getMe({required String accessToken}) async {
    final body = await _get(
      'users/me',
      headers: {'Authorization': 'Bearer $accessToken'},
    );

    return AuthUser.fromJson(body is JsonMap ? body : {});
  }

  Future<AuthUser> updateMe({
    required String accessToken,
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
    final body = await _patch(
      'users/me',
      body: {
        if (fullName != null && fullName.trim().isNotEmpty)
          'fullName': fullName.trim(),
        if (phone != null && phone.trim().isNotEmpty) 'phone': phone.trim(),
        if (countryCode != null && countryCode.trim().isNotEmpty)
          'countryCode': countryCode.trim().toUpperCase(),
        if (residenceCity != null && residenceCity.trim().isNotEmpty)
          'residenceCity': residenceCity.trim(),
        ..._profileFields(
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
      },
      headers: {'Authorization': 'Bearer $accessToken'},
    );

    return AuthUser.fromJson(body is JsonMap ? body : {});
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
    Map<String, String> headers = const {},
  }) async {
    final uri = _buildUri(path, query);
    final json = await transport.get(uri, headers: headers);
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

  Future<Object?> _patch(
    String path, {
    required Object body,
    Map<String, String> headers = const {},
  }) async {
    final uri = _buildUri(path, const {});
    final json = await transport.patch(uri, body: body, headers: headers);
    return jsonDecode(json);
  }

  Future<QuoteRequestsResponse> listMyQuoteRequests({
    required String accessToken,
  }) async {
    final body = await _get(
      'quote-requests/mine',
      headers: {'Authorization': 'Bearer $accessToken'},
    );

    return QuoteRequestsResponse.fromJson(body is JsonMap ? body : {});
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

  Map<String, Object> _profileFields({
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
  }) {
    return {
      if (languageCode != null && languageCode.trim().isNotEmpty)
        'languageCode': languageCode.trim(),
      if (currencyCode != null && currencyCode.trim().isNotEmpty)
        'currencyCode': currencyCode.trim().toUpperCase(),
      if (biologicalSex != null && biologicalSex.trim().isNotEmpty)
        'biologicalSex': biologicalSex.trim(),
      if (genderIdentity != null && genderIdentity.trim().isNotEmpty)
        'genderIdentity': genderIdentity.trim(),
      if (dateOfBirth != null && dateOfBirth.trim().isNotEmpty)
        'dateOfBirth': dateOfBirth.trim(),
      if (latitude != null) 'latitude': latitude,
      if (longitude != null) 'longitude': longitude,
      if (travelRadiusKm != null) 'travelRadiusKm': travelRadiusKm,
      if (preferredDestinationCountryCode != null &&
          preferredDestinationCountryCode.trim().isNotEmpty)
        'preferredDestinationCountryCode': preferredDestinationCountryCode
            .trim()
            .toUpperCase(),
      if (medicalSummary != null && medicalSummary.trim().isNotEmpty)
        'medicalSummary': medicalSummary.trim(),
    };
  }
}
