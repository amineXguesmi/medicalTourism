import 'package:flutter/material.dart';

import '../../../shared/theme/medtour_colors.dart';
import '../../auth/application/auth_session_controller.dart';

class DocumentsScreen extends StatelessWidget {
  const DocumentsScreen({super.key, required this.authSessionController});

  final AuthSessionController authSessionController;

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: authSessionController,
      builder: (context, _) {
        return Scaffold(
          body: SafeArea(
            child: ListView(
              padding: const EdgeInsets.fromLTRB(16, 18, 16, 28),
              children: [
                Row(
                  children: [
                    Container(
                      width: 46,
                      height: 46,
                      decoration: BoxDecoration(
                        color: MedTourColors.brand800,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(
                        Icons.folder_shared_outlined,
                        color: MedTourColors.neutral0,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Medical file',
                            style: Theme.of(context).textTheme.titleLarge,
                          ),
                          Text(
                            'Documents, consent and AI summaries.',
                            overflow: TextOverflow.ellipsis,
                            style: Theme.of(context).textTheme.bodySmall
                                ?.copyWith(
                                  color: MedTourColors.neutral500,
                                  fontWeight: FontWeight.w700,
                                ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                _ReadinessBand(
                  isAuthenticated: authSessionController.isAuthenticated,
                ),
                const SizedBox(height: 14),
                _DocumentAction(
                  icon: Icons.upload_file_outlined,
                  title: 'Upload documents',
                  body:
                      'Passport, medical history, procedure photos or test files.',
                  color: MedTourColors.action600,
                  actionLabel: 'Upload',
                  onPressed: () => _comingSoon(context),
                ),
                const SizedBox(height: 10),
                _DocumentAction(
                  icon: Icons.psychology_outlined,
                  title: 'AI medical summary',
                  body:
                      'Summaries will cite source files and keep validation notes.',
                  color: MedTourColors.warning400,
                  actionLabel: 'Prepare',
                  onPressed: () => _comingSoon(context),
                ),
                const SizedBox(height: 10),
                _DocumentAction(
                  icon: Icons.lock_outline,
                  title: 'Consent sharing',
                  body:
                      'Choose which clinic can see which file for each request.',
                  color: MedTourColors.attention500,
                  actionLabel: 'Consent',
                  onPressed: () => _comingSoon(context),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  void _comingSoon(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Document workflow is the next MVP slice.')),
    );
  }
}

class _ReadinessBand extends StatelessWidget {
  const _ReadinessBand({required this.isAuthenticated});

  final bool isAuthenticated;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: isAuthenticated ? MedTourColors.success50 : MedTourColors.action50,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: isAuthenticated
              ? MedTourColors.success100
              : MedTourColors.action100,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Row(
          children: [
            Icon(
              isAuthenticated
                  ? Icons.verified_user_outlined
                  : Icons.login_outlined,
              color: isAuthenticated
                  ? MedTourColors.success500
                  : MedTourColors.action600,
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                isAuthenticated
                    ? 'Patient file is linked to this account.'
                    : 'Sign in before uploading private medical files.',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
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

class _DocumentAction extends StatelessWidget {
  const _DocumentAction({
    required this.icon,
    required this.title,
    required this.body,
    required this.color,
    required this.actionLabel,
    required this.onPressed,
  });

  final IconData icon;
  final String title;
  final String body;
  final Color color;
  final String actionLabel;
  final VoidCallback onPressed;

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
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
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
                  Text(title, style: Theme.of(context).textTheme.titleMedium),
                  const SizedBox(height: 3),
                  Text(
                    body,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: MedTourColors.neutral500,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            IconButton.filledTonal(
              tooltip: actionLabel,
              onPressed: onPressed,
              icon: const Icon(Icons.arrow_forward_outlined),
            ),
          ],
        ),
      ),
    );
  }
}
