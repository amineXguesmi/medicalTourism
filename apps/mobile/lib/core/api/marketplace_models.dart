typedef JsonMap = Map<String, dynamic>;

class AuthUser {
  const AuthUser({
    required this.id,
    required this.email,
    required this.roles,
    this.phone,
    this.patientProfile,
  });

  final String id;
  final String email;
  final List<String> roles;
  final String? phone;
  final PatientProfileSnapshot? patientProfile;

  factory AuthUser.fromJson(JsonMap json) {
    return AuthUser(
      id: _readString(json['id']),
      email: _readString(json['email']),
      roles: _readStringList(json['roles']),
      phone: _readNullableString(json['phone']),
      patientProfile: json['patientProfile'] is JsonMap
          ? PatientProfileSnapshot.fromJson(_readMap(json['patientProfile']))
          : null,
    );
  }
}

class PatientProfileSnapshot {
  const PatientProfileSnapshot({
    this.fullName,
    this.countryCode,
    this.residenceCity,
    this.languageCode,
    this.currencyCode,
    this.dateOfBirth,
    this.biologicalSex,
    this.genderIdentity,
    this.latitude,
    this.longitude,
    this.travelRadiusKm,
    this.medicalSummary,
  });

  final String? fullName;
  final String? countryCode;
  final String? residenceCity;
  final String? languageCode;
  final String? currencyCode;
  final DateTime? dateOfBirth;
  final String? biologicalSex;
  final String? genderIdentity;
  final double? latitude;
  final double? longitude;
  final int? travelRadiusKm;
  final String? medicalSummary;

  factory PatientProfileSnapshot.fromJson(JsonMap json) {
    return PatientProfileSnapshot(
      fullName: _readNullableString(json['fullName']),
      countryCode: _readNullableString(json['countryCode']),
      residenceCity: _readNullableString(json['residenceCity']),
      languageCode: _readNullableString(json['languageCode']),
      currencyCode: _readNullableString(json['currencyCode']),
      dateOfBirth: DateTime.tryParse(_readString(json['dateOfBirth'])),
      biologicalSex: _readNullableString(json['biologicalSex']),
      genderIdentity: _readNullableString(json['genderIdentity']),
      latitude: _readNullableDouble(json['latitude']),
      longitude: _readNullableDouble(json['longitude']),
      travelRadiusKm: _readNullableInt(json['travelRadiusKm']),
      medicalSummary: _readNullableString(
        _readMap(json['medicalHistory'])['summary'],
      ),
    );
  }
}

class AuthResponse {
  const AuthResponse({required this.user, required this.accessToken});

  final AuthUser user;
  final String accessToken;

  factory AuthResponse.fromJson(JsonMap json) {
    return AuthResponse(
      user: AuthUser.fromJson(_readMap(json['user'])),
      accessToken: _readString(json['accessToken']),
    );
  }
}

class MarketplaceProcedure {
  const MarketplaceProcedure({
    required this.id,
    required this.slug,
    required this.name,
    required this.specialty,
    required this.description,
    required this.requiredDocs,
    required this.verifiedOfferCount,
  });

  final String id;
  final String slug;
  final String name;
  final String specialty;
  final String description;
  final List<String> requiredDocs;
  final int verifiedOfferCount;

  factory MarketplaceProcedure.fromJson(JsonMap json) {
    return MarketplaceProcedure(
      id: _readString(json['id']),
      slug: _readString(json['slug']),
      name: _readString(json['name']),
      specialty: _readString(json['specialty']),
      description: _readString(json['description']),
      requiredDocs: _readStringList(json['requiredDocs']),
      verifiedOfferCount: _readInt(_readMap(json['_count'])['clinics']),
    );
  }
}

class ClinicSummary {
  const ClinicSummary({
    required this.id,
    required this.name,
    required this.countryCode,
    required this.verificationStatus,
    this.publishedAt,
  });

  final String id;
  final String name;
  final String countryCode;
  final String verificationStatus;
  final DateTime? publishedAt;

  factory ClinicSummary.fromJson(JsonMap json) {
    return ClinicSummary(
      id: _readString(json['id']),
      name: _readString(json['name']),
      countryCode: _readString(json['countryCode']),
      verificationStatus: _readString(json['verificationStatus']),
      publishedAt: DateTime.tryParse(_readString(json['publishedAt'])),
    );
  }
}

class OfferPrice {
  const OfferPrice({
    required this.basePriceCents,
    required this.currencyCode,
    required this.includedItems,
    required this.excludedItems,
  });

  final int basePriceCents;
  final String currencyCode;
  final List<String> includedItems;
  final List<String> excludedItems;

  factory OfferPrice.fromJson(JsonMap json) {
    return OfferPrice(
      basePriceCents: _readInt(json['basePriceCents']),
      currencyCode: _readString(json['currencyCode'], fallback: 'EUR'),
      includedItems: _readStringList(json['includedItems']),
      excludedItems: _readStringList(json['excludedItems']),
    );
  }
}

class CostEstimate {
  const CostEstimate({
    required this.currencyCode,
    required this.procedurePriceCents,
    required this.estimatedFlightCents,
    required this.estimatedHotelCents,
    required this.estimatedTransferCents,
    required this.estimatedTotalCents,
    required this.assumptions,
    required this.isEstimate,
  });

