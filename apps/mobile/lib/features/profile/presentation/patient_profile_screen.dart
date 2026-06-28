import 'package:flutter/material.dart';

import '../../../core/api/marketplace_models.dart';
import '../../../shared/theme/medtour_colors.dart';
import '../../auth/application/auth_session_controller.dart';

class PatientProfileScreen extends StatefulWidget {
  const PatientProfileScreen({super.key, required this.authSessionController});

  final AuthSessionController authSessionController;

  @override
  State<PatientProfileScreen> createState() => _PatientProfileScreenState();
}

class _PatientProfileScreenState extends State<PatientProfileScreen> {
  final _fullNameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _countryController = TextEditingController();
  final _cityController = TextEditingController();
  final _languageController = TextEditingController();
  final _currencyController = TextEditingController();
  final _travelRadiusController = TextEditingController();
  final _medicalSummaryController = TextEditingController();
  String _biologicalSex = 'UNKNOWN';
  String? _boundUserId;

  @override
  void initState() {
    super.initState();
    widget.authSessionController.addListener(_syncFromSession);
    _syncFromSession();
  }

  @override
  void dispose() {
    widget.authSessionController.removeListener(_syncFromSession);
    _fullNameController.dispose();
    _phoneController.dispose();
    _countryController.dispose();
    _cityController.dispose();
    _languageController.dispose();
    _currencyController.dispose();
    _travelRadiusController.dispose();
    _medicalSummaryController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: widget.authSessionController,
      builder: (context, _) {
        final user = widget.authSessionController.user;
        final profile = user?.patientProfile;

        return Scaffold(
          body: SafeArea(
            child: ListView(
              padding: const EdgeInsets.fromLTRB(16, 18, 16, 28),
              children: [
                _ProfileHeader(user: user, profile: profile),
                const SizedBox(height: 16),
                if (!widget.authSessionController.isAuthenticated)
                  const _ProfileNotice()
                else ...[
                  _ProfileForm(
                    fullNameController: _fullNameController,
                    phoneController: _phoneController,
                    countryController: _countryController,
                    cityController: _cityController,
                    languageController: _languageController,
                    currencyController: _currencyController,
                    travelRadiusController: _travelRadiusController,
                    medicalSummaryController: _medicalSummaryController,
                    biologicalSex: _biologicalSex,
                    onBiologicalSexChanged: (value) {
                      setState(() {
                        _biologicalSex = value;
                      });
                    },
                    isSaving: widget.authSessionController.isLoading,
                    onSave: _saveProfile,
                  ),
                  const SizedBox(height: 14),
                  _AccountSection(
                    onOpenInfo: _showInfo,
                    onSignOut: widget.authSessionController.signOut,
                  ),
                ],
              ],
            ),
          ),
        );
      },
    );
  }

  void _syncFromSession() {
    final user = widget.authSessionController.user;
    if (user == null) {
      if (_boundUserId == null) {
        return;
      }
      _boundUserId = null;
      _fullNameController.clear();
      _phoneController.clear();
      _countryController.clear();
      _cityController.clear();
      _languageController.text = 'en';
      _currencyController.text = 'EUR';
      _travelRadiusController.clear();
      _medicalSummaryController.clear();
      _biologicalSex = 'UNKNOWN';
      if (mounted) {
        setState(() {});
      }
      return;
    }

    if (user.id == _boundUserId) {
      return;
    }

    _boundUserId = user.id;
    final profile = user.patientProfile;
    _fullNameController.text = profile?.fullName ?? '';
    _phoneController.text = user.phone ?? '';
    _countryController.text = profile?.countryCode ?? '';
    _cityController.text = profile?.residenceCity ?? '';
    _languageController.text = profile?.languageCode ?? 'en';
    _currencyController.text = profile?.currencyCode ?? 'EUR';
    _travelRadiusController.text = profile?.travelRadiusKm?.toString() ?? '';
    _medicalSummaryController.text = profile?.medicalSummary ?? '';
    _biologicalSex = profile?.biologicalSex ?? 'UNKNOWN';
    if (mounted) {
      setState(() {});
    }
  }

  Future<void> _saveProfile() async {
    final success = await widget.authSessionController.updateProfile(
      fullName: _fullNameController.text,
      phone: _phoneController.text,
      countryCode: _countryController.text,
      residenceCity: _cityController.text,
      languageCode: _languageController.text,
      currencyCode: _currencyController.text,
      biologicalSex: _biologicalSex,
      travelRadiusKm: int.tryParse(_travelRadiusController.text),
      medicalSummary: _medicalSummaryController.text,
    );

    if (!mounted) {
      return;
    }

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(success ? 'Profile saved.' : 'Could not save profile.'),
      ),
    );
  }

  void _showInfo(String title, String body) {
    showModalBottomSheet<void>(
      context: context,
      useSafeArea: true,
      backgroundColor: MedTourColors.neutral0,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(8)),
      ),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.all(18),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: 8),
              Text(body, style: Theme.of(context).textTheme.bodyMedium),
              const SizedBox(height: 14),
              Align(
                alignment: Alignment.centerRight,
                child: TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Close'),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _ProfileHeader extends StatelessWidget {
  const _ProfileHeader({required this.user, required this.profile});

  final AuthUser? user;
  final PatientProfileSnapshot? profile;

  @override
  Widget build(BuildContext context) {
    final name = profile?.fullName ?? 'Patient profile';
    final location = [
      profile?.residenceCity,
      profile?.countryCode,
    ].whereType<String>().where((value) => value.isNotEmpty).join(', ');

    return Row(
      children: [
        Container(
          width: 54,
          height: 54,
          decoration: BoxDecoration(
            color: MedTourColors.brand800,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Center(
            child: Text(
              _initial(name),
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                color: MedTourColors.neutral0,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                name,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: Theme.of(context).textTheme.titleLarge,
              ),
              Text(
                user?.email ?? 'Sign in to manage your account',
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: MedTourColors.neutral500,
                  fontWeight: FontWeight.w700,
                ),
              ),
              if (location.isNotEmpty)
                Text(
                  location,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: MedTourColors.action600,
                    fontWeight: FontWeight.w800,
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }

  String _initial(String value) {
    final trimmed = value.trim();
    return trimmed.isEmpty ? 'P' : trimmed[0].toUpperCase();
  }
}

class _ProfileNotice extends StatelessWidget {
  const _ProfileNotice();

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: MedTourColors.action50,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: MedTourColors.action100),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            const Icon(
              Icons.login_outlined,
              color: MedTourColors.action600,
              size: 34,
            ),
            const SizedBox(height: 10),
            Text(
              'Sign in after onboarding to manage profile and privacy.',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.titleMedium,
            ),
          ],
        ),
      ),
    );
  }
}

