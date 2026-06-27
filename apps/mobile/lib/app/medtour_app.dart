import 'package:flutter/material.dart';

import '../features/auth/application/auth_session_controller.dart';
import '../features/marketplace/application/marketplace_controller.dart';
import '../features/marketplace/presentation/marketplace_screen.dart';
import '../shared/theme/medtour_theme.dart';

class MedTourApp extends StatelessWidget {
  const MedTourApp({
    super.key,
    this.marketplaceController,
    this.authSessionController,
  });

  final MarketplaceController? marketplaceController;
  final AuthSessionController? authSessionController;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'MedTour AI',
      debugShowCheckedModeBanner: false,
      theme: MedTourTheme.light(),
      home: MarketplaceScreen(
        controller: marketplaceController,
        authSessionController: authSessionController,
      ),
    );
  }
}
