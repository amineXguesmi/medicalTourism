import 'package:flutter_test/flutter_test.dart';
import 'package:medtour_mobile/app/medtour_app.dart';
import 'package:medtour_mobile/features/marketplace/application/marketplace_controller.dart';

void main() {
  testWidgets('renders the marketplace MVP shell', (tester) async {
    await tester.pumpWidget(
      MedTourApp(
        marketplaceController: MarketplaceController.sample(),
        initialStage: AppStartStage.app,
      ),
    );

    expect(find.text('MedTour AI'), findsOneWidget);
    expect(find.text('Compare care with the full trip in view'), findsOneWidget);
    expect(find.text('Barcelona Dental Institute'), findsOneWidget);
    expect(find.text('Quote readiness'), findsOneWidget);
  });

  testWidgets('opens patient auth sheet from the marketplace', (tester) async {
    await tester.pumpWidget(
      MedTourApp(
        marketplaceController: MarketplaceController.sample(),
        initialStage: AppStartStage.app,
      ),
    );

    await tester.tap(find.text('Patient'));
    await tester.pumpAndSettle();

    expect(find.text('Patient access'), findsOneWidget);
    expect(find.text('Use demo patient'), findsOneWidget);
  });
}
