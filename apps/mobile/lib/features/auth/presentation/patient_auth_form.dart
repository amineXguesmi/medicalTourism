import 'package:flutter/material.dart';

import '../../../shared/theme/medtour_colors.dart';
import '../application/auth_session_controller.dart';

class PatientAuthForm extends StatefulWidget {
  const PatientAuthForm({
    super.key,
    required this.controller,
    required this.onAuthenticated,
  });

  final AuthSessionController controller;
  final VoidCallback onAuthenticated;

  @override
  State<PatientAuthForm> createState() => _PatientAuthFormState();
}

class _PatientAuthFormState extends State<PatientAuthForm> {
  final _fullNameController = TextEditingController(text: 'Demo Patient');
  final _emailController = TextEditingController(
    text: 'patient.demo@medtour.local',
  );
  final _passwordController = TextEditingController(text: 'ChangeMeMvp2026!');
  final _phoneController = TextEditingController(text: '+33100000001');
  final _countryController = TextEditingController(text: 'FR');
  final _cityController = TextEditingController(text: 'Paris');
  final _languageController = TextEditingController(text: 'en');
  final _currencyController = TextEditingController(text: 'EUR');
  final _travelRadiusController = TextEditingController(text: '2500');
  final _medicalSummaryController = TextEditingController();
  bool _isRegisterMode = false;
  bool _showPassword = false;
  String _biologicalSex = 'UNKNOWN';

