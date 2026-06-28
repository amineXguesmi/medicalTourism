import 'package:flutter/material.dart';

import '../../../core/api/marketplace_api_client.dart';
import '../../../core/api/marketplace_models.dart';
import '../../../core/config/app_config.dart';
import '../../../shared/theme/medtour_colors.dart';
import '../../auth/application/auth_session_controller.dart';

class QuoteHistoryScreen extends StatefulWidget {
  const QuoteHistoryScreen({super.key, required this.authSessionController});

  final AuthSessionController authSessionController;

  @override
  State<QuoteHistoryScreen> createState() => _QuoteHistoryScreenState();
}

class _QuoteHistoryScreenState extends State<QuoteHistoryScreen> {
  final _apiClient = MarketplaceApiClient(baseUrl: AppConfig.apiBaseUrl);
  List<QuoteRequestSummary> _quotes = const [];
  String? _loadedToken;
  bool _isLoading = false;
  String? _error;

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: widget.authSessionController,
      builder: (context, _) {
        final token = widget.authSessionController.accessToken;
        if (token != null && token != _loadedToken && !_isLoading) {
          WidgetsBinding.instance.addPostFrameCallback((_) => _load(token));
        }

        return Scaffold(
          body: SafeArea(
            child: RefreshIndicator(
              onRefresh: () async {
                final currentToken = widget.authSessionController.accessToken;
                if (currentToken != null) {
                  await _load(currentToken, force: true);
                }
              },
              child: ListView(
                padding: const EdgeInsets.fromLTRB(16, 18, 16, 28),
                children: [
                  _Header(
                    icon: Icons.request_quote_outlined,
                    title: 'Quote history',
                    subtitle: 'Requests, clinic responses and next actions.',
                  ),
                  const SizedBox(height: 16),
                  if (token == null)
                    const _SignedOutState()
                  else if (_isLoading)
                    const _LoadingState()
                  else if (_error != null)
                    _ErrorState(message: _error!, onRetry: () => _load(token))
                  else if (_quotes.isEmpty)
                    const _EmptyQuotesState()
                  else
                    for (final quote in _quotes) ...[
                      _QuoteTile(quote: quote),
                      const SizedBox(height: 10),
                    ],
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Future<void> _load(String token, {bool force = false}) async {
    if (_isLoading || (!force && token == _loadedToken)) {
      return;
    }

    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final response = await _apiClient.listMyQuoteRequests(accessToken: token);
      if (!mounted) {
        return;
      }
      setState(() {
        _quotes = response.quoteRequests;
        _loadedToken = token;
      });
    } catch (_) {
      if (!mounted) {
        return;
      }
      setState(() {
        _error = 'Could not load quote history.';
      });
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }
}

class _QuoteTile extends StatelessWidget {
  const _QuoteTile({required this.quote});

  final QuoteRequestSummary quote;

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
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 42,
              height: 42,
              decoration: BoxDecoration(
                color: MedTourColors.action50,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: MedTourColors.action100),
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
                    quote.clinic.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  const SizedBox(height: 3),
                  Text(
                    quote.procedure.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: MedTourColors.neutral500,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 9),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      _SmallPill(
                        icon: Icons.flag_outlined,
                        label: quote.status.replaceAll('_', ' '),
                        color: MedTourColors.success500,
                      ),
                      if (quote.createdAt != null)
                        _SmallPill(
                          icon: Icons.calendar_month_outlined,
                          label: _formatDate(quote.createdAt!),
                          color: MedTourColors.warning400,
                        ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
  }
}

class _SmallPill extends StatelessWidget {
  const _SmallPill({
    required this.icon,
    required this.label,
    required this.color,
  });

  final IconData icon;
  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: color.withAlpha(22),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: color.withAlpha(70)),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 14, color: color),
            const SizedBox(width: 5),
            Text(
              label,
              style: Theme.of(context).textTheme.labelSmall?.copyWith(
                color: MedTourColors.neutral800,
                fontWeight: FontWeight.w800,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Header extends StatelessWidget {
  const _Header({
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  final IconData icon;
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 46,
          height: 46,
          decoration: BoxDecoration(
            color: MedTourColors.brand800,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, color: MedTourColors.neutral0),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: Theme.of(context).textTheme.titleLarge),
              Text(
                subtitle,
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
      ],
    );
  }
}

class _SignedOutState extends StatelessWidget {
  const _SignedOutState();

  @override
  Widget build(BuildContext context) {
    return const _StatePanel(
      icon: Icons.login_outlined,
      title: 'Sign in to see quote history',
      body: 'Submitted quote requests will appear here.',
      color: MedTourColors.action600,
    );
  }
}

class _LoadingState extends StatelessWidget {
  const _LoadingState();

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Padding(
        padding: EdgeInsets.all(28),
        child: CircularProgressIndicator(),
      ),
    );
  }
}

class _ErrorState extends StatelessWidget {
  const _ErrorState({required this.message, required this.onRetry});

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _StatePanel(
          icon: Icons.wifi_off_outlined,
          title: message,
          body: 'Check the backend and try again.',
          color: MedTourColors.warning400,
        ),
        const SizedBox(height: 12),
        OutlinedButton.icon(
          onPressed: onRetry,
          icon: const Icon(Icons.refresh_outlined),
          label: const Text('Retry'),
        ),
      ],
    );
  }
}

class _EmptyQuotesState extends StatelessWidget {
  const _EmptyQuotesState();

  @override
  Widget build(BuildContext context) {
    return const _StatePanel(
      icon: Icons.inbox_outlined,
      title: 'No quote requests yet',
      body: 'Compare clinics and request a quote from the Search tab.',
      color: MedTourColors.success500,
    );
  }
}

class _StatePanel extends StatelessWidget {
  const _StatePanel({
    required this.icon,
    required this.title,
    required this.body,
    required this.color,
  });

  final IconData icon;
  final String title;
  final String body;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: color.withAlpha(22),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withAlpha(72)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          children: [
            Icon(icon, color: color, size: 34),
            const SizedBox(height: 10),
            Text(
              title,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 4),
            Text(
              body,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ],
        ),
      ),
    );
  }
}
