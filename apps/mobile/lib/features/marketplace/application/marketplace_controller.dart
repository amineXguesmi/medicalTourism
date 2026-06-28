import 'package:flutter/foundation.dart';

import '../../../core/api/marketplace_api_client.dart';
import '../../../core/api/marketplace_models.dart';
import '../../../core/config/app_config.dart';
import '../data/sample_marketplace_data.dart';

class MarketplaceController extends ChangeNotifier {
  MarketplaceController({
    MarketplaceApiClient? apiClient,
    List<MarketplaceProcedure>? initialProcedures,
    List<ClinicOffer>? initialOffers,
    bool initiallyLoaded = false,
  }) : _apiClient =
           apiClient ?? MarketplaceApiClient(baseUrl: AppConfig.apiBaseUrl),
       procedures = List.of(initialProcedures ?? const []),
       offers = List.of(initialOffers ?? const []),
       hasLoaded = initiallyLoaded;

  factory MarketplaceController.sample() {
    return MarketplaceController(
      initialProcedures: sampleProcedures,
      initialOffers: sampleOffers,
      initiallyLoaded: true,
    )..isUsingSampleData = true;
  }

  final MarketplaceApiClient _apiClient;

  List<MarketplaceProcedure> procedures;
  List<ClinicOffer> offers;
  final Set<String> selectedOfferIds = <String>{};

  bool hasLoaded;
  bool isLoading = false;
  bool isSubmittingQuote = false;
  bool antiBypassTermsAccepted = false;
  bool isUsingSampleData = false;
  String? errorMessage;
  String? quoteStatusMessage;
  String patientMessage = '';
  String query = '';
  String? selectedProcedureSlug;
  String? selectedCountryCode;
  String patientCountryCode = 'FR';
  String sort = 'total_asc';

  List<ClinicOffer> get selectedOffers {
    return offers
        .where((offer) => selectedOfferIds.contains(offer.id))
        .toList(growable: false);
  }

  MarketplaceProcedure? get selectedProcedure {
    for (final procedure in procedures) {
      if (procedure.slug == selectedProcedureSlug) {
        return procedure;
      }
    }
    return procedures.isEmpty ? null : procedures.first;
  }

  String get activeProcedureName => selectedProcedure?.name ?? 'Any procedure';

  Future<void> load() async {
    if (isLoading) {
      return;
    }

    isLoading = true;
    errorMessage = null;
    notifyListeners();

    try {
      procedures = await _apiClient.listProcedures();
      if (procedures.isNotEmpty) {
        selectedProcedureSlug ??= procedures.first.slug;
      }
      await _loadOffersFromApi();
      isUsingSampleData = false;
    } catch (error) {
      _useSampleData(error);
    } finally {
      hasLoaded = true;
      isLoading = false;
      notifyListeners();
    }
  }

  Future<void> refresh() async {
    hasLoaded = false;
    await load();
  }

  Future<void> updateQuery(String value) async {
    query = value.trim();
    await _reloadOffers();
  }

  Future<void> selectProcedure(String? slug) async {
    selectedProcedureSlug = slug;
    selectedOfferIds.clear();
    await _reloadOffers();
  }

  Future<void> selectCountry(String? countryCode) async {
    selectedCountryCode = countryCode;
    selectedOfferIds.clear();
    await _reloadOffers();
  }

  Future<void> selectSort(String value) async {
    sort = value;
    await _reloadOffers();
  }

  Future<void> updatePatientCountryCode(String? countryCode) async {
    final normalized = countryCode?.trim().toUpperCase();
    if (normalized == null ||
        normalized.isEmpty ||
        normalized == patientCountryCode) {
      return;
    }

    patientCountryCode = normalized;
    await _reloadOffers();
  }

  void toggleOffer(String offerId) {
    if (selectedOfferIds.contains(offerId)) {
      selectedOfferIds.remove(offerId);
      notifyListeners();
      return;
    }

    if (selectedOfferIds.length >= 4) {
      errorMessage = 'Comparison is limited to four offers.';
      notifyListeners();
      return;
    }

    selectedOfferIds.add(offerId);
    errorMessage = null;
    quoteStatusMessage = null;
    notifyListeners();
  }

  void updateAntiBypassTerms(bool value) {
    antiBypassTermsAccepted = value;
    if (value && errorMessage == 'Anti-bypass terms must be accepted.') {
      errorMessage = null;
    }
    notifyListeners();
  }

