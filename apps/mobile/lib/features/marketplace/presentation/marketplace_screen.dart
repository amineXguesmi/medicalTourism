import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../../../core/api/marketplace_api_client.dart';
import '../../../core/api/marketplace_models.dart';
import '../../../core/config/app_config.dart';
import '../../../features/auth/application/auth_session_controller.dart';
import '../../../features/auth/presentation/auth_sheet.dart';
import '../../../shared/theme/medtour_colors.dart';
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
    final bottomPadding = MediaQuery.paddingOf(context).bottom + 24;

    return Scaffold(
      body: Stack(
        children: [
          const _ScreenBackdrop(),
          SafeArea(
            child: RefreshIndicator(
              onRefresh: _controller.refresh,
              color: MedTourColors.brand600,
              child: CustomScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                slivers: [
                  SliverPadding(
                    padding: EdgeInsets.fromLTRB(16, 16, 16, bottomPadding),
                    sliver: SliverToBoxAdapter(
                      child: Center(
                        child: ConstrainedBox(
                          constraints: const BoxConstraints(maxWidth: 760),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              _TopBar(
                                authSessionController: _authSessionController,
                              ),
                              const SizedBox(height: 18),
                              _HeroPanel(controller: _controller),
                              const SizedBox(height: 16),
                              _SearchPanel(
                                controller: _controller,
                                textController: _searchController,
                              ),
                              const SizedBox(height: 16),
                              _ProcedureRail(controller: _controller),
                              const SizedBox(height: 16),
                              _TrustStrip(controller: _controller),
                              const SizedBox(height: 18),
                              _OfferResults(
                                controller: _controller,
                                authSessionController: _authSessionController,
                              ),
                              const SizedBox(height: 16),
                              _ComparisonPanel(controller: _controller),
                              const SizedBox(height: 16),
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
        ],
      ),
    );
  }
}

class _ScreenBackdrop extends StatelessWidget {
  const _ScreenBackdrop();

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          height: 240,
          decoration: const BoxDecoration(
            color: MedTourColors.brand50,
            border: Border(
              bottom: BorderSide(color: MedTourColors.brand100),
            ),
          ),
        ),
        Expanded(
          child: Container(color: MedTourColors.neutral50),
        ),
      ],
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
        DecoratedBox(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(8),
            boxShadow: [
              BoxShadow(
                color: MedTourColors.brand800.withAlpha(28),
                blurRadius: 18,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: Image.asset(
              'assets/images/medtour_logo.png',
              width: 48,
              height: 48,
              fit: BoxFit.cover,
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('MedTour AI', style: Theme.of(context).textTheme.titleLarge),
              Text(
                'Care search, quotes and consent',
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
            label: const Text('Patient'),
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
    final lowestEstimate = _lowestEstimate(controller.offers);

    return DecoratedBox(
      decoration: BoxDecoration(
        color: MedTourColors.brand900,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: MedTourColors.brand700),
        boxShadow: [
          BoxShadow(
            color: MedTourColors.brand900.withAlpha(42),
            blurRadius: 28,
            offset: const Offset(0, 14),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                StatusChip(
                  label: 'Verified network',
                  icon: Icons.verified_user_outlined,
                  foreground: MedTourColors.success300,
                  background: MedTourColors.brand800,
                ),
                const Spacer(),
                Icon(
                  controller.isLoading
                      ? Icons.sync_outlined
                      : Icons.travel_explore_outlined,
                  color: MedTourColors.action300,
                ),
              ],
            ),
            const SizedBox(height: 14),
            Text(
              'Compare care with the full trip in view',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                color: MedTourColors.neutral0,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Clinic price, travel assumptions, required documents and consent stay visible before you request a quote.',
              style: Theme.of(
                context,
              ).textTheme.bodyMedium?.copyWith(color: MedTourColors.brand100),
            ),
            const SizedBox(height: 18),
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
                    label: 'Best total',
                    value: lowestEstimate == null
                        ? 'Pending'
                        : formatMoney(lowestEstimate, 'EUR'),
                    icon: Icons.payments_outlined,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            DecoratedBox(
              decoration: BoxDecoration(
                color: MedTourColors.neutral0.withAlpha(18),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: MedTourColors.neutral0.withAlpha(32)),
              ),
              child: const Padding(
                padding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                child: Row(
                  children: [
                    Expanded(
                      child: _JourneyStep(
                        label: 'Search',
                        icon: Icons.search_outlined,
                        isActive: true,
                      ),
                    ),
                    _JourneyDivider(),
                    Expanded(
                      child: _JourneyStep(
                        label: 'Compare',
                        icon: Icons.compare_arrows_outlined,
                        isActive: true,
                      ),
                    ),
                    _JourneyDivider(),
                    Expanded(
                      child: _JourneyStep(
                        label: 'Quote',
                        icon: Icons.send_outlined,
                        isActive: false,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  int? _lowestEstimate(List<ClinicOffer> offers) {
    int? lowest;
    for (final offer in offers) {
      final value = offer.estimate.estimatedTotalCents;
      if (value == null) {
        continue;
      }
      if (lowest == null || value < lowest) {
        lowest = value;
      }
    }
    return lowest;
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

class _JourneyStep extends StatelessWidget {
  const _JourneyStep({
    required this.label,
    required this.icon,
    required this.isActive,
  });

  final String label;
  final IconData icon;
  final bool isActive;

  @override
  Widget build(BuildContext context) {
    final color = isActive ? MedTourColors.action300 : MedTourColors.brand200;

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, color: color, size: 18),
        const SizedBox(height: 4),
        Text(
          label,
          overflow: TextOverflow.ellipsis,
          style: Theme.of(context).textTheme.labelSmall?.copyWith(
            color: color,
            fontWeight: FontWeight.w900,
          ),
        ),
      ],
    );
  }
}

class _JourneyDivider extends StatelessWidget {
  const _JourneyDivider();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 28,
      height: 1,
      color: MedTourColors.brand300.withAlpha(90),
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
        boxShadow: [
          BoxShadow(
            color: MedTourColors.neutral900.withAlpha(10),
            blurRadius: 18,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: MedTourColors.action50,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: MedTourColors.action100),
                  ),
                  child: const Icon(
                    Icons.tune_outlined,
                    color: MedTourColors.action600,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Find the right clinic',
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Search by treatment, clinic, specialty or country.',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: MedTourColors.neutral500,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
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
                  icon: const Icon(Icons.arrow_circle_right_outlined),
                ),
              ),
            ),
            const SizedBox(height: 14),
            _FilterCaption(
              label: 'Destination',
              icon: Icons.public_outlined,
            ),
            const SizedBox(height: 8),
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
                  label: 'Spain ES',
                  selected: controller.selectedCountryCode == 'ES',
                  onSelected: () => controller.selectCountry('ES'),
                ),
                _CountryChip(
                  label: 'France FR',
                  selected: controller.selectedCountryCode == 'FR',
                  onSelected: () => controller.selectCountry('FR'),
                ),
                _CountryChip(
                  label: 'Turkey TR',
                  selected: controller.selectedCountryCode == 'TR',
                  onSelected: () => controller.selectCountry('TR'),
                ),
                _CountryChip(
                  label: 'United Kingdom GB',
                  selected: controller.selectedCountryCode == 'GB',
                  onSelected: () => controller.selectCountry('GB'),
                ),
              ],
            ),
            const SizedBox(height: 14),
            _FilterCaption(
              label: 'Sort results',
              icon: Icons.sort_outlined,
            ),
            const SizedBox(height: 8),
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

class _FilterCaption extends StatelessWidget {
  const _FilterCaption({required this.label, required this.icon});

  final String label;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 16, color: MedTourColors.neutral500),
        const SizedBox(width: 6),
        Text(
          label,
          style: Theme.of(context).textTheme.labelMedium?.copyWith(
            color: MedTourColors.neutral600,
            fontWeight: FontWeight.w900,
          ),
        ),
      ],
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
              child: _SectionTitle(
                title: 'Procedure focus',
                subtitle: 'Pick one to see matching verified offers.',
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
    final accent = _accentForProcedure(procedure.specialty);

    return SizedBox(
      width: 210,
      child: Material(
        color: selected ? MedTourColors.brand50 : MedTourColors.neutral0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
          side: BorderSide(
            color: selected ? accent : MedTourColors.neutral200,
            width: selected ? 1.5 : 1,
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
                    Container(
                      width: 38,
                      height: 38,
                      decoration: BoxDecoration(
                        color: accent.withAlpha(24),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(
                        _procedureIcon(procedure.specialty),
                        color: accent,
                        size: 21,
                      ),
                    ),
                    const Spacer(),
                    DecoratedBox(
                      decoration: BoxDecoration(
                        color: MedTourColors.neutral100,
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 9,
                          vertical: 5,
                        ),
                        child: Text(
                          '${procedure.verifiedOfferCount} offers',
                          style: Theme.of(context)
                              .textTheme
                              .labelSmall
                              ?.copyWith(
                                color: MedTourColors.neutral600,
                                fontWeight: FontWeight.w900,
                              ),
                        ),
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
                const SizedBox(height: 8),
                Text(
                  procedure.requiredDocs.isEmpty
                      ? 'Document checklist pending'
                      : '${procedure.requiredDocs.length} docs needed',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context).textTheme.labelSmall?.copyWith(
                    color: MedTourColors.neutral500,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Color _accentForProcedure(String specialty) {
    final value = specialty.toLowerCase();
    if (value.contains('dental')) {
      return MedTourColors.action600;
    }
    if (value.contains('dermat')) {
      return MedTourColors.attention300;
    }
    if (value.contains('ophthalm')) {
      return MedTourColors.brand600;
    }
    return MedTourColors.warning400;
  }

  IconData _procedureIcon(String specialty) {
    final value = specialty.toLowerCase();
    if (value.contains('dental')) {
      return Icons.medical_services_outlined;
    }
    if (value.contains('dermat')) {
      return Icons.spa_outlined;
    }
    if (value.contains('ophthalm')) {
      return Icons.visibility_outlined;
    }
    return Icons.local_hospital_outlined;
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle({required this.title, required this.subtitle});

  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 2),
        Text(
          subtitle,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
            color: MedTourColors.neutral500,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
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
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
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
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            const Row(
              children: [
                Expanded(
                  child: _GuardrailItem(
                    label: 'Verified clinics',
                    icon: Icons.verified_outlined,
                    color: MedTourColors.success500,
                  ),
                ),
                SizedBox(width: 8),
                Expanded(
                  child: _GuardrailItem(
                    label: 'Consent first',
                    icon: Icons.lock_outline,
                    color: MedTourColors.attention500,
                  ),
                ),
                SizedBox(width: 8),
                Expanded(
                  child: _GuardrailItem(
                    label: 'Cost estimate',
                    icon: Icons.receipt_long_outlined,
                    color: MedTourColors.action600,
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

class _GuardrailItem extends StatelessWidget {
  const _GuardrailItem({
    required this.label,
    required this.icon,
    required this.color,
  });

  final String label;
  final IconData icon;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: MedTourColors.neutral0.withAlpha(135),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: MedTourColors.neutral200.withAlpha(160)),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 9),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 17, color: color),
            const SizedBox(height: 4),
            Text(
              label,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.labelSmall?.copyWith(
                color: MedTourColors.neutral700,
                fontWeight: FontWeight.w900,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _OfferResults extends StatelessWidget {
  const _OfferResults({
    required this.controller,
    required this.authSessionController,
  });

  final MarketplaceController controller;
  final AuthSessionController authSessionController;

  @override
  Widget build(BuildContext context) {
    final patientProfile = authSessionController.user?.patientProfile;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Expanded(
              child: _SectionTitle(
                title: 'Recommended clinics',
                subtitle: controller.activeProcedureName,
              ),
            ),
            if (controller.isLoading)
              const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(strokeWidth: 2),
              )
            else
              StatusChip(
                label: '${controller.offers.length} offers',
                icon: Icons.local_hospital_outlined,
                foreground: MedTourColors.brand700,
                background: MedTourColors.brand50,
              ),
          ],
        ),
        const SizedBox(height: 10),
        if (controller.selectedOfferIds.isNotEmpty) ...[
          DecoratedBox(
            decoration: BoxDecoration(
              color: MedTourColors.action50,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: MedTourColors.action100),
            ),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              child: Row(
                children: [
                  const Icon(
                    Icons.checklist_rtl_outlined,
                    color: MedTourColors.action600,
                    size: 20,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      '${controller.selectedOfferIds.length} selected for comparison and quote readiness.',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: MedTourColors.neutral800,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 10),
        ],
        if (controller.offers.isEmpty)
          const _EmptyResults()
        else
          for (var index = 0; index < controller.offers.length; index++) ...[
            _OfferCard(
              offer: controller.offers[index],
              rank: index + 1,
              patientProfile: patientProfile,
              isSelected: controller.selectedOfferIds.contains(
                controller.offers[index].id,
              ),
              onToggle: () => controller.toggleOffer(controller.offers[index].id),
            ),
            const SizedBox(height: 12),
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
        child: Column(
          children: [
            Container(
              width: 52,
              height: 52,
              decoration: BoxDecoration(
                color: MedTourColors.neutral100,
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(
                Icons.search_off_outlined,
                color: MedTourColors.neutral500,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              'No verified offers match these filters yet.',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 6),
            Text(
              'Try a different destination or clear the procedure filter.',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium,
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
    required this.rank,
    required this.patientProfile,
    required this.isSelected,
    required this.onToggle,
  });

  final ClinicOffer offer;
  final int rank;
  final PatientProfileSnapshot? patientProfile;
  final bool isSelected;
  final VoidCallback onToggle;

  @override
  Widget build(BuildContext context) {
    final total = formatMoney(
      offer.estimate.estimatedTotalCents,
      offer.estimate.currencyCode,
    );
    final clinicPrice = formatMoney(
      offer.price.basePriceCents,
      offer.price.currencyCode,
    );
    final distanceEstimate = _DistanceEstimate.fromProfile(
      offer: offer,
      profile: patientProfile,
    );

    return Card(
      color: isSelected ? MedTourColors.brand50 : MedTourColors.neutral0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
        side: BorderSide(
          color: isSelected ? MedTourColors.brand400 : MedTourColors.neutral200,
          width: isSelected ? 1.5 : 1,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _ClinicBadge(countryCode: offer.clinic.countryCode, rank: rank),
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
                          StatusChip(
                            label: offer.procedure.specialty,
                            icon: Icons.medical_information_outlined,
                            foreground: MedTourColors.action600,
                            background: MedTourColors.action50,
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 6),
                IconButton.filledTonal(
                  tooltip: isSelected ? 'Selected' : 'Compare',
                  onPressed: onToggle,
                  icon: Icon(
                    isSelected
                        ? Icons.check_circle_outline
                        : Icons.add_circle_outline,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            _DistanceBanner(estimate: distanceEstimate),
            const SizedBox(height: 12),
            DecoratedBox(
              decoration: BoxDecoration(
                color: isSelected
                    ? MedTourColors.neutral0
                    : MedTourColors.neutral50,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: MedTourColors.neutral200),
              ),
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Estimated total',
                            style: Theme.of(context)
                                .textTheme
                                .labelMedium
                                ?.copyWith(
                                  color: MedTourColors.neutral500,
                                  fontWeight: FontWeight.w900,
                                ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            total,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: Theme.of(context)
                                .textTheme
                                .titleLarge
                                ?.copyWith(
                                  color: MedTourColors.brand800,
                                  fontWeight: FontWeight.w900,
                                ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'Clinic package $clinicPrice',
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
                    const SizedBox(width: 10),
                    Container(
                      width: 42,
                      height: 42,
                      decoration: BoxDecoration(
                        color: MedTourColors.warning50,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: MedTourColors.warning100),
                      ),
                      child: const Icon(
                        Icons.flight_takeoff_outlined,
                        color: MedTourColors.warning400,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),
            _CostBreakdown(offer: offer),
            const SizedBox(height: 12),
            DecoratedBox(
              decoration: BoxDecoration(
                color: MedTourColors.success50,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: MedTourColors.success100),
              ),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 9),
                child: Row(
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
                              color: MedTourColors.neutral800,
                              fontWeight: FontWeight.w800,
                            ),
                      ),
                    ),
                  ],
                ),
              ),
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

class _ClinicBadge extends StatelessWidget {
  const _ClinicBadge({required this.countryCode, required this.rank});

  final String countryCode;
  final int rank;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 50,
      height: 58,
      decoration: BoxDecoration(
        color: MedTourColors.brand800,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            '#$rank',
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  color: MedTourColors.brand100,
                  fontWeight: FontWeight.w900,
                ),
          ),
          const SizedBox(height: 3),
          Text(
            countryCode,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  color: MedTourColors.neutral0,
                  fontWeight: FontWeight.w900,
                ),
          ),
        ],
      ),
    );
  }
}

class _DistanceBanner extends StatelessWidget {
  const _DistanceBanner({required this.estimate});

  final _DistanceEstimate estimate;

  @override
  Widget build(BuildContext context) {
    final color = estimate.isOverPreference
        ? MedTourColors.attention500
        : estimate.distanceKm == null
        ? MedTourColors.warning400
        : MedTourColors.action600;

    return DecoratedBox(
      decoration: BoxDecoration(
        color: color.withAlpha(18),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withAlpha(68)),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
        child: Row(
          children: [
            Icon(Icons.route_outlined, size: 20, color: color),
            const SizedBox(width: 9),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    estimate.title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.labelLarge?.copyWith(
                      color: MedTourColors.neutral800,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    estimate.detail,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: MedTourColors.neutral600,
                      fontWeight: FontWeight.w700,
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

class _DistanceEstimate {
  const _DistanceEstimate({
    required this.title,
    required this.detail,
    required this.distanceKm,
    required this.isOverPreference,
  });

  final String title;
  final String detail;
  final int? distanceKm;
  final bool isOverPreference;

  factory _DistanceEstimate.fromProfile({
    required ClinicOffer offer,
    required PatientProfileSnapshot? profile,
  }) {
    final countryCode = profile?.countryCode?.trim().toUpperCase();
    final city = profile?.residenceCity?.trim();
    if (countryCode == null || countryCode.isEmpty) {
      return const _DistanceEstimate(
        title: 'Distance pending',
        detail: 'Add your home city in Profile to estimate km to this clinic.',
        distanceKm: null,
        isOverPreference: false,
      );
    }

    final from = _coordinateFor(city: city, countryCode: countryCode);
    final to = _clinicCoordinateFor(offer.clinic.countryCode);
    if (from == null || to == null) {
      return _DistanceEstimate(
        title: 'Distance estimate pending',
        detail: '$countryCode to ${offer.clinic.countryCode} needs map data.',
        distanceKm: null,
        isOverPreference: false,
      );
    }

    final distanceKm = _haversineKm(from, to).round();
    final maxKm = profile?.travelRadiusKm;
    final isOverPreference = maxKm != null && distanceKm > maxKm;
    final homeLabel = city == null || city.isEmpty ? countryCode : '$city, $countryCode';

    return _DistanceEstimate(
      title: '$distanceKm km from home',
      detail: maxKm == null
          ? '$homeLabel to clinic destination ${offer.clinic.countryCode}.'
          : isOverPreference
          ? 'Above your max clinic distance of $maxKm km.'
          : 'Within your max clinic distance of $maxKm km.',
      distanceKm: distanceKm,
      isOverPreference: isOverPreference,
    );
  }
}

class _GeoPoint {
  const _GeoPoint(this.latitude, this.longitude);

  final double latitude;
  final double longitude;
}

_GeoPoint? _coordinateFor({String? city, required String countryCode}) {
  final cityKey = '${city?.trim().toLowerCase()}-$countryCode';
  const cityCoordinates = {
    'paris-FR': _GeoPoint(48.8566, 2.3522),
    'london-GB': _GeoPoint(51.5072, -0.1276),
    'barcelona-ES': _GeoPoint(41.3874, 2.1686),
    'madrid-ES': _GeoPoint(40.4168, -3.7038),
    'istanbul-TR': _GeoPoint(41.0082, 28.9784),
    'ankara-TR': _GeoPoint(39.9334, 32.8597),
    'algiers-DZ': _GeoPoint(36.7538, 3.0588),
    'casablanca-MA': _GeoPoint(33.5731, -7.5898),
    'tunis-TN': _GeoPoint(36.8065, 10.1815),
    'lagos-NG': _GeoPoint(6.5244, 3.3792),
  };

  return cityCoordinates[cityKey] ?? _countryCoordinateFor(countryCode);
}

_GeoPoint? _clinicCoordinateFor(String countryCode) {
  const clinicDestinations = {
    'ES': _GeoPoint(41.3874, 2.1686),
    'FR': _GeoPoint(48.8566, 2.3522),
    'TR': _GeoPoint(41.0082, 28.9784),
    'GB': _GeoPoint(51.5072, -0.1276),
  };

  return clinicDestinations[countryCode.trim().toUpperCase()] ??
      _countryCoordinateFor(countryCode);
}

_GeoPoint? _countryCoordinateFor(String countryCode) {
  const countryCoordinates = {
    'FR': _GeoPoint(48.8566, 2.3522),
    'ES': _GeoPoint(40.4168, -3.7038),
    'TR': _GeoPoint(39.9334, 32.8597),
    'GB': _GeoPoint(51.5072, -0.1276),
    'DZ': _GeoPoint(36.7538, 3.0588),
    'MA': _GeoPoint(33.5731, -7.5898),
    'TN': _GeoPoint(36.8065, 10.1815),
    'NG': _GeoPoint(6.5244, 3.3792),
    'US': _GeoPoint(40.7128, -74.0060),
  };

  return countryCoordinates[countryCode.trim().toUpperCase()];
}

double _haversineKm(_GeoPoint from, _GeoPoint to) {
  const earthRadiusKm = 6371.0;
  final dLat = _degreesToRadians(to.latitude - from.latitude);
  final dLon = _degreesToRadians(to.longitude - from.longitude);
  final fromLat = _degreesToRadians(from.latitude);
  final toLat = _degreesToRadians(to.latitude);
  final a =
      math.sin(dLat / 2) * math.sin(dLat / 2) +
      math.cos(fromLat) *
          math.cos(toLat) *
          math.sin(dLon / 2) *
          math.sin(dLon / 2);
  final c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a));
  return earthRadiusKm * c;
}

double _degreesToRadians(double degrees) {
  return degrees * math.pi / 180;
}

class _CostBreakdown extends StatelessWidget {
  const _CostBreakdown({required this.offer});

  final ClinicOffer offer;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: _CostItem(
            label: 'Flight',
            value: formatMoney(
              offer.estimate.estimatedFlightCents,
              offer.estimate.currencyCode,
            ),
            icon: Icons.flight_outlined,
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _CostItem(
            label: 'Hotel',
            value: formatMoney(
              offer.estimate.estimatedHotelCents,
              offer.estimate.currencyCode,
            ),
            icon: Icons.hotel_outlined,
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _CostItem(
            label: 'Transfer',
            value: formatMoney(
              offer.estimate.estimatedTransferCents,
              offer.estimate.currencyCode,
            ),
            icon: Icons.local_taxi_outlined,
          ),
        ),
      ],
    );
  }
}

class _CostItem extends StatelessWidget {
  const _CostItem({
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
        color: MedTourColors.neutral100,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 9),
        child: Column(
          children: [
            Icon(icon, size: 17, color: MedTourColors.neutral600),
            const SizedBox(height: 4),
            Text(
              label,
              overflow: TextOverflow.ellipsis,
              style: Theme.of(context).textTheme.labelSmall?.copyWith(
                    color: MedTourColors.neutral500,
                    fontWeight: FontWeight.w800,
                  ),
            ),
            Text(
              value,
              overflow: TextOverflow.ellipsis,
              style: Theme.of(context).textTheme.labelSmall?.copyWith(
                    color: MedTourColors.neutral800,
                    fontWeight: FontWeight.w900,
                  ),
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
        boxShadow: [
          BoxShadow(
            color: MedTourColors.neutral900.withAlpha(9),
            blurRadius: 16,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
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
              DecoratedBox(
                decoration: BoxDecoration(
                  color: MedTourColors.neutral50,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: MedTourColors.neutral200),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Row(
                    children: [
                      const Icon(
                        Icons.add_task_outlined,
                        color: MedTourColors.action600,
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          'Select clinic cards to compare total estimate and quote readiness.',
                          style: Theme.of(context).textTheme.bodyMedium,
                        ),
                      ),
                    ],
                  ),
                ),
              )
            else
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    for (final offer in offers) ...[
                      _ComparisonTile(
                        offer: offer,
                        onRemove: () => controller.toggleOffer(offer.id),
                      ),
                      const SizedBox(width: 10),
                    ],
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _ComparisonTile extends StatelessWidget {
  const _ComparisonTile({required this.offer, required this.onRemove});

  final ClinicOffer offer;
  final VoidCallback onRemove;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 210,
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: MedTourColors.brand50,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: MedTourColors.brand100),
        ),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      offer.clinic.name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: Theme.of(context).textTheme.labelLarge,
                    ),
                  ),
                  IconButton(
                    tooltip: 'Remove',
                    onPressed: onRemove,
                    constraints: const BoxConstraints(
                      minWidth: 32,
                      minHeight: 32,
                    ),
                    padding: EdgeInsets.zero,
                    icon: const Icon(Icons.close_outlined, size: 18),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              StatusChip.warning(offer.clinic.countryCode),
              const SizedBox(height: 10),
              Text(
                formatMoney(
                  offer.estimate.estimatedTotalCents,
                  offer.estimate.currencyCode,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      color: MedTourColors.brand800,
                      fontWeight: FontWeight.w900,
                    ),
              ),
              const SizedBox(height: 2),
              Text(
                offer.availability,
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
    final isSignedIn = authSessionController.isAuthenticated;

    return DecoratedBox(
      decoration: BoxDecoration(
        color: MedTourColors.neutral0,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: MedTourColors.neutral200),
        boxShadow: [
          BoxShadow(
            color: MedTourColors.neutral900.withAlpha(10),
            blurRadius: 18,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 42,
                  height: 42,
                  decoration: BoxDecoration(
                    color: MedTourColors.attention50,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: MedTourColors.attention100),
                  ),
                  child: const Icon(
                    Icons.folder_shared_outlined,
                    color: MedTourColors.attention500,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Quote readiness',
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Prepare consent and documents before clinic sharing.',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: MedTourColors.neutral500,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            Row(
              children: [
                Expanded(
                  child: _ReadinessStep(
                    label: 'Clinics',
                    value: selectedCount == 0 ? 'None' : '$selectedCount chosen',
                    icon: Icons.local_hospital_outlined,
                    color: selectedCount == 0
                        ? MedTourColors.neutral500
                        : MedTourColors.action600,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _ReadinessStep(
                    label: 'Account',
                    value: isSignedIn ? 'Signed in' : 'Needed',
                    icon: isSignedIn
                        ? Icons.verified_user_outlined
                        : Icons.login_outlined,
                    color: isSignedIn
                        ? MedTourColors.success500
                        : MedTourColors.warning400,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _ReadinessStep(
                    label: 'Consent',
                    value: 'Required',
                    icon: Icons.lock_outline,
                    color: MedTourColors.attention500,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            Text(
              'Required documents',
              style: Theme.of(context).textTheme.labelLarge?.copyWith(
                    color: MedTourColors.neutral700,
                  ),
            ),
            const SizedBox(height: 8),
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
                    onPressed: () => _showConsentNotice(context),
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

  void _showConsentNotice(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Consent capture will be connected to document sharing.'),
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

class _ReadinessStep extends StatelessWidget {
  const _ReadinessStep({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });

  final String label;
  final String value;
  final IconData icon;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: color.withAlpha(20),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withAlpha(58)),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
        child: Column(
          children: [
            Icon(icon, color: color, size: 18),
            const SizedBox(height: 5),
            Text(
              label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: Theme.of(context).textTheme.labelSmall?.copyWith(
                    color: MedTourColors.neutral500,
                    fontWeight: FontWeight.w800,
                  ),
            ),
            Text(
              value,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: Theme.of(context).textTheme.labelSmall?.copyWith(
                    color: MedTourColors.neutral800,
                    fontWeight: FontWeight.w900,
                  ),
            ),
          ],
        ),
      ),
    );
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
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
          Center(
            child: Container(
              width: 42,
              height: 4,
              decoration: BoxDecoration(
                color: MedTourColors.neutral200,
                borderRadius: BorderRadius.circular(999),
              ),
            ),
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  color: MedTourColors.brand50,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: MedTourColors.brand100),
                ),
                child: const Icon(
                  Icons.request_quote_outlined,
                  color: MedTourColors.brand700,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Request quote',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${offers.length} clinic(s) selected',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: MedTourColors.neutral500,
                            fontWeight: FontWeight.w700,
                          ),
                    ),
                  ],
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
