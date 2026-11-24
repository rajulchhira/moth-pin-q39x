import 'package:bizgarh_mobile/data/local_users.dart';
import 'package:bizgarh_mobile/main.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() async {
    SharedPreferences.setMockInitialValues({});
  });

  Future<void> pumpApp(WidgetTester tester) async {
    await tester.binding.setSurfaceSize(const Size(390, 844));
    addTearDown(() => tester.binding.setSurfaceSize(null));
    await tester.pumpWidget(const BizgarhApp());
    await tester.pump();
    // Boot + restore session
    await tester.pump(const Duration(milliseconds: 200));
    await tester.pump(const Duration(milliseconds: 1700));
  }

  Future<void> signInDemo(WidgetTester tester) async {
    await tester.tap(find.text('Profile'));
    await tester.pump(const Duration(milliseconds: 300));
    await tester.tap(find.text('Sign in').hitTestable().first);
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 400));
    expect(find.text('Welcome back'), findsOneWidget);
    final fields = find.byType(TextField);
    expect(fields, findsWidgets);
    await tester.enterText(fields.at(0), LocalUsers.demoEmail);
    await tester.enterText(fields.at(1), LocalUsers.demoPassword);
    await tester.tap(find.widgetWithText(FilledButton, 'Login'));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 600));
    expect(find.text('Ritesh Kulkarni'), findsWidgets);
  }

  testWidgets('Bizgarh shell shows Home brand and bottom tabs', (tester) async {
    await pumpApp(tester);

    expect(find.text('Bizgarh'), findsWidgets);
    expect(find.text('Welcome!'), findsOneWidget);
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
    expect(find.textContaining('signed out'), findsOneWidget);

    await tester.tap(find.text('Profile'));
    await tester.pump(const Duration(milliseconds: 300));
    expect(find.text('Welcome to Bizgarh'), findsOneWidget);
    expect(find.text('Settings'), findsOneWidget);
    expect(find.text('Saved item'), findsNothing);
    expect(find.text('Frequently asked questions'), findsNothing);
    expect(find.text('Help & FAQs'), findsOneWidget);
    expect(find.text('Sign in'), findsWidgets);
  });

  testWidgets('Login with demo credentials opens signed-in profile',
      (tester) async {
    await pumpApp(tester);
    await signInDemo(tester);
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

  testWidgets('Search shows Slingshot as the only classroom', (tester) async {
    await pumpApp(tester);
    await tester.tap(find.text('Search'));
    await tester.pump(const Duration(milliseconds: 300));
    expect(find.text('Courses, mentors, options…'), findsOneWidget);
    expect(find.text('Slingshot: The 5-Minute Trading Edge'), findsWidgets);
    expect(find.text('Intraday Breakout Blueprint'), findsNothing);
    expect(find.text('Options from Zero'), findsNothing);
  });

  testWidgets('Search course card opens classroom detail', (tester) async {
    await pumpApp(tester);
    await signInDemo(tester);
    await tester.tap(find.text('Search'));
    await tester.pump(const Duration(milliseconds: 300));
    final course =
        find.text('Slingshot: The 5-Minute Trading Edge').hitTestable();
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
    await signInDemo(tester);
    await tester.tap(find.text('My certificates').hitTestable());
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 400));
    expect(find.text('Download'), findsOneWidget);
    expect(
      find.text('Slingshot: The 5-Minute Trading Edge').hitTestable(),
      findsOneWidget,
    );
  });

  testWidgets('Profile purchases open purchase detail with TXN', (tester) async {
    await pumpApp(tester);
    await signInDemo(tester);
    expect(find.text('Edit Profile'), findsOneWidget);
    await tester.tap(find.text('My Purchases').hitTestable());
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 400));
    await tester.tap(
      find.text('Slingshot: The 5-Minute Trading Edge').hitTestable().first,
    );
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 400));
    expect(find.text('Transaction ID'), findsOneWidget);
    expect(find.text('TXNDEMOSLING01'), findsOneWidget);
    expect(find.text('Amount'), findsOneWidget);
    expect(find.text('Date of purchase'), findsOneWidget);
  });

  testWidgets('Edit Profile shows dd-mm-yyyy DOB and no retired fields',
      (tester) async {
    await pumpApp(tester);
    await signInDemo(tester);
    await tester.tap(find.text('Edit Profile').hitTestable());
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 400));
    expect(find.text('Account info'), findsOneWidget);
    expect(find.text('dd-mm-yyyy'), findsOneWidget);
    expect(find.text('Male'), findsOneWidget);
    expect(find.text('Female'), findsOneWidget);
    expect(find.text('Prefer not to say'), findsNothing);
    expect(find.text('Interested in'), findsNothing);
    expect(find.text('Experience in the market'), findsNothing);
    expect(find.textContaining('Theme'), findsNothing);
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