  void updatePatientMessage(String value) {
    patientMessage = value.trim();
  }

  Future<bool> submitQuoteRequest({String? accessToken}) async {
    if (selectedOfferIds.isEmpty) {
      errorMessage = 'Select at least one clinic before requesting a quote.';
      quoteStatusMessage = null;
      notifyListeners();
      return false;
    }

    if (!antiBypassTermsAccepted) {
      errorMessage = 'Anti-bypass terms must be accepted.';
      quoteStatusMessage = null;
      notifyListeners();
      return false;
    }

    final selectedCount = selectedOfferIds.length;

    if (accessToken == null || accessToken.trim().isEmpty) {
      errorMessage = null;
      quoteStatusMessage =
          'Quote request ready for $selectedCount clinic(s). Sign in is next to submit it securely.';
      notifyListeners();
      return true;
    }

    isSubmittingQuote = true;
    errorMessage = null;
    quoteStatusMessage = null;
    notifyListeners();

    try {
      final response = await _apiClient.createQuoteRequests(
        offerIds: selectedOfferIds.toList(growable: false),
        antiBypassTermsAccepted: antiBypassTermsAccepted,
        patientMessage: patientMessage,
        accessToken: accessToken,
      );
      selectedOfferIds.clear();
      antiBypassTermsAccepted = false;
      patientMessage = '';
      quoteStatusMessage =
          'Quote request submitted to ${response.count} clinic(s).';
      return true;
    } catch (_) {
      errorMessage =
          'Could not submit the quote request. Please check your connection and try again.';
      return false;
    } finally {
      isSubmittingQuote = false;
      notifyListeners();
    }
  }

  Future<void> _reloadOffers() async {
    if (isUsingSampleData) {
      offers = _filteredSampleOffers();
      notifyListeners();
      return;
    }

    isLoading = true;
    errorMessage = null;
    notifyListeners();

    try {
      await _loadOffersFromApi();
    } catch (error) {
      _useSampleData(error);
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<void> _loadOffersFromApi() async {
    final response = await _apiClient.searchOffers(
      procedureSlug: selectedProcedureSlug,
      countryCode: selectedCountryCode,
      patientCountryCode: patientCountryCode,
      q: query,
      sort: sort,
      limit: 20,
    );
    offers = response.offers;
    _dropMissingSelections();
  }

  void _useSampleData(Object _) {
    procedures = sampleProcedures;
    selectedProcedureSlug ??= procedures.first.slug;
    offers = _filteredSampleOffers();
    isUsingSampleData = true;
    errorMessage = 'Live API unavailable. Showing MVP sample data.';
    _dropMissingSelections();
  }

  List<ClinicOffer> _filteredSampleOffers() {
    final normalizedQuery = query.toLowerCase();
    final filtered = sampleOffers.where((offer) {
      final matchesProcedure =
          selectedProcedureSlug == null ||
          offer.procedure.slug == selectedProcedureSlug;
      final matchesCountry =
          selectedCountryCode == null ||
          offer.clinic.countryCode == selectedCountryCode;
      final matchesQuery =
          normalizedQuery.isEmpty ||
          offer.clinic.name.toLowerCase().contains(normalizedQuery) ||
          offer.procedure.name.toLowerCase().contains(normalizedQuery) ||
          offer.procedure.specialty.toLowerCase().contains(normalizedQuery);
      return matchesProcedure && matchesCountry && matchesQuery;
    }).toList();

    filtered.sort((left, right) {
      switch (sort) {
        case 'price_desc':
          return right.price.basePriceCents.compareTo(
            left.price.basePriceCents,
          );
        case 'clinic_name':
          return left.clinic.name.compareTo(right.clinic.name);
        case 'price_asc':
          return left.price.basePriceCents.compareTo(
            right.price.basePriceCents,
          );
        case 'total_asc':
        default:
          return (left.estimate.estimatedTotalCents ?? 0).compareTo(
            right.estimate.estimatedTotalCents ?? 0,
          );
      }
    });

    return filtered;
  }

  void _dropMissingSelections() {
    final visibleIds = offers.map((offer) => offer.id).toSet();
    selectedOfferIds.removeWhere((offerId) => !visibleIds.contains(offerId));
  }
}
