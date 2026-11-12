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
    assert(scope != null, 'AuthScope not found');
    return scope!.notifier!;
  }

  static AuthState read(BuildContext context) {
    final scope = context.getInheritedWidgetOfExactType<AuthScope>();
    assert(scope != null, 'AuthScope not found');
    return scope!.notifier!;
  }
}
