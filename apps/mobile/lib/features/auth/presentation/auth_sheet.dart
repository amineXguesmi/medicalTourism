import 'package:flutter/material.dart';

import '../../../shared/theme/medtour_colors.dart';
import '../application/auth_session_controller.dart';
import 'patient_auth_form.dart';

class AuthSheet extends StatelessWidget {
  const AuthSheet({super.key, required this.controller});

  final AuthSessionController controller;

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.viewInsetsOf(context).bottom;

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
                    Icons.verified_user_outlined,
                    color: MedTourColors.brand700,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Patient access',
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Sign in or create a care profile.',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: MedTourColors.neutral500,
                          fontWeight: FontWeight.w600,
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
            const SizedBox(height: 12),
            DecoratedBox(
              decoration: BoxDecoration(
                color: MedTourColors.action50,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: MedTourColors.action100),
              ),
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Row(
                  children: [
                    const Icon(
                      Icons.science_outlined,
                      color: MedTourColors.action600,
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Use the demo patient for local MVP testing.',
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
            PatientAuthForm(
              controller: controller,
              onAuthenticated: () => Navigator.pop(context, true),
            ),
            const SizedBox(height: 8),
            Text(
              'MVP note: the access token is kept in memory until secure device storage is added.',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: MedTourColors.neutral500,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
