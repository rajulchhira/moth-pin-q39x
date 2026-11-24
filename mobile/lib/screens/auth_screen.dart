import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../state/auth_state.dart';
import '../state/profile_state.dart';
import '../theme/bg_text.dart';
import '../theme/colors.dart';

/// Opens the public-site-style Login / Create account flow.
Future<bool> openAuthScreen(BuildContext context) async {
  final ok = await Navigator.of(context).push<bool>(
    MaterialPageRoute<bool>(builder: (_) => const AuthScreen()),
  );
  return ok == true;
}

enum _AuthPane { login, signup, forgot, otp, reset }

/// Mirrors www loginModal / signupModal / forgotModal / otpModal.
class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  _AuthPane _pane = _AuthPane.login;
  final _loginEmail = TextEditingController();
  final _loginPass = TextEditingController();
  final _signName = TextEditingController();
  final _signEmail = TextEditingController();
  final _signPass = TextEditingController();
  final _signCode = TextEditingController();
  final _forgotEmail = TextEditingController();
  final _resetPass = TextEditingController();
  final _otpDigits = List.generate(6, (_) => TextEditingController());
  final _otpFocus = List.generate(6, (_) => FocusNode());
  bool _busy = false;
  bool _obscureLogin = true;
  bool _obscureSign = true;
  bool _obscureReset = true;
  String? _error;

  @override
  void dispose() {
    _loginEmail.dispose();
    _loginPass.dispose();
    _signName.dispose();
    _signEmail.dispose();
    _signPass.dispose();
    _signCode.dispose();
    _forgotEmail.dispose();
    _resetPass.dispose();
    for (final c in _otpDigits) {
      c.dispose();
    }
    for (final f in _otpFocus) {
      f.dispose();
    }
    super.dispose();
  }

  void _applyProfile(AuthState auth) {
    final profile = ProfileScope.read(context);
    profile.applyAccount(
      name: auth.name,
      email: auth.email,
    );
  }

  Future<void> _run(Future<String?> Function() action) async {
    setState(() {
      _busy = true;
      _error = null;
    });
    final err = await action();
    if (!mounted) return;
    setState(() {
      _busy = false;
      _error = err;
    });
  }

  String get _otpTyped => _otpDigits.map((c) => c.text).join();

  @override
  Widget build(BuildContext context) {
    final auth = AuthScope.of(context);
    final pending = auth.pendingOtp;

    String title;
    String subtitle;
    switch (_pane) {
      case _AuthPane.login:
        title = 'Welcome back';
        subtitle = 'Login to continue your lessons.';
      case _AuthPane.signup:
        title = 'Join Bizgarh';
        subtitle = 'Create an account to enroll and track progress.';
      case _AuthPane.forgot:
        title = 'Forgot password';
        subtitle = 'We will send a Gmail OTP to reset it.';
      case _AuthPane.otp:
        title = 'Verify OTP';
        subtitle =
            'Enter the 6-digit code sent to ${pending?.email ?? 'your Gmail'}';
      case _AuthPane.reset:
        title = 'Set a new password';
        subtitle = 'Choose a password for ${pending?.email ?? 'your account'}';
    }

    return Scaffold(
      backgroundColor: BgColors.canvas,
      appBar: AppBar(
        backgroundColor: BgColors.canvas,
        surfaceTintColor: Colors.transparent,
        title: Text('Bizgarh', style: bgText(fontWeight: FontWeight.w800)),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
        children: [
          Text(
            title,
            style: bgText(
              fontWeight: FontWeight.w800,
              fontSize: 26,
              letterSpacing: -0.4,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            subtitle,
            style: bgText(
              fontWeight: FontWeight.w600,
              fontSize: 14,
              color: BgColors.muted,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 22),
          if (_error != null) ...[
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFFEE2E2),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                _error!,
                style: bgText(
                  fontWeight: FontWeight.w700,
                  fontSize: 13,
                  color: const Color(0xFFB91C1C),
                ),
              ),
            ),
            const SizedBox(height: 14),
          ],
          if (_pane == _AuthPane.login) ..._loginFields(auth),
          if (_pane == _AuthPane.signup) ..._signupFields(auth),
          if (_pane == _AuthPane.forgot) ..._forgotFields(auth),
          if (_pane == _AuthPane.otp) ..._otpFields(auth, pending),
          if (_pane == _AuthPane.reset) ..._resetFields(auth),
        ],
      ),
    );
  }

  List<Widget> _loginFields(AuthState auth) {
    return [
      _field(
        label: 'Email',
        controller: _loginEmail,
        keyboardType: TextInputType.emailAddress,
        autofill: const [AutofillHints.email],
      ),
      const SizedBox(height: 12),
      _field(
        label: 'Password',
        controller: _loginPass,
        obscure: _obscureLogin,
        autofill: const [AutofillHints.password],
        suffix: IconButton(
          onPressed: () => setState(() => _obscureLogin = !_obscureLogin),
          icon: Icon(
            _obscureLogin ? Icons.visibility_outlined : Icons.visibility_off_outlined,
          ),
        ),
      ),
      Align(
        alignment: Alignment.centerRight,
        child: TextButton(
          onPressed: _busy
              ? null
              : () => setState(() {
                    _pane = _AuthPane.forgot;
                    _error = null;
                    _forgotEmail.text = _loginEmail.text;
                  }),
          child: Text(
            'Forgot password?',
            style: bgText(fontWeight: FontWeight.w700, color: BgColors.indigo),
          ),
        ),
      ),
      const SizedBox(height: 8),
      _primary(
        label: 'Login',
        onPressed: _busy
            ? null
            : () => _run(() async {
                  final err = await auth.login(
                    email: _loginEmail.text,
                    password: _loginPass.text,
                  );
                  if (err != null) return err;
                  if (!mounted) return null;
                  _applyProfile(auth);
                  Navigator.of(context).pop(true);
                  return null;
                }),
      ),
      const SizedBox(height: 16),
      _switchRow(
        'New here?',
        'Create account',
        () => setState(() {
          _pane = _AuthPane.signup;
          _error = null;
        }),
      ),
    ];
  }

  List<Widget> _signupFields(AuthState auth) {
    return [
      _field(label: 'Name', controller: _signName, autofill: const [AutofillHints.name]),
      const SizedBox(height: 12),
      _field(
        label: 'Email',
        controller: _signEmail,
        keyboardType: TextInputType.emailAddress,
        hint: 'you@gmail.com',
        autofill: const [AutofillHints.email],
      ),
      const SizedBox(height: 12),
      _field(
        label: 'Password',
        controller: _signPass,
        obscure: _obscureSign,
        autofill: const [AutofillHints.newPassword],
        suffix: IconButton(
          onPressed: () => setState(() => _obscureSign = !_obscureSign),
          icon: Icon(
            _obscureSign ? Icons.visibility_outlined : Icons.visibility_off_outlined,
          ),
        ),
      ),
      const SizedBox(height: 12),
      _field(
        label: 'Invite / affiliate code',
        controller: _signCode,
        hint: 'Optional unless invite-only',
      ),
      const SizedBox(height: 18),
      _primary(
        label: 'Send Gmail OTP',
        onPressed: _busy
            ? null
            : () => _run(() async {
                  final err = await auth.beginSignup(
                    name: _signName.text,
                    email: _signEmail.text,
                    password: _signPass.text,
                    inviteCode: _signCode.text,
                  );
                  if (err != null) return err;
                  if (!mounted) return null;
                  setState(() => _pane = _AuthPane.otp);
                  return null;
                }),
      ),
      const SizedBox(height: 16),
      _switchRow(
        'Already have an account?',
        'Login',
        () => setState(() {
          _pane = _AuthPane.login;
          _error = null;
        }),
      ),
    ];
  }

  List<Widget> _forgotFields(AuthState auth) {
    return [
      _field(
        label: 'Email',
        controller: _forgotEmail,
        keyboardType: TextInputType.emailAddress,
      ),
      const SizedBox(height: 18),
      _primary(
        label: 'Send OTP',
        onPressed: _busy
            ? null
            : () => _run(() async {
                  final err = await auth.beginPasswordReset(_forgotEmail.text);
                  if (err != null) return err;
                  if (!mounted) return null;
                  setState(() => _pane = _AuthPane.otp);
                  return null;
                }),
      ),
      const SizedBox(height: 16),
      _switchRow(
        '',
        'Back to login',
        () => setState(() {
          _pane = _AuthPane.login;
          _error = null;
        }),
      ),
    ];
  }

  List<Widget> _otpFields(AuthState auth, PendingOtp? pending) {
    return [
      if (pending != null) ...[
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: BgColors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: BgColors.line),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Gmail · Inbox',
                style: bgText(
                  fontWeight: FontWeight.w800,
                  fontSize: 12,
                  color: BgColors.muted,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                'From Bizgarh <desk@bizgarh.com>\nTo ${pending.email}',
                style: bgText(fontWeight: FontWeight.w600, fontSize: 12, height: 1.35),
              ),
              const SizedBox(height: 10),
              Text(
                'Your verification code',
                style: bgText(fontWeight: FontWeight.w800, fontSize: 15),
              ),
              const SizedBox(height: 6),
              Text(
                pending.code,
                style: bgText(
                  fontWeight: FontWeight.w800,
                  fontSize: 28,
                  letterSpacing: 4,
                  color: BgColors.indigo,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                'This code expires in 5 minutes. Do not share it.',
                style: bgText(
                  fontWeight: FontWeight.w600,
                  fontSize: 12,
                  color: BgColors.muted,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 18),
      ],
      Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          for (var i = 0; i < 6; i++)
            SizedBox(
              width: 46,
              child: TextField(
                controller: _otpDigits[i],
                focusNode: _otpFocus[i],
                textAlign: TextAlign.center,
                keyboardType: TextInputType.number,
                maxLength: 1,
                inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                decoration: InputDecoration(
                  counterText: '',
                  filled: true,
                  fillColor: BgColors.white,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: BgColors.line),
                  ),
                ),
                style: bgText(fontWeight: FontWeight.w800, fontSize: 18),
                onChanged: (v) {
                  if (v.isNotEmpty && i < 5) {
                    _otpFocus[i + 1].requestFocus();
                  }
                  if (v.isEmpty && i > 0) {
                    _otpFocus[i - 1].requestFocus();
                  }
                },
              ),
            ),
        ],
      ),
      const SizedBox(height: 18),
      _primary(
        label: 'Verify & continue',
        onPressed: _busy
            ? null
            : () => _run(() async {
                  final err = await auth.verifyOtp(_otpTyped);
                  if (err != null) return err;
                  if (!mounted) return null;
                  if (auth.pendingOtp?.purpose == 'reset') {
                    setState(() => _pane = _AuthPane.reset);
                    return null;
                  }
                  _applyProfile(auth);
                  Navigator.of(context).pop(true);
                  return null;
                }),
      ),
      const SizedBox(height: 8),
      TextButton(
        onPressed: _busy
            ? null
            : () {
                auth.resendOtp();
                for (final c in _otpDigits) {
                  c.clear();
                }
                setState(() => _error = null);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(
                      'OTP sent to your Gmail',
                      style: bgText(fontWeight: FontWeight.w600),
                    ),
                  ),
                );
              },
        child: Text(
          'Resend OTP',
          style: bgText(fontWeight: FontWeight.w700, color: BgColors.indigo),
        ),
      ),
    ];
  }

  List<Widget> _resetFields(AuthState auth) {
    return [
      _field(
        label: 'New password',
        controller: _resetPass,
        obscure: _obscureReset,
        suffix: IconButton(
          onPressed: () => setState(() => _obscureReset = !_obscureReset),
          icon: Icon(
            _obscureReset ? Icons.visibility_outlined : Icons.visibility_off_outlined,
          ),
        ),
      ),
      const SizedBox(height: 18),
      _primary(
        label: 'Update password',
        onPressed: _busy
            ? null
            : () => _run(() async {
                  final err = await auth.completePasswordReset(_resetPass.text);
                  if (err != null) return err;
                  if (!mounted) return null;
                  _applyProfile(auth);
                  Navigator.of(context).pop(true);
                  return null;
                }),
      ),
    ];
  }

  Widget _field({
    required String label,
    required TextEditingController controller,
    TextInputType? keyboardType,
    bool obscure = false,
    String? hint,
    List<String>? autofill,
    Widget? suffix,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: bgText(fontWeight: FontWeight.w700, fontSize: 13)),
        const SizedBox(height: 6),
        TextField(
          controller: controller,
          keyboardType: keyboardType,
          obscureText: obscure,
          autofillHints: autofill,
          decoration: InputDecoration(
            hintText: hint,
            filled: true,
            fillColor: BgColors.white,
            suffixIcon: suffix,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: BorderSide(color: BgColors.line),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: BorderSide(color: BgColors.line),
            ),
          ),
          style: bgText(fontWeight: FontWeight.w600, fontSize: 15),
        ),
      ],
    );
  }

  Widget _primary({required String label, VoidCallback? onPressed}) {
    return FilledButton(
      onPressed: onPressed,
      style: FilledButton.styleFrom(
        backgroundColor: BgColors.indigo,
        foregroundColor: Colors.white,
        minimumSize: const Size.fromHeight(48),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      ),
      child: _busy
          ? const SizedBox(
              width: 22,
              height: 22,
              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
            )
          : Text(
              label,
              style: bgText(fontWeight: FontWeight.w800, color: Colors.white),
            ),
    );
  }

  Widget _switchRow(String lead, String action, VoidCallback onTap) {
    return Wrap(
      crossAxisAlignment: WrapCrossAlignment.center,
      children: [
        if (lead.isNotEmpty)
          Text(
            '$lead ',
            style: bgText(fontWeight: FontWeight.w600, color: BgColors.muted),
          ),
        TextButton(
          onPressed: _busy ? null : onTap,
          child: Text(
            action,
            style: bgText(fontWeight: FontWeight.w800, color: BgColors.indigo),
          ),
        ),
      ],
    );
  }
}
