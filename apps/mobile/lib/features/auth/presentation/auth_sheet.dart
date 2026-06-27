import 'package:flutter/material.dart';

import '../../../shared/theme/medtour_colors.dart';
import '../application/auth_session_controller.dart';

class AuthSheet extends StatefulWidget {
  const AuthSheet({super.key, required this.controller});

  final AuthSessionController controller;

  @override
  State<AuthSheet> createState() => _AuthSheetState();
}

class _AuthSheetState extends State<AuthSheet> {
  final _emailController = TextEditingController(
    text: 'patient.demo@medtour.local',
  );
  final _passwordController = TextEditingController(text: 'ChangeMeMvp2026!');
  final _phoneController = TextEditingController();
  bool _isRegisterMode = false;
  bool _showPassword = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.viewInsetsOf(context).bottom;

    return AnimatedBuilder(
      animation: widget.controller,
      builder: (context, _) {
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
                      'Patient access',
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
              const SizedBox(height: 10),
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
              const SizedBox(height: 14),
              TextField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
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
                const SizedBox(height: 10),
                TextField(
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  decoration: const InputDecoration(
                    labelText: 'Phone optional',
                    prefixIcon: Icon(Icons.phone_outlined),
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
              const SizedBox(height: 8),
              Text(
                'MVP note: the access token is kept in memory only until secure device storage is added.',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: MedTourColors.neutral500,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Future<void> _submit() async {
    final success = _isRegisterMode
        ? await widget.controller.registerPatient(
            email: _emailController.text,
            password: _passwordController.text,
            phone: _phoneController.text,
          )
        : await widget.controller.login(
            email: _emailController.text,
            password: _passwordController.text,
          );

    if (success && mounted) {
      Navigator.pop(context, true);
    }
  }

  Future<void> _demoLogin() async {
    final success = await widget.controller.loginWithDemoPatient();
    if (success && mounted) {
      Navigator.pop(context, true);
    }
  }
}
