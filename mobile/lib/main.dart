import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'screens/profile_screen.dart';
import 'screens/shell.dart';
import 'state/auth_state.dart';
import 'theme/app_theme.dart';
import 'theme/colors.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ),
  );
  runApp(const BizgarhApp());
}

class BizgarhApp extends StatefulWidget {
  const BizgarhApp({super.key});

  @override
  State<BizgarhApp> createState() => _BizgarhAppState();
}

class _BizgarhAppState extends State<BizgarhApp> {
  final AuthState _auth = AuthState(signedIn: true);

  @override
  void dispose() {
    _auth.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final path = Uri.base.path;
    final initial = (path == '/shot/about' || path == '/shot/help') ? path : '/';

    return AuthScope(
      notifier: _auth,
      child: MaterialApp(
        title: 'Bizgarh',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.light(),
        initialRoute: initial,
        routes: {
          '/': (_) => const AppShell(),
          '/shot/about': (_) => const AboutUsScreen(),
          '/shot/help': (_) => const HelpFaqsScreen(),
        },
        builder: (context, child) {
          return ColoredBox(
            color: BgColors.canvas,
            child: child ?? const SizedBox.shrink(),
          );
        },
      ),
    );
  }
}