  final String currencyCode;
  final int? procedurePriceCents;
  final int estimatedFlightCents;
  final int estimatedHotelCents;
  final int estimatedTransferCents;
  final int? estimatedTotalCents;
  final List<String> assumptions;
  final bool isEstimate;

  factory CostEstimate.fromJson(JsonMap json) {
    return CostEstimate(
      currencyCode: _readString(json['currencyCode'], fallback: 'EUR'),
      procedurePriceCents: _readNullableInt(json['procedurePriceCents']),
      estimatedFlightCents: _readInt(json['estimatedFlightCents']),
      estimatedHotelCents: _readInt(json['estimatedHotelCents']),
      estimatedTransferCents: _readInt(json['estimatedTransferCents']),
      estimatedTotalCents: _readNullableInt(json['estimatedTotalCents']),
      assumptions: _readStringList(json['assumptions']),
      isEstimate: json['isEstimate'] == true,
    );
  }
}

class ClinicOffer {
  const ClinicOffer({
    required this.id,
    required this.clinic,
    required this.procedure,
    required this.price,
    required this.availability,
    required this.estimate,
  });

  final String id;
  final ClinicSummary clinic;
  final MarketplaceProcedure procedure;
  final OfferPrice price;
  final String availability;
  final CostEstimate estimate;

  factory ClinicOffer.fromJson(JsonMap json) {
    return ClinicOffer(
      id: _readString(json['id']),
      clinic: ClinicSummary.fromJson(_readMap(json['clinic'])),
      procedure: MarketplaceProcedure.fromJson(_readMap(json['procedure'])),
      price: OfferPrice.fromJson(_readMap(json['price'])),
      availability: _readString(json['availability'], fallback: 'On request'),
      estimate: CostEstimate.fromJson(_readMap(json['estimate'])),
    );
  }
}

class SearchOffersResponse {
  const SearchOffersResponse({required this.count, required this.offers});

  final int count;
  final List<ClinicOffer> offers;

  factory SearchOffersResponse.fromJson(JsonMap json) {
    final offersJson = json['offers'];
    return SearchOffersResponse(
      count: _readInt(json['count']),
      offers: offersJson is List
          ? offersJson
                .whereType<JsonMap>()
                .map(ClinicOffer.fromJson)
                .toList(growable: false)
          : const [],
    );
  }
}

class QuoteRequestSummary {
  const QuoteRequestSummary({
    required this.id,
    required this.status,
    required this.clinic,
    required this.procedure,
    this.createdAt,
  });

  final String id;
  final String status;
  final ClinicSummary clinic;
  final MarketplaceProcedure procedure;
  final DateTime? createdAt;

  factory QuoteRequestSummary.fromJson(JsonMap json) {
    return QuoteRequestSummary(
      id: _readString(json['id']),
      status: _readString(json['status']),
      clinic: ClinicSummary.fromJson(_readMap(json['clinic'])),
      procedure: MarketplaceProcedure.fromJson(_readMap(json['procedure'])),
      createdAt: DateTime.tryParse(_readString(json['createdAt'])),
    );
  }
}

class QuoteRequestsResponse {
  const QuoteRequestsResponse({
    required this.count,
    required this.quoteRequests,
  });

  final int count;
  final List<QuoteRequestSummary> quoteRequests;

  factory QuoteRequestsResponse.fromJson(JsonMap json) {
    final requestsJson = json['quoteRequests'];
    return QuoteRequestsResponse(
      count: _readInt(json['count']),
      quoteRequests: requestsJson is List
          ? requestsJson
                .whereType<JsonMap>()
                .map(QuoteRequestSummary.fromJson)
                .toList(growable: false)
          : const [],
    );
  }
}

String formatMoney(int? cents, String currencyCode) {
  if (cents == null) {
    return 'On request';
  }

  final amount = cents / 100;
  final displayAmount = cents % 100 == 0
      ? amount.toStringAsFixed(0)
      : amount.toStringAsFixed(2);
  return '$currencyCode $displayAmount';
}

JsonMap _readMap(Object? value) {
  return value is JsonMap ? value : <String, dynamic>{};
}

String _readString(Object? value, {String fallback = ''}) {
  final text = value?.toString();
  return text == null || text.isEmpty ? fallback : text;
}

String? _readNullableString(Object? value) {
  final text = value?.toString().trim();
  return text == null || text.isEmpty ? null : text;
}

int _readInt(Object? value) {
  return _readNullableInt(value) ?? 0;
}

int? _readNullableInt(Object? value) {
  if (value == null) {
    return null;
  }
  if (value is int) {
    return value;
  }
  if (value is num) {
    return value.round();
  }
  return int.tryParse(value.toString());
}

double? _readNullableDouble(Object? value) {
  if (value == null) {
    return null;
  }
  if (value is num) {
    return value.toDouble();
  }
  return double.tryParse(value.toString());
}

List<String> _readStringList(Object? value) {
  if (value is! List) {
    return const [];
  }

  return value
      .map((item) => item.toString().trim())
      .where((item) => item.isNotEmpty)
      .toList(growable: false);
}
