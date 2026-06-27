import 'package:flutter/material.dart';

import '../../../core/api/marketplace_api_client.dart';
import '../../../core/api/marketplace_models.dart';
import '../../../core/config/app_config.dart';
import '../../../features/auth/application/auth_session_controller.dart';
import '../../../features/auth/presentation/auth_sheet.dart';
import '../../../shared/theme/medtour_colors.dart';
import '../../../shared/widgets/metric_tile.dart';
import '../../../shared/widgets/status_chip.dart';
import '../application/marketplace_controller.dart';

class MarketplaceScreen extends StatefulWidget {
  const MarketplaceScreen({
    super.key,
    this.controller,
    this.authSessionController,
  });

  final MarketplaceController? controller;
  final AuthSessionController? authSessionController;

  @override
  State<MarketplaceScreen> createState() => _MarketplaceScreenState();
}

class _MarketplaceScreenState extends State<MarketplaceScreen> {
  late final MarketplaceController _controller;
  late final AuthSessionController _authSessionController;
  late final bool _ownsController;
  late final bool _ownsAuthController;
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _ownsController = widget.controller == null;
    _ownsAuthController = widget.authSessionController == null;
    _controller =
        widget.controller ??
        MarketplaceController(
          apiClient: MarketplaceApiClient(baseUrl: AppConfig.apiBaseUrl),
        );
    _authSessionController =
        widget.authSessionController ?? AuthSessionController();
    _controller.addListener(_onControllerChanged);
    _authSessionController.addListener(_onControllerChanged);

