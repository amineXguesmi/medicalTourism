import 'dart:async';

import 'package:flutter/material.dart';

import '../features/auth/application/auth_session_controller.dart';
import '../features/auth/presentation/patient_access_screen.dart';
import '../features/marketplace/application/marketplace_controller.dart';
import '../features/onboarding/presentation/onboarding_screen.dart';
import '../features/onboarding/presentation/splash_screen.dart';
import '../shared/theme/medtour_theme.dart';
import 'app_shell.dart';

enum AppStartStage { splash, onboarding, auth, app }

class MedTourApp extends StatefulWidget {
  const MedTourApp({
    super.key,
    this.marketplaceController,
    this.authSessionController,
    this.initialStage = AppStartStage.splash,
  });

  final MarketplaceController? marketplaceController;
  final AuthSessionController? authSessionController;
  final AppStartStage initialStage;

  @override
  State<MedTourApp> createState() => _MedTourAppState();
}

class _MedTourAppState extends State<MedTourApp> {
  late final MarketplaceController _marketplaceController;
  late final AuthSessionController _authSessionController;
  late final bool _ownsMarketplaceController;
  late final bool _ownsAuthSessionController;
  late AppStartStage _stage;

  @override
  void initState() {
    super.initState();
    _stage = widget.initialStage;
    _ownsMarketplaceController = widget.marketplaceController == null;
    _ownsAuthSessionController = widget.authSessionController == null;
    _marketplaceController =
        widget.marketplaceController ?? MarketplaceController();
    _authSessionController =
        widget.authSessionController ?? AuthSessionController();
    _authSessionController.addListener(_syncPatientCountry);
    _syncPatientCountry();
  }

  @override
  void dispose() {
    _authSessionController.removeListener(_syncPatientCountry);
    if (_ownsMarketplaceController) {
      _marketplaceController.dispose();
    }
    if (_ownsAuthSessionController) {
      _authSessionController.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'MedTour AI',
      debugShowCheckedModeBanner: false,
      theme: MedTourTheme.light(),
      home: _buildStage(),
    );
  }

  Widget _buildStage() {
    switch (_stage) {
      case AppStartStage.splash:
        return SplashScreen(
          onComplete: () => setState(() {
            _stage = AppStartStage.onboarding;
          }),
        );
      case AppStartStage.onboarding:
        return OnboardingScreen(
          onFinished: () => setState(() {
            _stage = AppStartStage.auth;
          }),
        );
      case AppStartStage.auth:
        return PatientAccessScreen(
          controller: _authSessionController,
          onAuthenticated: _enterApp,
        );
      case AppStartStage.app:
        return AppShell(
          marketplaceController: _marketplaceController,
          authSessionController: _authSessionController,
        );
    }
  }

  void _enterApp() {
    _syncPatientCountry();
    setState(() {
      _stage = AppStartStage.app;
    });
  }

  void _syncPatientCountry() {
    final countryCode = _authSessionController.patientCountryCode;
    if (countryCode != null && countryCode.isNotEmpty) {
      unawaited(_marketplaceController.updatePatientCountryCode(countryCode));
    }
  }
}
