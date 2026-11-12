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

  /// Never throws — missing scope falls back to a signed-in sample user.
  static AuthState of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<AuthScope>();
    return scope?.notifier ?? AuthState(signedIn: true);
  }

  static AuthState read(BuildContext context) {
    final scope = context.getInheritedWidgetOfExactType<AuthScope>();
    return scope?.notifier ?? AuthState(signedIn: true);
  }
}
