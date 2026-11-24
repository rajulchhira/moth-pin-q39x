import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'screens/shell.dart';
import 'state/auth_state.dart';
import 'state/profile_state.dart';
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
  final AuthState _auth = AuthState(signedIn: false);
  final ProfileState _profile = ProfileState();
  bool _booting = true;

  @override
  void initState() {
    super.initState();
    _boot();
  }

  Future<void> _boot() async {
    await _auth.restore();
    if (_auth.isSignedIn) {
      _profile.applyAccount(name: _auth.name, email: _auth.email);
    }
    if (mounted) setState(() => _booting = false);
  }

  @override
  void dispose() {
    _auth.dispose();
    _profile.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Light theme only — matches www.bizgarh.com (no Theme / dark toggle).
    final light = AppTheme.light();
    return AuthScope(
      notifier: _auth,
      child: ProfileScope(
        notifier: _profile,
        child: MaterialApp(
          title: 'Bizgarh',
          debugShowCheckedModeBanner: false,
          theme: light,
          darkTheme: light,
          themeMode: ThemeMode.light,
          home: _booting
              ? const Scaffold(
                  backgroundColor: BgColors.canvas,
                  body: Center(child: CircularProgressIndicator()),
                )
              : const AppShell(),
          builder: (context, child) {
            return ColoredBox(
              color: BgColors.canvas,
              child: child ?? const SizedBox.shrink(),
            );
          },
        ),
      ),
    );
  }
}
