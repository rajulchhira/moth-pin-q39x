import 'dart:math';

import 'package:flutter/widgets.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../data/local_users.dart';

class AuthSession {
  const AuthSession({required this.name, required this.email});

  final String name;
  final String email;
}

class PendingSignup {
  const PendingSignup({
    required this.name,
    required this.email,
    required this.password,
    this.inviteCode = '',
  });

  final String name;
  final String email;
  final String password;
  final String inviteCode;
}

class PendingOtp {
  PendingOtp({
    required this.email,
    required this.code,
    required this.purpose,
    required this.expiresAt,
    this.signup,
  });

  final String email;
  final String code;
  final String purpose; // signup | reset
  final DateTime expiresAt;
  final PendingSignup? signup;
}

/// Learner auth — mirrors www login / create-account / Gmail OTP overlays.
class AuthState extends ChangeNotifier {
  AuthState({bool signedIn = false}) : _signedIn = signedIn;

  static const _sessionEmailKey = 'bizgarh_session_email';
  static const _sessionNameKey = 'bizgarh_session_name';

  bool _signedIn;
  String _name = '';
  String _email = '';
  PendingOtp? _pendingOtp;
  bool _ready = false;

  bool get isSignedIn => _signedIn;
  bool get isReady => _ready;
  String get name => _name;
  String get email => _email;
  AuthSession? get session =>
      _signedIn ? AuthSession(name: _name, email: _email) : null;
  PendingOtp? get pendingOtp => _pendingOtp;

  Future<void> restore() async {
    await LocalUsers.load();
    final prefs = await SharedPreferences.getInstance();
    final email = (prefs.getString(_sessionEmailKey) ?? '').trim().toLowerCase();
    final name = (prefs.getString(_sessionNameKey) ?? '').trim();
    if (email.isNotEmpty) {
      final user = await LocalUsers.find(email);
      if (user != null && user.status == 'active') {
        _signedIn = true;
        _email = user.email;
        _name = name.isNotEmpty ? name : user.name;
      } else {
        await prefs.remove(_sessionEmailKey);
        await prefs.remove(_sessionNameKey);
      }
    }
    _ready = true;
    notifyListeners();
  }

  Future<String?> login({
    required String email,
    required String password,
  }) async {
    final key = email.trim().toLowerCase();
    final pass = password;
    if (key.isEmpty || pass.isEmpty) return 'Enter email and password';
    final user = await LocalUsers.find(key);
    if (user == null || user.password != pass) {
      return 'Wrong email or password';
    }
    if (user.status == 'pending') {
      return 'This account is waiting for admin approval';
    }
    if (user.status == 'blocked') return 'This account is blocked';
    await _setSession(name: user.name, email: user.email);
    return null;
  }

  /// Start signup → OTP (Gmail-only, same rule as www).
  Future<String?> beginSignup({
    required String name,
    required String email,
    required String password,
    String inviteCode = '',
  }) async {
    final n = name.trim();
    final key = email.trim().toLowerCase();
    if (n.isEmpty) return 'Enter your name';
    if (!key.endsWith('@gmail.com')) {
      return 'Sign up with a Gmail address. We send the OTP there.';
    }
    if (password.length < 4) return 'Password must be at least 4 characters';
    final existing = await LocalUsers.find(key);
    if (existing != null) {
      return 'This email already has an account. Login instead.';
    }
    _issueOtp(
      email: key,
      purpose: 'signup',
      signup: PendingSignup(
        name: n,
        email: key,
        password: password,
        inviteCode: inviteCode.trim(),
      ),
    );
    return null;
  }

  Future<String?> beginPasswordReset(String email) async {
    final key = email.trim().toLowerCase();
    final user = await LocalUsers.find(key);
    if (user == null) return 'No account found for this email';
    if (user.password.isEmpty) {
      return 'This account uses a social login. Continue with that instead.';
    }
    _issueOtp(email: key, purpose: 'reset');
    return null;
  }

  void _issueOtp({
    required String email,
    required String purpose,
    PendingSignup? signup,
  }) {
    final code = (100000 + Random().nextInt(900000)).toString();
    _pendingOtp = PendingOtp(
      email: email,
      code: code,
      purpose: purpose,
      expiresAt: DateTime.now().add(const Duration(minutes: 5)),
      signup: signup,
    );
    notifyListeners();
  }

  void resendOtp() {
    final cur = _pendingOtp;
    if (cur == null) return;
    _issueOtp(email: cur.email, purpose: cur.purpose, signup: cur.signup);
  }

  void clearOtp() {
    _pendingOtp = null;
    notifyListeners();
  }

  Future<String?> verifyOtp(String typed) async {
    final row = _pendingOtp;
    if (row == null) return 'Start again';
    if (DateTime.now().isAfter(row.expiresAt)) {
      return 'OTP expired. Resend it.';
    }
    if (typed.trim() != row.code) return 'Wrong OTP';
    if (row.purpose == 'signup') {
      final s = row.signup;
      if (s == null) return 'Start again';
      await LocalUsers.upsert(
        LocalUser(
          name: s.name,
          email: s.email,
          password: s.password,
          status: 'active',
        ),
      );
      _pendingOtp = null;
      await _setSession(name: s.name, email: s.email);
      return null;
    }
    if (row.purpose == 'reset') {
      // Stay on OTP flow — caller collects new password next.
      return null;
    }
    return 'Start again';
  }

  Future<String?> completePasswordReset(String newPassword) async {
    final row = _pendingOtp;
    if (row == null || row.purpose != 'reset') return 'Start again';
    if (newPassword.length < 4) return 'Password must be at least 4 characters';
    final user = await LocalUsers.find(row.email);
    if (user == null) return 'No account found for this email';
    await LocalUsers.upsert(
      LocalUser(
        name: user.name,
        email: user.email,
        password: newPassword,
        status: user.status,
        created: user.created,
      ),
    );
    _pendingOtp = null;
    await _setSession(name: user.name, email: user.email);
    return null;
  }

  Future<void> _setSession({required String name, required String email}) async {
    _signedIn = true;
    _name = name;
    _email = email.toLowerCase();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_sessionEmailKey, _email);
    await prefs.setString(_sessionNameKey, _name);
    notifyListeners();
  }

  Future<void> signOut() async {
    _signedIn = false;
    _name = '';
    _email = '';
    _pendingOtp = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_sessionEmailKey);
    await prefs.remove(_sessionNameKey);
    notifyListeners();
  }
}

class AuthScope extends InheritedNotifier<AuthState> {
  const AuthScope({
    super.key,
    required AuthState notifier,
    required super.child,
  }) : super(notifier: notifier);

  static AuthState of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<AuthScope>();
    return scope?.notifier ?? AuthState(signedIn: false);
  }

  static AuthState read(BuildContext context) {
    final scope = context.getInheritedWidgetOfExactType<AuthScope>();
    return scope?.notifier ?? AuthState(signedIn: false);
  }
}
