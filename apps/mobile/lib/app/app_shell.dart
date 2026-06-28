import 'package:flutter/material.dart';

import '../features/auth/application/auth_session_controller.dart';
import '../features/documents/presentation/documents_screen.dart';
import '../features/marketplace/application/marketplace_controller.dart';
import '../features/marketplace/presentation/marketplace_screen.dart';
import '../features/profile/presentation/patient_profile_screen.dart';
import '../features/quotes/presentation/quote_history_screen.dart';

class AppShell extends StatefulWidget {
  const AppShell({
    super.key,
    required this.marketplaceController,
    required this.authSessionController,
  });

  final MarketplaceController marketplaceController;
  final AuthSessionController authSessionController;

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _selectedIndex,
        children: [
          MarketplaceScreen(
            controller: widget.marketplaceController,
            authSessionController: widget.authSessionController,
          ),
          QuoteHistoryScreen(authSessionController: widget.authSessionController),
          DocumentsScreen(authSessionController: widget.authSessionController),
          PatientProfileScreen(
            authSessionController: widget.authSessionController,
          ),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: (index) {
          setState(() {
            _selectedIndex = index;
          });
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.search_outlined),
            selectedIcon: Icon(Icons.search),
            label: 'Search',
          ),
          NavigationDestination(
            icon: Icon(Icons.request_quote_outlined),
            selectedIcon: Icon(Icons.request_quote),
            label: 'Quotes',
          ),
          NavigationDestination(
            icon: Icon(Icons.folder_shared_outlined),
            selectedIcon: Icon(Icons.folder_shared),
            label: 'Docs',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}