    if (!_controller.hasLoaded) {
      _controller.load();
    }
  }

  @override
  void dispose() {
    _controller.removeListener(_onControllerChanged);
    _authSessionController.removeListener(_onControllerChanged);
    _searchController.dispose();
    if (_ownsController) {
      _controller.dispose();
    }
    if (_ownsAuthController) {
      _authSessionController.dispose();
    }
    super.dispose();
  }

  void _onControllerChanged() {
    if (mounted) {
      setState(() {});
    }
  }

  @override
  Widget build(BuildContext context) {
    final bottomPadding = MediaQuery.paddingOf(context).bottom + 18;

    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _controller.refresh,
          color: MedTourColors.brand600,
          child: CustomScrollView(
            slivers: [
              SliverPadding(
                padding: EdgeInsets.fromLTRB(16, 14, 16, bottomPadding),
                sliver: SliverToBoxAdapter(
                  child: Center(
                    child: ConstrainedBox(
                      constraints: const BoxConstraints(maxWidth: 720),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          _TopBar(
                            authSessionController: _authSessionController,
                          ),
                          const SizedBox(height: 18),
                          _HeroPanel(controller: _controller),
                          const SizedBox(height: 14),
                          _SearchPanel(
                            controller: _controller,
                            textController: _searchController,
                          ),
                          const SizedBox(height: 14),
                          _ProcedureRail(controller: _controller),
                          const SizedBox(height: 14),
                          _TrustStrip(controller: _controller),
                          const SizedBox(height: 14),
                          _OfferResults(controller: _controller),
                          const SizedBox(height: 14),
                          _ComparisonPanel(controller: _controller),
                          const SizedBox(height: 14),
                          _DocumentReadinessPanel(
                            controller: _controller,
                            authSessionController: _authSessionController,
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _TopBar extends StatelessWidget {
  const _TopBar({required this.authSessionController});

  final AuthSessionController authSessionController;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            color: MedTourColors.brand800,
            borderRadius: BorderRadius.circular(8),
          ),
          child: const Icon(
            Icons.health_and_safety_outlined,
            color: MedTourColors.neutral0,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('MedTour AI', style: Theme.of(context).textTheme.titleLarge),
              Text(
                'Verified medical travel options',
                overflow: TextOverflow.ellipsis,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: MedTourColors.neutral500,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
        ),
        if (authSessionController.isAuthenticated)
          PopupMenuButton<String>(
            tooltip: 'Patient account',
            onSelected: (value) {
              if (value == 'sign-out') {
                authSessionController.signOut();
              }
            },
            itemBuilder: (context) => [
              PopupMenuItem(
                enabled: false,
                child: Text(authSessionController.user?.email ?? 'Signed in'),
              ),
              const PopupMenuItem(value: 'sign-out', child: Text('Sign out')),
            ],
            child: CircleAvatar(
              radius: 22,
              backgroundColor: MedTourColors.brand100,
              child: Text(
                _initial(authSessionController.user?.email),
                style: const TextStyle(
                  color: MedTourColors.brand800,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ),
          )
        else
          FilledButton.icon(
            onPressed: () => _showAuthSheet(context),
            icon: const Icon(Icons.login_outlined, size: 18),
            label: const Text('Login'),
          ),
      ],
    );
  }

  String _initial(String? email) {
    final value = email?.trim();
    if (value == null || value.isEmpty) {
      return 'P';
    }
    return value[0].toUpperCase();
  }

  Future<void> _showAuthSheet(BuildContext context) async {
    final signedIn = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      backgroundColor: MedTourColors.neutral0,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(8)),
      ),
      builder: (_) => AuthSheet(controller: authSessionController),
    );

    if (signedIn == true && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Signed in. Quote requests can now be submitted.'),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }
}

class _HeroPanel extends StatelessWidget {
  const _HeroPanel({required this.controller});

  final MarketplaceController controller;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: MedTourColors.brand900,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            StatusChip(
              label: 'Pilot MVP',
              icon: Icons.science_outlined,
              foreground: MedTourColors.warning300,
              background: MedTourColors.brand800,
            ),
            const SizedBox(height: 14),
            Text(
              'Compare verified care',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                color: MedTourColors.neutral0,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Transparent clinic pricing, estimated travel cost, and consent-first document sharing.',
              style: Theme.of(
                context,
              ).textTheme.bodyMedium?.copyWith(color: MedTourColors.brand100),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _HeroMetric(
                    label: 'Offers',
                    value: controller.offers.length.toString(),
                    icon: Icons.fact_check_outlined,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _HeroMetric(
                    label: 'Compare',
                    value: '${controller.selectedOfferIds.length}/4',
                    icon: Icons.compare_arrows_outlined,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _HeroMetric extends StatelessWidget {
  const _HeroMetric({
    required this.label,
    required this.value,
    required this.icon,
  });

  final String label;
  final String value;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: MedTourColors.neutral0.withAlpha(22),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: MedTourColors.neutral0.withAlpha(32)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            Icon(icon, color: MedTourColors.action300, size: 20),
            const SizedBox(width: 8),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.labelSmall?.copyWith(
                      color: MedTourColors.brand100,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  Text(
                    value,
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      color: MedTourColors.neutral0,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SearchPanel extends StatelessWidget {
  const _SearchPanel({required this.controller, required this.textController});

  final MarketplaceController controller;
  final TextEditingController textController;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: MedTourColors.neutral0,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: MedTourColors.neutral200),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Find care', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 12),
            TextField(
              controller: textController,
              textInputAction: TextInputAction.search,
              onSubmitted: controller.updateQuery,
              decoration: InputDecoration(
                hintText: 'Procedure, clinic, specialty',
                prefixIcon: const Icon(Icons.search_outlined),
                suffixIcon: IconButton(
                  tooltip: 'Search',
                  onPressed: () => controller.updateQuery(textController.text),
                  icon: const Icon(Icons.arrow_forward_outlined),
                ),
              ),
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                _CountryChip(
                  label: 'All countries',
                  selected: controller.selectedCountryCode == null,
                  onSelected: () => controller.selectCountry(null),
                ),
                _CountryChip(
                  label: 'Spain',
                  selected: controller.selectedCountryCode == 'ES',
                  onSelected: () => controller.selectCountry('ES'),
                ),
                _CountryChip(
                  label: 'France',
                  selected: controller.selectedCountryCode == 'FR',
                  onSelected: () => controller.selectCountry('FR'),
                ),
                _CountryChip(
                  label: 'Turkey',
                  selected: controller.selectedCountryCode == 'TR',
                  onSelected: () => controller.selectCountry('TR'),
                ),
                _CountryChip(
                  label: 'UK',
                  selected: controller.selectedCountryCode == 'GB',
                  onSelected: () => controller.selectCountry('GB'),
                ),
              ],
            ),
            const SizedBox(height: 12),
            SegmentedButton<String>(
              showSelectedIcon: false,
              segments: const [
                ButtonSegment(
                  value: 'total_asc',
                  label: Text('Total'),
                  icon: Icon(Icons.payments_outlined),
                ),
                ButtonSegment(
                  value: 'price_asc',
                  label: Text('Price'),
                  icon: Icon(Icons.sell_outlined),
                ),
                ButtonSegment(
                  value: 'clinic_name',
                  label: Text('Clinic'),
                  icon: Icon(Icons.business_outlined),
                ),
              ],
              selected: {controller.sort},
              onSelectionChanged: (value) => controller.selectSort(value.first),
            ),
          ],
        ),
      ),
    );
  }
}

class _CountryChip extends StatelessWidget {
  const _CountryChip({
    required this.label,
    required this.selected,
    required this.onSelected,
  });

  final String label;
  final bool selected;
  final VoidCallback onSelected;

  @override
  Widget build(BuildContext context) {
    return ChoiceChip(
      label: Text(label),
      selected: selected,
      onSelected: (_) => onSelected(),
      avatar: Icon(
        selected ? Icons.check_circle : Icons.public_outlined,
        size: 18,
        color: selected ? MedTourColors.brand700 : MedTourColors.neutral500,
      ),
    );
  }
}

class _ProcedureRail extends StatelessWidget {
  const _ProcedureRail({required this.controller});

  final MarketplaceController controller;

  @override
  Widget build(BuildContext context) {
    if (controller.procedures.isEmpty) {
      return const SizedBox.shrink();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                'Procedures',
                style: Theme.of(context).textTheme.titleMedium,
              ),
            ),
            TextButton.icon(
              onPressed: () => controller.selectProcedure(null),
              icon: const Icon(Icons.clear_all_outlined, size: 18),
              label: const Text('All'),
            ),
          ],
        ),
        const SizedBox(height: 8),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              for (final procedure in controller.procedures) ...[
                _ProcedureCard(
                  procedure: procedure,
                  selected: procedure.slug == controller.selectedProcedureSlug,
                  onTap: () => controller.selectProcedure(procedure.slug),
                ),
                const SizedBox(width: 10),
              ],
            ],
          ),
        ),
      ],
    );
  }
}

