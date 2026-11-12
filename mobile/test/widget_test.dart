import 'package:bizgarh_mobile/main.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('Bizgarh shell shows Home brand and bottom tabs', (tester) async {
    await tester.binding.setSurfaceSize(const Size(390, 844));
    addTearDown(() => tester.binding.setSurfaceSize(null));

    await tester.pumpWidget(const BizgarhApp());
    await tester.pump(); // start entrance animations
    await tester.pump(const Duration(milliseconds: 1700));

    expect(find.text('Bizgarh'), findsWidgets);
    expect(find.textContaining('Welcome back'), findsOneWidget);
    expect(find.textContaining('Learn from the journey'), findsOneWidget);
    expect(find.text('Popular Categories'), findsOneWidget);
    expect(find.text('Stock Market Investing'), findsOneWidget);
    expect(find.text('Option Trading'), findsOneWidget);
    expect(find.text('Stock Market Basics'), findsOneWidget);
    expect(find.text('Technical Analysis'), findsOneWidget);
    expect(find.text('Crypto'), findsOneWidget);
    expect(find.text('Trading Strategies'), findsOneWidget);
    expect(find.text('Mentorship'), findsNothing);
    expect(find.text('NISM'), findsNothing);
    expect(find.text('Algo Trading'), findsNothing);
    // Scroll Home to build courses / live / experts slivers.
    await tester.drag(find.byType(CustomScrollView), const Offset(0, -700));
    await tester.pump(const Duration(milliseconds: 500));
    expect(find.text('Most popular courses'), findsOneWidget);
    expect(find.text('Upcoming live classes'), findsOneWidget);
    expect(find.text('LIVE'), findsOneWidget);
    // No current live sessions — header only, blank card row (mirrors site).
    expect(find.text('Gap & Go for Nifty Options'), findsNothing);
    expect(find.text('Learn from Stock Market Experts'), findsOneWidget);
    expect(find.text('Home'), findsOneWidget);
    expect(find.text('Search'), findsOneWidget);
    expect(find.text('My Learning'), findsOneWidget);
    expect(find.text('Profile'), findsOneWidget);

    await tester.tap(find.text('Search'));
    await tester.pump(const Duration(milliseconds: 300));
    expect(find.text('Courses, mentors, options…'), findsOneWidget);

    await tester.tap(find.text('My Learning'));
    await tester.pump(const Duration(milliseconds: 300));
    expect(find.textContaining('enrolled'), findsOneWidget);

    await tester.tap(find.text('Profile'));
    await tester.pump(const Duration(milliseconds: 300));
    expect(find.text('Riya Sharma'), findsOneWidget);
    expect(find.text('Settings'), findsOneWidget);
    expect(find.text('Saved item'), findsNothing);
    expect(find.text('Frequently asked questions'), findsNothing);
    expect(find.text('Help & FAQs'), findsOneWidget);
    expect(find.text('Sign out'), findsOneWidget);
  });
}