class _ProfileForm extends StatelessWidget {
  const _ProfileForm({
    required this.fullNameController,
    required this.phoneController,
    required this.countryController,
    required this.cityController,
    required this.languageController,
    required this.currencyController,
    required this.travelRadiusController,
    required this.medicalSummaryController,
    required this.biologicalSex,
    required this.onBiologicalSexChanged,
    required this.isSaving,
    required this.onSave,
  });

  final TextEditingController fullNameController;
  final TextEditingController phoneController;
  final TextEditingController countryController;
  final TextEditingController cityController;
  final TextEditingController languageController;
  final TextEditingController currencyController;
  final TextEditingController travelRadiusController;
  final TextEditingController medicalSummaryController;
  final String biologicalSex;
  final ValueChanged<String> onBiologicalSexChanged;
  final bool isSaving;
  final VoidCallback onSave;

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
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('Update profile', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 12),
            TextField(
              controller: fullNameController,
              decoration: const InputDecoration(
                labelText: 'Full name',
                prefixIcon: Icon(Icons.person_outline),
              ),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: phoneController,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(
                labelText: 'Phone number',
                prefixIcon: Icon(Icons.phone_outlined),
              ),
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: countryController,
                    textCapitalization: TextCapitalization.characters,
                    decoration: const InputDecoration(
                      labelText: 'Country code',
                      prefixIcon: Icon(Icons.public_outlined),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: TextField(
                    controller: cityController,
                    decoration: const InputDecoration(
                      labelText: 'City',
                      prefixIcon: Icon(Icons.location_city_outlined),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: languageController,
                    decoration: const InputDecoration(
                      labelText: 'Language',
                      prefixIcon: Icon(Icons.translate_outlined),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: TextField(
                    controller: currencyController,
                    textCapitalization: TextCapitalization.characters,
                    decoration: const InputDecoration(
                      labelText: 'Currency',
                      prefixIcon: Icon(Icons.payments_outlined),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            DropdownButtonFormField<String>(
              value: biologicalSex,
              decoration: const InputDecoration(
                labelText: 'Sex for care planning',
                prefixIcon: Icon(Icons.wc_outlined),
              ),
              items: const [
                DropdownMenuItem(value: 'UNKNOWN', child: Text('Prefer not')),
                DropdownMenuItem(value: 'FEMALE', child: Text('Female')),
                DropdownMenuItem(value: 'MALE', child: Text('Male')),
                DropdownMenuItem(value: 'INTERSEX', child: Text('Other')),
              ],
              onChanged: (value) {
                if (value != null) {
                  onBiologicalSexChanged(value);
                }
              },
            ),
            const SizedBox(height: 10),
            const _ProfileDistanceExplainer(),
            const SizedBox(height: 10),
            TextField(
              controller: travelRadiusController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Max clinic distance',
                helperText: 'Shown on clinic cards as within/above preference.',
                prefixIcon: Icon(Icons.route_outlined),
                suffixText: 'km',
              ),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: medicalSummaryController,
              minLines: 2,
              maxLines: 4,
              decoration: const InputDecoration(
                labelText: 'Medical context optional',
                prefixIcon: Icon(Icons.medical_information_outlined),
                alignLabelWithHint: true,
              ),
            ),
            const SizedBox(height: 14),
            ElevatedButton.icon(
              onPressed: isSaving ? null : onSave,
              icon: isSaving
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.save_outlined),
              label: Text(isSaving ? 'Saving...' : 'Save profile'),
            ),
          ],
        ),
      ),
    );
  }
}