  @override
  void dispose() {
    _fullNameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
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
      animation: widget.controller,
      builder: (context, _) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            SegmentedButton<bool>(
              showSelectedIcon: false,
              segments: const [
                ButtonSegment(
                  value: false,
                  icon: Icon(Icons.login_outlined),
                  label: Text('Login'),
                ),
                ButtonSegment(
                  value: true,
                  icon: Icon(Icons.person_add_alt_outlined),
                  label: Text('Register'),
                ),
              ],
              selected: {_isRegisterMode},
              onSelectionChanged: (value) {
                setState(() {
                  _isRegisterMode = value.first;
                });
              },
            ),
            const SizedBox(height: 12),
            _ModeHeader(isRegisterMode: _isRegisterMode),
            const SizedBox(height: 14),
            if (_isRegisterMode) ...[
              _FormSectionHeader(
                icon: Icons.badge_outlined,
                title: 'Patient profile',
              ),
              const SizedBox(height: 10),
              TextField(
                controller: _fullNameController,
                textInputAction: TextInputAction.next,
                decoration: const InputDecoration(
                  labelText: 'Full name',
                  prefixIcon: Icon(Icons.person_outline),
                ),
              ),
              const SizedBox(height: 10),
            ],
            TextField(
              controller: _emailController,
              keyboardType: TextInputType.emailAddress,
              textInputAction: TextInputAction.next,
              autofillHints: const [AutofillHints.email],
              decoration: const InputDecoration(
                labelText: 'Email',
                prefixIcon: Icon(Icons.mail_outline),
              ),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _passwordController,
              obscureText: !_showPassword,
              textInputAction: TextInputAction.next,
              autofillHints: const [AutofillHints.password],
              decoration: InputDecoration(
                labelText: 'Password',
                prefixIcon: const Icon(Icons.lock_outline),
                suffixIcon: IconButton(
                  tooltip: _showPassword ? 'Hide password' : 'Show password',
                  onPressed: () {
                    setState(() {
                      _showPassword = !_showPassword;
                    });
                  },
                  icon: Icon(
                    _showPassword
                        ? Icons.visibility_off_outlined
                        : Icons.visibility_outlined,
                  ),
                ),
              ),
            ),
            if (_isRegisterMode) ...[
              const SizedBox(height: 14),
              _FormSectionHeader(
                icon: Icons.phone_android_outlined,
                title: 'Contact and location',
              ),
              const SizedBox(height: 10),
              TextField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                textInputAction: TextInputAction.next,
                decoration: const InputDecoration(
                  labelText: 'Phone number',
                  prefixIcon: Icon(Icons.phone_outlined),
                ),
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(
                    flex: 2,
                    child: TextField(
                      controller: _countryController,
                      textCapitalization: TextCapitalization.characters,
                      textInputAction: TextInputAction.next,
                      decoration: const InputDecoration(
                        labelText: 'Country code',
                        prefixIcon: Icon(Icons.public_outlined),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    flex: 3,
                    child: TextField(
                      controller: _cityController,
                      textInputAction: TextInputAction.next,
                      decoration: const InputDecoration(
                        labelText: 'City',
                        prefixIcon: Icon(Icons.location_city_outlined),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              const _DistanceExplainer(),
              const SizedBox(height: 10),
              TextField(
                controller: _travelRadiusController,
                keyboardType: TextInputType.number,
                textInputAction: TextInputAction.next,
                decoration: const InputDecoration(
                  labelText: 'Max clinic distance',
                  helperText: 'Shown on clinic cards as within/above preference.',
                  prefixIcon: Icon(Icons.route_outlined),
                  suffixText: 'km',
                ),
              ),
              const SizedBox(height: 14),
              _FormSectionHeader(
                icon: Icons.health_and_safety_outlined,
                title: 'Care preferences',
              ),
              const SizedBox(height: 10),
              DropdownButtonFormField<String>(
                value: _biologicalSex,
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
                  setState(() {
                    _biologicalSex = value ?? 'UNKNOWN';
                  });
                },
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _languageController,
                      decoration: const InputDecoration(
                        labelText: 'Language',
                        prefixIcon: Icon(Icons.translate_outlined),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: TextField(
                      controller: _currencyController,
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
              TextField(
                controller: _medicalSummaryController,
                minLines: 2,
                maxLines: 4,
                maxLength: 1000,
                decoration: const InputDecoration(
                  labelText: 'Medical context optional',
                  hintText: 'Treatment interest, allergies, mobility needs',
                  prefixIcon: Icon(Icons.medical_information_outlined),
                  alignLabelWithHint: true,
                ),
              ),
            ],
            if (widget.controller.errorMessage != null) ...[
              const SizedBox(height: 10),
              DecoratedBox(
                decoration: BoxDecoration(
                  color: MedTourColors.attention50,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: MedTourColors.attention100),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Text(
                    widget.controller.errorMessage!,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: MedTourColors.attention500,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
              ),
            ],
            const SizedBox(height: 14),
            ElevatedButton.icon(
              onPressed: widget.controller.isLoading ? null : _submit,
              icon: widget.controller.isLoading
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : Icon(
                      _isRegisterMode
                          ? Icons.person_add_alt_outlined
                          : Icons.login_outlined,
                    ),
              label: Text(
                widget.controller.isLoading
                    ? 'Please wait...'
                    : _isRegisterMode
                    ? 'Create patient account'
                    : 'Login',
              ),
            ),
            const SizedBox(height: 10),
            OutlinedButton.icon(
              onPressed: widget.controller.isLoading ? null : _demoLogin,
              icon: const Icon(Icons.science_outlined),
              label: const Text('Use demo patient'),
            ),
          ],
        );
      },
    );
  }

  Future<void> _submit() async {
    final success = _isRegisterMode
        ? await widget.controller.registerPatient(
            fullName: _fullNameController.text,
            email: _emailController.text,
            password: _passwordController.text,
            phone: _phoneController.text,
            countryCode: _countryController.text,
            residenceCity: _cityController.text,
            languageCode: _languageController.text,
            currencyCode: _currencyController.text,
            biologicalSex: _biologicalSex,
            travelRadiusKm: int.tryParse(_travelRadiusController.text),
            medicalSummary: _medicalSummaryController.text,
          )
        : await widget.controller.login(
            email: _emailController.text,
            password: _passwordController.text,
          );

    if (success && mounted) {
      widget.onAuthenticated();
    }
  }

  Future<void> _demoLogin() async {
    final success = await widget.controller.loginWithDemoPatient();
    if (success && mounted) {
      widget.onAuthenticated();
    }
  }
}

class _FormSectionHeader extends StatelessWidget {
  const _FormSectionHeader({required this.icon, required this.title});

  final IconData icon;
  final String title;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 18, color: MedTourColors.action600),
        const SizedBox(width: 6),
        Text(
          title,
          style: Theme.of(context).textTheme.labelLarge?.copyWith(
            color: MedTourColors.neutral700,
            fontWeight: FontWeight.w900,
          ),
        ),
      ],
    );
  }
}

class _ModeHeader extends StatelessWidget {
  const _ModeHeader({required this.isRegisterMode});

  final bool isRegisterMode;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: isRegisterMode ? MedTourColors.brand50 : MedTourColors.action50,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: isRegisterMode
              ? MedTourColors.brand100
              : MedTourColors.action100,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            Icon(
              isRegisterMode
                  ? Icons.person_add_alt_outlined
                  : Icons.login_outlined,
              color: isRegisterMode
                  ? MedTourColors.brand700
                  : MedTourColors.action600,
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    isRegisterMode ? 'Create care profile' : 'Welcome back',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    isRegisterMode
                        ? 'Your home city helps estimate clinic distance.'
                        : 'Continue to search, compare and request quotes.',
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

class _DistanceExplainer extends StatelessWidget {
  const _DistanceExplainer();

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
                'We estimate km from your home city/country to each clinic location. Exact address and map routing can come later.',
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