class _ProcedureCard extends StatelessWidget {
  const _ProcedureCard({
    required this.procedure,
    required this.selected,
    required this.onTap,
  });

  final MarketplaceProcedure procedure;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 196,
      child: Material(
        color: selected ? MedTourColors.brand50 : MedTourColors.neutral0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
          side: BorderSide(
            color: selected ? MedTourColors.brand300 : MedTourColors.neutral200,
          ),
        ),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(8),
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(
                      Icons.medical_services_outlined,
                      color: selected
                          ? MedTourColors.brand700
                          : MedTourColors.action600,
                    ),
                    const Spacer(),
                    Text(
                      '${procedure.verifiedOfferCount}',
                      style: Theme.of(context).textTheme.labelLarge?.copyWith(
                        color: MedTourColors.neutral600,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  procedure.name,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: 3),
                Text(
                  procedure.specialty,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: MedTourColors.neutral500,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _TrustStrip extends StatelessWidget {
  const _TrustStrip({required this.controller});

  final MarketplaceController controller;

  @override
  Widget build(BuildContext context) {
    final isSuccess = controller.quoteStatusMessage != null;
    final isWarning =
        controller.isUsingSampleData || controller.errorMessage != null;
    final message =
        controller.quoteStatusMessage ??
        controller.errorMessage ??
        'Only verified and published clinics are shown.';

    return DecoratedBox(
      decoration: BoxDecoration(
        color: isSuccess
            ? MedTourColors.success50
            : isWarning
            ? MedTourColors.warning50
            : MedTourColors.success50,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: isSuccess
              ? MedTourColors.success100
              : isWarning
              ? MedTourColors.warning100
              : MedTourColors.success100,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(
              isSuccess
                  ? Icons.check_circle_outline
                  : isWarning
                  ? Icons.wifi_off_outlined
                  : Icons.verified_user_outlined,
              color: isSuccess
                  ? MedTourColors.success500
                  : isWarning
                  ? MedTourColors.warning400
                  : MedTourColors.success500,
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                message,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: MedTourColors.neutral800,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _OfferResults extends StatelessWidget {
  const _OfferResults({required this.controller});

  final MarketplaceController controller;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                controller.activeProcedureName,
                style: Theme.of(context).textTheme.titleMedium,
              ),
            ),
            if (controller.isLoading)
              const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(strokeWidth: 2),
              )
            else
              Text(
                '${controller.offers.length} offers',
                style: Theme.of(context).textTheme.labelLarge?.copyWith(
                  color: MedTourColors.neutral500,
                ),
              ),
          ],
        ),
        const SizedBox(height: 10),
        if (controller.offers.isEmpty)
          const _EmptyResults()
        else
          for (final offer in controller.offers) ...[
            _OfferCard(
              offer: offer,
              isSelected: controller.selectedOfferIds.contains(offer.id),
              onToggle: () => controller.toggleOffer(offer.id),
            ),
            const SizedBox(height: 10),
          ],
      ],
    );
  }
}

