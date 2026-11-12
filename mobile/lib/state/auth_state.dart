import 'package:flutter/widgets.dart';

/// Simple local/mock auth flag for v1 sample screens.
class AuthState extends ChangeNotifier {
  AuthState({bool signedIn = true}) : _signedIn = signedIn;

  bool _signedIn;

  bool get isSignedIn => _signedIn;

  void signIn() {
    if (_signedIn) return;
    _signedIn = true;
    notifyListeners();
  }

  void signOut() {
    if (!_signedIn) return;
    _signedIn = false;
    notifyListeners();
  }

  void toggle() => _signedIn ? signOut() : signIn();
}

class AuthScope extends InheritedNotifier<AuthState> {
  const AuthScope({
    super.key,
    required AuthState notifier,
    required super.child,
  }) : super(notifier: notifier);

  static AuthState of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<AuthScope>();
    final auth = scope?.notifier;
    if (auth == null) {
      throw FlutterError.fromParts(<DiagnosticsNode>[
        ErrorSummary('AuthScope not found'),
        ErrorDescription(
          'Wrap the app with AuthScope before reading AuthState.of(context).',
        ),
      ]);
    }
    return auth;
  }

  static AuthState read(BuildContext context) {
    final scope = context.getInheritedWidgetOfExactType<AuthScope>();
    final auth = scope?.notifier;
    if (auth == null) {
      throw FlutterError.fromParts(<DiagnosticsNode>[
        ErrorSummary('AuthScope not found'),
        ErrorDescription(
          'Wrap the app with AuthScope before reading AuthState.read(context).',
        ),
      ]);
    }
    return auth;
  }
}
