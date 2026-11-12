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
    expect(find.text('Courses'), findsOneWidget);
    expect(find.text('Most popular courses'), findsOneWidget);
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
