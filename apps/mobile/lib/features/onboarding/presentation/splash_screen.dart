import 'dart:async';

import 'package:flutter/material.dart';

import '../../../shared/theme/medtour_colors.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key, required this.onComplete});

  final VoidCallback onComplete;

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _fade;
  late final Animation<double> _scale;
  late final Animation<Offset> _slide;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..forward();
    _fade = CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic);
    _scale = Tween<double>(begin: 0.86, end: 1).animate(
      CurvedAnimation(parent: _controller, curve: Curves.elasticOut),
    );
    _slide = Tween<Offset>(
      begin: const Offset(0, 0.16),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic));
    _timer = Timer(const Duration(milliseconds: 2300), () {
      if (mounted) {
        widget.onComplete();
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: MedTourColors.brand900,
      body: SafeArea(
        child: Center(
          child: FadeTransition(
            opacity: _fade,
            child: SlideTransition(
              position: _slide,
              child: ScaleTransition(
                scale: _scale,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    DecoratedBox(
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: MedTourColors.action300.withAlpha(120),
                          width: 1.5,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: MedTourColors.action300.withAlpha(42),
                            blurRadius: 32,
                            offset: const Offset(0, 16),
                          ),
                        ],
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: Image.asset(
                          'assets/images/medtour_logo.png',
                          width: 156,
                          height: 156,
                          fit: BoxFit.cover,
                        ),
                      ),
                    ),
                    const SizedBox(height: 22),
                    Text(
                      'MedTour AI',
                      style: Theme.of(context).textTheme.headlineSmall
                          ?.copyWith(
                            color: MedTourColors.neutral0,
                            fontWeight: FontWeight.w900,
                          ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Verified care. Clear travel costs.',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: MedTourColors.brand100,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 26),
                    SizedBox(
                      width: 170,
                      child: AnimatedBuilder(
                        animation: _controller,
                        builder: (context, _) {
                          return LinearProgressIndicator(
                            minHeight: 5,
                            value: _controller.value,
                            borderRadius: BorderRadius.circular(999),
                            backgroundColor: MedTourColors.brand800,
                            valueColor: const AlwaysStoppedAnimation<Color>(
                              MedTourColors.action300,
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
