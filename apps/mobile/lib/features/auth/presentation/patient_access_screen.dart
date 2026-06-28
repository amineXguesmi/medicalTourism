import 'package:flutter/material.dart';

import '../../../shared/theme/medtour_colors.dart';
import '../application/auth_session_controller.dart';
import 'patient_auth_form.dart';

class PatientAccessScreen extends StatelessWidget {
  const PatientAccessScreen({
    super.key,
    required this.controller,
    required this.onAuthenticated,
  });

  final AuthSessionController controller;
  final VoidCallback onAuthenticated;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            return SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(16, 18, 16, 28),
              child: ConstrainedBox(
                constraints: BoxConstraints(minHeight: constraints.maxHeight - 46),
                child: Center(
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 660),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const _AccessHero(),
                        const SizedBox(height: 16),
                        DecoratedBox(
                          decoration: BoxDecoration(
                            color: MedTourColors.neutral0,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: MedTourColors.neutral200),
                            boxShadow: [
                              BoxShadow(
                                color: MedTourColors.neutral900.withAlpha(12),
                                blurRadius: 26,
                                offset: const Offset(0, 12),
                              ),
                            ],
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: PatientAuthForm(
                              controller: controller,
                              onAuthenticated: onAuthenticated,
                            ),
                          ),
                        ),
                        const SizedBox(height: 14),
                        const _TrustRow(),
                      ],
                    ),
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

class _AccessHero extends StatelessWidget {
  const _AccessHero();

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: MedTourColors.brand900,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: MedTourColors.brand700),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: Image.asset(
                'assets/images/medtour_logo.png',
                width: 64,
                height: 64,
                fit: BoxFit.cover,
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'MedTour AI',
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      color: MedTourColors.neutral0,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 5),
                  Text(
                    'Build a patient profile so clinic distance, quote readiness and consent stay personalized.',
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: MedTourColors.brand100,
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

class _TrustRow extends StatelessWidget {
  const _TrustRow();

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: MedTourColors.success50,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: MedTourColors.success100),
      ),
      child: const Padding(
        padding: EdgeInsets.all(12),
        child: Row(
          children: [
            Expanded(
              child: _TrustItem(
                icon: Icons.lock_outline,
                label: 'Consent first',
              ),
            ),
            SizedBox(width: 8),
            Expanded(
              child: _TrustItem(
                icon: Icons.route_outlined,
                label: 'Distance aware',
              ),
            ),
            SizedBox(width: 8),
            Expanded(
              child: _TrustItem(
                icon: Icons.verified_outlined,
                label: 'Verified care',
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _TrustItem extends StatelessWidget {
  const _TrustItem({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 18, color: MedTourColors.success500),
        const SizedBox(height: 5),
        Text(
          label,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.labelSmall?.copyWith(
            color: MedTourColors.neutral700,
            fontWeight: FontWeight.w900,
          ),
        ),
      ],
    );
  }
}
