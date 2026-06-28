import 'package:flutter/material.dart';

import '../../../shared/theme/medtour_colors.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key, required this.onFinished});

  final VoidCallback onFinished;

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final _pageController = PageController();
  int _page = 0;

  static const _items = [
    _OnboardingItem(
      icon: Icons.travel_explore_outlined,
      title: 'Find care you can trust',
      body:
          'Search verified clinics by procedure and destination, then compare what matters before you share anything.',
      highlights: ['Verified clinics', 'Procedure filters', 'Clear next steps'],
      accent: MedTourColors.action600,
    ),
    _OnboardingItem(
      icon: Icons.route_outlined,
      title: 'Know the real travel effort',
      body:
          'Your home city helps estimate distance to each clinic, travel costs and whether the trip feels reasonable.',
      highlights: ['Home to clinic km', 'Travel estimate', 'Budget context'],
      accent: MedTourColors.warning400,
    ),
    _OnboardingItem(
      icon: Icons.lock_outline,
      title: 'Stay in control of your file',
      body:
          'Quotes, documents and clinic messages stay inside the platform with consent and auditability built in.',
      highlights: ['Consent first', 'Quote history', 'Private documents'],
      accent: MedTourColors.attention500,
    ),
  ];

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isLast = _page == _items.length - 1;

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 18, 16, 24),
          child: Column(
            children: [
              Row(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Image.asset(
                      'assets/images/medtour_logo.png',
                      width: 46,
                      height: 46,
                      fit: BoxFit.cover,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'MedTour AI',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                  ),
                  TextButton(
                    onPressed: widget.onFinished,
                    child: const Text('Skip'),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              Expanded(
                child: PageView.builder(
                  controller: _pageController,
                  itemCount: _items.length,
                  onPageChanged: (value) {
                    setState(() {
                      _page = value;
                    });
                  },
                  itemBuilder: (context, index) {
                    return _OnboardingPage(item: _items[index]);
                  },
                ),
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  for (var index = 0; index < _items.length; index++)
                    AnimatedContainer(
                      duration: const Duration(milliseconds: 220),
                      width: index == _page ? 24 : 8,
                      height: 8,
                      margin: const EdgeInsets.symmetric(horizontal: 4),
                      decoration: BoxDecoration(
                        color: index == _page
                            ? MedTourColors.brand700
                            : MedTourColors.neutral200,
                        borderRadius: BorderRadius.circular(999),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 18),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: _page == 0 ? null : _previous,
                      icon: const Icon(Icons.arrow_back_outlined),
                      label: const Text('Back'),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: isLast ? widget.onFinished : _next,
                      icon: Icon(
                        isLast
                            ? Icons.login_outlined
                            : Icons.arrow_forward_outlined,
                      ),
                      label: Text(isLast ? 'Start' : 'Next'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _next() {
    _pageController.nextPage(
      duration: const Duration(milliseconds: 260),
      curve: Curves.easeOutCubic,
    );
  }

  void _previous() {
    _pageController.previousPage(
      duration: const Duration(milliseconds: 260),
      curve: Curves.easeOutCubic,
    );
  }
}

class _OnboardingPage extends StatelessWidget {
  const _OnboardingPage({required this.item});

  final _OnboardingItem item;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        DecoratedBox(
          decoration: BoxDecoration(
            color: MedTourColors.neutral0,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: item.accent.withAlpha(58)),
            boxShadow: [
              BoxShadow(
                color: item.accent.withAlpha(18),
                blurRadius: 26,
                offset: const Offset(0, 14),
              ),
            ],
          ),
          child: Padding(
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                _FeatureVisual(item: item),
                const SizedBox(height: 18),
                Text(
                  item.title,
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  item.body,
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: MedTourColors.neutral600,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 16),
                Wrap(
                  alignment: WrapAlignment.center,
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    for (final highlight in item.highlights)
                      _HighlightPill(label: highlight, color: item.accent),
                  ],
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _OnboardingItem {
  const _OnboardingItem({
    required this.icon,
    required this.title,
    required this.body,
    required this.highlights,
    required this.accent,
  });

  final IconData icon;
  final String title;
  final String body;
  final List<String> highlights;
  final Color accent;
}

class _FeatureVisual extends StatelessWidget {
  const _FeatureVisual({required this.item});

  final _OnboardingItem item;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: item.accent.withAlpha(18),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: item.accent.withAlpha(54)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Row(
          children: [
            Container(
              width: 68,
              height: 68,
              decoration: BoxDecoration(
                color: MedTourColors.neutral0,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: item.accent.withAlpha(80)),
              ),
              child: Icon(item.icon, size: 34, color: item.accent),
            ),
            const SizedBox(width: 12),
            const Expanded(
              child: Column(
                children: [
                  _VisualLine(widthFactor: 1),
                  SizedBox(height: 8),
                  _VisualLine(widthFactor: .74),
                  SizedBox(height: 8),
                  _VisualLine(widthFactor: .52),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _VisualLine extends StatelessWidget {
  const _VisualLine({required this.widthFactor});

  final double widthFactor;

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.centerLeft,
      child: FractionallySizedBox(
        widthFactor: widthFactor,
        child: Container(
          height: 10,
          decoration: BoxDecoration(
            color: MedTourColors.neutral0.withAlpha(210),
            borderRadius: BorderRadius.circular(999),
          ),
        ),
      ),
    );
  }
}

class _HighlightPill extends StatelessWidget {
  const _HighlightPill({required this.label, required this.color});

  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: color.withAlpha(18),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: color.withAlpha(64)),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        child: Text(
          label,
          style: Theme.of(context).textTheme.labelSmall?.copyWith(
            color: MedTourColors.neutral800,
            fontWeight: FontWeight.w900,
          ),
        ),
      ),
    );
  }
}
