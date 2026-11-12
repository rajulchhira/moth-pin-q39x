import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'screens/shell.dart';
import 'state/auth_state.dart';
import 'theme/app_theme.dart';
import 'theme/colors.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  FlutterError.onError = (details) {
    FlutterError.presentError(details);
    if (kReleaseMode) {
      debugPrint('FlutterError: ${details.exceptionAsString()}');
    }
  };

  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ),
  );

  runZonedGuarded(
    () => runApp(const BizgarhApp()),
    (error, stack) {
      debugPrint('Uncaught zone error: $error\n$stack');
    },
  );
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
    return AuthScope(
      notifier: _auth,
      child: MaterialApp(
        title: 'Bizgarh',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.light(),
        home: const AppShell(),
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