class _EmptyResults extends StatelessWidget {
  const _EmptyResults();

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: MedTourColors.neutral0,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: MedTourColors.neutral200),
      ),
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Row(
          children: [
            const Icon(
              Icons.search_off_outlined,
              color: MedTourColors.neutral500,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                'No verified offers match these filters yet.',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _OfferCard extends StatelessWidget {
  const _OfferCard({
    required this.offer,
    required this.isSelected,
    required this.onToggle,
  });

  final ClinicOffer offer;
  final bool isSelected;
  final VoidCallback onToggle;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 46,
                  height: 46,
                  decoration: BoxDecoration(
                    color: MedTourColors.action50,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(
                    Icons.local_hospital_outlined,
                    color: MedTourColors.action600,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        offer.clinic.name,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      const SizedBox(height: 4),
                      Wrap(
                        spacing: 8,
                        runSpacing: 6,
                        children: [
                          StatusChip.verified('Verified'),
                          StatusChip.warning(offer.clinic.countryCode),
                        ],
                      ),
                    ],
                  ),
                ),
                IconButton(
                  tooltip: isSelected ? 'Remove from compare' : 'Compare',
                  onPressed: onToggle,
                  icon: Icon(
                    isSelected
                        ? Icons.check_box_outlined
                        : Icons.add_box_outlined,
                    color: isSelected
                        ? MedTourColors.brand700
                        : MedTourColors.neutral500,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            Row(
              children: [
                Expanded(
                  child: MetricTile(
                    label: 'Clinic price',
                    value: formatMoney(
                      offer.price.basePriceCents,
                      offer.price.currencyCode,
                    ),
                    icon: Icons.sell_outlined,
                    accent: MedTourColors.action600,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: MetricTile(
                    label: 'Est. total',
                    value: formatMoney(
                      offer.estimate.estimatedTotalCents,
                      offer.estimate.currencyCode,
                    ),
                    icon: Icons.flight_takeoff_outlined,
                    accent: MedTourColors.warning400,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                const Icon(
                  Icons.event_available_outlined,
                  size: 18,
                  color: MedTourColors.success500,
                ),
                const SizedBox(width: 7),
                Expanded(
                  child: Text(
                    offer.availability,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 7,
              runSpacing: 7,
              children: [
                for (final item in offer.price.includedItems.take(3))
                  _MiniPill(label: item, icon: Icons.check_outlined),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _MiniPill extends StatelessWidget {
  const _MiniPill({required this.label, required this.icon});

  final String label;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: MedTourColors.neutral100,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 14, color: MedTourColors.brand600),
            const SizedBox(width: 5),
            ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 210),
              child: Text(
                label,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  color: MedTourColors.neutral700,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ComparisonPanel extends StatelessWidget {
  const _ComparisonPanel({required this.controller});

  final MarketplaceController controller;

  @override
  Widget build(BuildContext context) {
    final offers = controller.selectedOffers;

    return DecoratedBox(
      decoration: BoxDecoration(
        color: MedTourColors.neutral0,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: MedTourColors.neutral200),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    'Clinic comparison',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                ),
                StatusChip(
                  label: '${offers.length}/4',
                  icon: Icons.compare_arrows_outlined,
                  foreground: MedTourColors.action600,
                  background: MedTourColors.action50,
                ),
              ],
            ),
            const SizedBox(height: 12),
            if (offers.isEmpty)
              Text(
                'Select clinics to compare price, travel estimate, and readiness.',
                style: Theme.of(context).textTheme.bodyMedium,
              )
            else
              Column(
                children: [
                  for (final offer in offers)
                    _ComparisonRow(
                      offer: offer,
                      onRemove: () => controller.toggleOffer(offer.id),
                    ),
                ],
              ),
          ],
        ),
      ),
    );
  }
}

class _ComparisonRow extends StatelessWidget {
  const _ComparisonRow({required this.offer, required this.onRemove});

  final ClinicOffer offer;
  final VoidCallback onRemove;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        children: [
          Expanded(
            flex: 5,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  offer.clinic.name,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context).textTheme.labelLarge,
                ),
                Text(
                  offer.clinic.countryCode,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: MedTourColors.neutral500,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            flex: 4,
            child: Text(
              formatMoney(
                offer.estimate.estimatedTotalCents,
                offer.estimate.currencyCode,
              ),
              textAlign: TextAlign.right,
              style: Theme.of(
                context,
              ).textTheme.labelLarge?.copyWith(color: MedTourColors.brand700),
            ),
          ),
          IconButton(
            tooltip: 'Remove',
            onPressed: onRemove,
            icon: const Icon(Icons.close_outlined),
          ),
        ],
      ),
    );
  }
}

class _DocumentReadinessPanel extends StatelessWidget {
  const _DocumentReadinessPanel({
    required this.controller,
    required this.authSessionController,
  });

  final MarketplaceController controller;
  final AuthSessionController authSessionController;

  @override
  Widget build(BuildContext context) {
    final docs = controller.selectedProcedure?.requiredDocs ?? const <String>[];
    final selectedCount = controller.selectedOfferIds.length;

    return DecoratedBox(
      decoration: BoxDecoration(
        color: MedTourColors.attention50,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: MedTourColors.attention100),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(
                  Icons.folder_shared_outlined,
                  color: MedTourColors.attention500,
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Medical file readiness',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              'Consent is required before any document is shared with a clinic.',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: MedTourColors.neutral800,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                if (docs.isEmpty)
                  const _MiniPill(
                    label: 'Required documents pending',
                    icon: Icons.pending_actions_outlined,
                  )
                else
                  for (final doc in docs)
                    _MiniPill(label: doc, icon: Icons.upload_file_outlined),
              ],
            ),
            const SizedBox(height: 14),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.lock_outline),
                    label: const Text('Consent'),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: selectedCount == 0
                        ? null
                        : () => _showQuoteRequestSheet(context),
                    icon: const Icon(Icons.send_outlined),
                    label: Text(
                      selectedCount == 0 ? 'Quote' : 'Quote ($selectedCount)',
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _showQuoteRequestSheet(BuildContext context) async {
    final submitted = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      backgroundColor: MedTourColors.neutral0,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(8)),
      ),
      builder: (sheetContext) => _QuoteRequestSheet(
        controller: controller,
        authSessionController: authSessionController,
      ),
    );

    if (submitted == true && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            controller.quoteStatusMessage ?? 'Quote request ready.',
          ),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }
}

class _QuoteRequestSheet extends StatefulWidget {
  const _QuoteRequestSheet({
    required this.controller,
    required this.authSessionController,
  });

  final MarketplaceController controller;
  final AuthSessionController authSessionController;

  @override
  State<_QuoteRequestSheet> createState() => _QuoteRequestSheetState();
}

class _QuoteRequestSheetState extends State<_QuoteRequestSheet> {
  late bool _termsAccepted;
  late final TextEditingController _messageController;
  bool _isSubmitting = false;
  String? _sheetError;

  @override
  void initState() {
    super.initState();
    _termsAccepted = widget.controller.antiBypassTermsAccepted;
    _messageController = TextEditingController(
      text: widget.controller.patientMessage,
    );
  }

  @override
  void dispose() {
    _messageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.viewInsetsOf(context).bottom;
    final offers = widget.controller.selectedOffers;
    final isAuthenticated = widget.authSessionController.isAuthenticated;

    return Padding(
      padding: EdgeInsets.fromLTRB(16, 16, 16, bottomInset + 16),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  'Request quote',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
              ),
              IconButton(
                tooltip: 'Close',
                onPressed: () => Navigator.pop(context, false),
                icon: const Icon(Icons.close_outlined),
              ),
            ],
          ),
          const SizedBox(height: 8),
          DecoratedBox(
            decoration: BoxDecoration(
              color: isAuthenticated
                  ? MedTourColors.success50
                  : MedTourColors.action50,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: isAuthenticated
                    ? MedTourColors.success100
                    : MedTourColors.action100,
              ),
            ),
            child: ListTile(
              leading: Icon(
                isAuthenticated
                    ? Icons.verified_user_outlined
                    : Icons.login_outlined,
                color: isAuthenticated
                    ? MedTourColors.success500
                    : MedTourColors.action600,
              ),
              title: Text(
                isAuthenticated
                    ? 'Signed in as ${widget.authSessionController.user?.email ?? 'patient'}'
                    : 'Sign in to submit securely',
              ),
              subtitle: Text(
                isAuthenticated
                    ? 'This request will be submitted to the backend.'
                    : 'You can prepare the request now, then submit after login.',
              ),
              trailing: isAuthenticated
                  ? null
                  : TextButton(
                      onPressed: _showAuthSheet,
                      child: const Text('Login'),
                    ),
            ),
          ),
          const SizedBox(height: 10),
          Text(
            'Selected clinics',
            style: Theme.of(
              context,
            ).textTheme.labelLarge?.copyWith(color: MedTourColors.neutral600),
          ),
          const SizedBox(height: 8),
          ConstrainedBox(
            constraints: const BoxConstraints(maxHeight: 160),
            child: ListView.separated(
              shrinkWrap: true,
              itemCount: offers.length,
              separatorBuilder: (_, _) => const SizedBox(height: 8),
              itemBuilder: (context, index) {
                final offer = offers[index];
                return DecoratedBox(
                  decoration: BoxDecoration(
                    color: MedTourColors.neutral50,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: MedTourColors.neutral200),
                  ),
                  child: ListTile(
                    leading: const Icon(
                      Icons.local_hospital_outlined,
                      color: MedTourColors.action600,
                    ),
                    title: Text(
                      offer.clinic.name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    subtitle: Text(
                      formatMoney(
                        offer.estimate.estimatedTotalCents,
                        offer.estimate.currencyCode,
                      ),
                    ),
                    dense: true,
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 14),
          TextField(
            controller: _messageController,
            minLines: 3,
            maxLines: 5,
            maxLength: 1000,
            decoration: const InputDecoration(
              labelText: 'Message for clinics',
              hintText:
                  'Tell clinics your preferred travel dates or questions.',
              alignLabelWithHint: true,
            ),
          ),
          const SizedBox(height: 8),
          DecoratedBox(
            decoration: BoxDecoration(
              color: MedTourColors.warning50,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: MedTourColors.warning100),
            ),
            child: CheckboxListTile(
              value: _termsAccepted,
              onChanged: (value) {
                setState(() {
                  _termsAccepted = value ?? false;
                });
              },
              controlAffinity: ListTileControlAffinity.leading,
              title: const Text('I accept the anti-bypass terms'),
              subtitle: const Text(
                'Clinic communication and booking must stay inside the platform for patient protection and auditability.',
              ),
            ),
          ),
          if (_sheetError != null) ...[
            const SizedBox(height: 10),
            Text(
              _sheetError!,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: MedTourColors.attention500,
                fontWeight: FontWeight.w800,
              ),
            ),
          ],
          const SizedBox(height: 14),
          ElevatedButton.icon(
            onPressed: _isSubmitting ? null : _submit,
            icon: _isSubmitting
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(Icons.send_outlined),
            label: Text(
              _isSubmitting
                  ? 'Submitting...'
                  : isAuthenticated
                  ? 'Submit quote request'
                  : 'Prepare quote request',
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _submit() async {
    setState(() {
      _isSubmitting = true;
      _sheetError = null;
    });
    widget.controller.updateAntiBypassTerms(_termsAccepted);
    widget.controller.updatePatientMessage(_messageController.text);
    final success = await widget.controller.submitQuoteRequest(
      accessToken: widget.authSessionController.accessToken,
    );

    if (!mounted) {
      return;
    }

    setState(() {
      _isSubmitting = false;
      _sheetError = widget.controller.errorMessage;
    });

    if (success) {
      Navigator.pop(context, true);
    }
  }

  Future<void> _showAuthSheet() async {
    final signedIn = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      backgroundColor: MedTourColors.neutral0,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(8)),
      ),
      builder: (_) => AuthSheet(controller: widget.authSessionController),
    );

    if (signedIn == true && mounted) {
      setState(() {});
    }
  }
}
