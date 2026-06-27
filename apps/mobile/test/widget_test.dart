import 'package:flutter_test/flutter_test.dart';
import 'package:medtour_mobile/app/medtour_app.dart';
import 'package:medtour_mobile/features/marketplace/application/marketplace_controller.dart';

void main() {
  testWidgets('renders the marketplace MVP shell', (tester) async {
    await tester.pumpWidget(
      MedTourApp(marketplaceController: MarketplaceController.sample()),
    );

    expect(find.text('MedTour AI'), findsOneWidget);
    expect(find.text('Compare verified care'), findsOneWidget);
    expect(find.text('Barcelona Dental Institute'), findsOneWidget);
    expect(find.text('Medical file readiness'), findsOneWidget);
  });

  testWidgets('opens patient auth sheet from the marketplace', (tester) async {
    await tester.pumpWidget(
      MedTourApp(marketplaceController: MarketplaceController.sample()),
    );

    await tester.tap(find.text('Login'));
    await tester.pumpAndSettle();

    expect(find.text('Patient access'), findsOneWidget);
    expect(find.text('Use demo patient'), findsOneWidget);
  });
}