class _AccountSection extends StatelessWidget {
  const _AccountSection({
    required this.onOpenInfo,
    required this.onSignOut,
  });

  final void Function(String title, String body) onOpenInfo;
  final VoidCallback onSignOut;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text('Account', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 10),
        _InfoTile(
          icon: Icons.history_outlined,
          title: 'History',
          subtitle: 'Quote requests and care activity',
          color: MedTourColors.action600,
          onTap: () => onOpenInfo(
            'History',
            'Quote history lives in the Quotes tab. Profile activity will include document and consent events as the MVP grows.',
          ),
        ),
        const SizedBox(height: 8),
        _InfoTile(
          icon: Icons.gavel_outlined,
          title: 'Terms',
          subtitle: 'Anti-bypass and booking rules',
          color: MedTourColors.warning400,
          onTap: () => onOpenInfo(
            'Terms',
            'Clinic communication and booking must stay inside MedTour AI for patient protection, auditability and platform trust.',
          ),
        ),
        const SizedBox(height: 8),
        _InfoTile(
          icon: Icons.privacy_tip_outlined,
          title: 'Privacy',
          subtitle: 'Consent, health data and sharing controls',
          color: MedTourColors.success500,
          onTap: () => onOpenInfo(
            'Privacy',
            'Medical documents are sensitive health data. Clinic sharing will require explicit consent for each purpose.',
          ),
        ),
        const SizedBox(height: 8),
        _InfoTile(
          icon: Icons.logout_outlined,
          title: 'Sign out',
          subtitle: 'Return to a signed-out app state',
          color: MedTourColors.attention500,
          onTap: onSignOut,
        ),
      ],
    );
  }
}

class _ProfileDistanceExplainer extends StatelessWidget {
  const _ProfileDistanceExplainer();

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: MedTourColors.warning50,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: MedTourColors.warning100),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            const Icon(
              Icons.route_outlined,
              color: MedTourColors.warning400,
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                'Clinic cards estimate km from this home city/country to the clinic location.',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: MedTourColors.neutral800,
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

class _InfoTile extends StatelessWidget {
  const _InfoTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.color,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final Color color;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: MedTourColors.neutral0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
        side: const BorderSide(color: MedTourColors.neutral200),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: color.withAlpha(22),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: color.withAlpha(70)),
                ),
                child: Icon(icon, color: color),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: Theme.of(context).textTheme.labelLarge),
                    const SizedBox(height: 2),
                    Text(
                      subtitle,
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
              const Icon(
                Icons.chevron_right_outlined,
                color: MedTourColors.neutral400,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
