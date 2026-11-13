import 'package:bizgarh_mobile/main.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  Future<void> pumpApp(WidgetTester tester) async {
    await tester.binding.setSurfaceSize(const Size(390, 844));
    addTearDown(() => tester.binding.setSurfaceSize(null));
    await tester.pumpWidget(const BizgarhApp());
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 1700));
  }

  testWidgets('Bizgarh shell shows Home brand and bottom tabs', (tester) async {
    await pumpApp(tester);

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

    await tester.drag(find.byType(CustomScrollView), const Offset(0, -700));
    await tester.pump(const Duration(milliseconds: 500));
    expect(find.text('Most popular courses'), findsOneWidget);
    expect(find.text('Upcoming live classes'), findsOneWidget);
    expect(find.text('LIVE'), findsOneWidget);
    expect(find.text('Gap & Go for Nifty Options'), findsNothing);
    expect(find.text('Learn from Stock Market Experts'), findsOneWidget);
    expect(find.text('Home'), findsOneWidget);
    expect(find.text('Search'), findsOneWidget);
    expect(find.text('My Learning'), findsWidgets);
    expect(find.text('Profile'), findsOneWidget);

    await tester.tap(find.text('Search'));
    await tester.pump(const Duration(milliseconds: 300));
    expect(find.text('Courses, mentors, options…'), findsOneWidget);
    expect(find.text('Course library'), findsOneWidget);

    await tester.tap(find.text('My Learning').last);
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

  testWidgets('Hero Explore courses scrolls to Most popular courses',
      (tester) async {
    await pumpApp(tester);

    await tester.tap(find.text('Explore courses'));
    await tester.pump();
    for (var i = 0; i < 40; i++) {
      await tester.pump(const Duration(milliseconds: 50));
      if (find.text('Most popular courses').evaluate().isNotEmpty) break;
    }

    expect(find.text('Most popular courses'), findsOneWidget);
    final popular = tester.getRect(find.text('Most popular courses'));
    expect(popular.top, lessThan(820));
    expect(popular.top, greaterThan(-40));
  });

  testWidgets('Hero Live rooms scrolls to Upcoming live classes',
      (tester) async {
    await pumpApp(tester);

    await tester.tap(find.text('Live rooms'));
    await tester.pump();
    for (var i = 0; i < 50; i++) {
      await tester.pump(const Duration(milliseconds: 50));
      if (find.text('Upcoming live classes').evaluate().isNotEmpty) break;
    }

    expect(find.text('Upcoming live classes'), findsOneWidget);
    final live = tester.getRect(find.text('Upcoming live classes'));
    expect(live.top, lessThan(820));
    expect(live.top, greaterThan(-40));
  });

  testWidgets('Popular Categories open matching Search libraries',
      (tester) async {
    await pumpApp(tester);

    Future<void> expectLibrary({
      required String tile,
      required String libraryTitle,
      required String sampleCourse,
    }) async {
      await tester.tap(find.text('Home'));
      await tester.pump(const Duration(milliseconds: 250));
      await tester.ensureVisible(find.text(tile));
      await tester.pump(const Duration(milliseconds: 100));
      await tester.tap(find.text(tile));
      await tester.pump(const Duration(milliseconds: 450));
      expect(find.text('Courses, mentors, options…'), findsOneWidget);
      expect(find.text('$libraryTitle library'), findsOneWidget);
      expect(find.text(sampleCourse), findsOneWidget);
    }

    await expectLibrary(
      tile: 'Stock Market Investing',
      libraryTitle: 'Stock Market Investing',
      sampleCourse: 'How to Build a 10-Year Stock Portfolio',
    );
    await expectLibrary(
      tile: 'Option Trading',
      libraryTitle: 'Option Trading',
      sampleCourse: 'Options from Zero',
    );
    await expectLibrary(
      tile: 'Stock Market Basics',
      libraryTitle: 'Stock Market Basics',
      sampleCourse: 'Your First 30 Days in Markets',
    );
    await expectLibrary(
      tile: 'Technical Analysis',
      libraryTitle: 'Technical Analysis',
      sampleCourse: 'Candlestick Context Course',
    );
    await expectLibrary(
      tile: 'Crypto',
      libraryTitle: 'Crypto',
      sampleCourse: 'Crypto Spot & Risk Basics',
    );
    await expectLibrary(
      tile: 'Trading Strategies',
      libraryTitle: 'Trading Strategies',
      sampleCourse: 'EMA Pullback Swing System',
    );
  });

  testWidgets('Search course card opens classroom detail', (tester) async {
    await pumpApp(tester);
    await tester.tap(find.text('Search'));
    await tester.pump(const Duration(milliseconds: 300));
    final course = find.text('Intraday Breakout Blueprint').hitTestable();
    expect(course, findsOneWidget);
    await tester.tap(course);
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 400));
    expect(find.text('Classroom'), findsOneWidget);
    expect(find.text('Continue'), findsOneWidget);
  });

  testWidgets('Profile My certificates opens completed classroom',
      (tester) async {
    await pumpApp(tester);
    await tester.tap(find.text('Profile'));
    await tester.pump(const Duration(milliseconds: 300));
    await tester.tap(find.text('My certificates').hitTestable());
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 400));
    expect(find.text('Download'), findsOneWidget);
    expect(
      find.text('Your First 30 Days in Markets').hitTestable(),
      findsOneWidget,
    );
  });

  testWidgets('Profile purchases open invoice detail', (tester) async {
    await pumpApp(tester);
    await tester.tap(find.text('Profile'));
    await tester.pump(const Duration(milliseconds: 300));
    await tester.tap(find.text('Purchases & Invoices').hitTestable());
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 400));
    await tester.tap(find.text('Options from Zero').hitTestable());
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 400));
    expect(find.text('Amount paid'), findsOneWidget);
  });

  testWidgets('Profile Help & FAQs opens FAQ list', (tester) async {
    await pumpApp(tester);
    await tester.tap(find.text('Profile'));
    await tester.pump(const Duration(milliseconds: 300));
    await tester.tap(find.text('Help & FAQs').hitTestable());
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 400));
    expect(find.text('Do I need an account?'), findsOneWidget);
  });
}
