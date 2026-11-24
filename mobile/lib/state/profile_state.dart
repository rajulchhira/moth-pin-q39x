import 'dart:typed_data';

import 'package:flutter/widgets.dart';

/// Editable learner profile mirrored from the website Account → Edit Profile pane.
class ProfileState extends ChangeNotifier {
  ProfileState({
    this.name = '',
    this.email = '',
    this.phone = '',
    this.gender = '',
    this.dobIso = '',
    this.country = 'India',
    this.state = '',
    this.city = '',
    this.pin = '',
    this.joined = '',
  });

  String name;
  String email;
  String phone;
  /// Male / Female only (no Prefer not to say).
  String gender;
  /// Stored as YYYY-MM-DD; UI shows dd-mm-yyyy.
  String dobIso;
  String country;
  String state;
  String city;
  String pin;
  String joined;
  Uint8List? photoBytes;

  /// Sync name/email after Login / Create account (www setUser).
  void applyAccount({required String name, required String email}) {
    this.name = name.trim();
    this.email = email.trim().toLowerCase();
    if (joined.isEmpty) {
      final now = DateTime.now();
      const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
      ];
      joined = 'Joined ${months[now.month - 1]} ${now.year}';
    }
    notifyListeners();
  }

  void clearAccount() {
    name = '';
    email = '';
    phone = '';
    gender = '';
    dobIso = '';
    state = '';
    city = '';
    pin = '';
    joined = '';
    photoBytes = null;
    notifyListeners();
  }

  String get initials {
    final parts = name
        .trim()
        .split(RegExp(r'\s+'))
        .where((p) => p.isNotEmpty)
        .toList();
    if (parts.isEmpty) return '?';
    if (parts.length == 1) {
      return parts.first.substring(0, 1).toUpperCase();
    }
    return (parts.first[0] + parts.last[0]).toUpperCase();
  }

  void update({
    String? name,
    String? phone,
    String? gender,
    String? dobIso,
    String? country,
    String? state,
    String? city,
    String? pin,
    Uint8List? photoBytes,
    bool clearPhoto = false,
  }) {
    if (name != null) this.name = name;
    if (phone != null) this.phone = phone;
    if (gender != null) {
      this.gender = (gender == 'Male' || gender == 'Female') ? gender : '';
    }
    if (dobIso != null) this.dobIso = dobIso;
    if (country != null) this.country = country;
    if (state != null) this.state = state;
    if (city != null) this.city = city;
    if (pin != null) this.pin = pin;
    if (clearPhoto) {
      this.photoBytes = null;
    } else if (photoBytes != null) {
      this.photoBytes = photoBytes;
    }
    notifyListeners();
  }

  void setPhoto(Uint8List bytes) {
    photoBytes = bytes;
    notifyListeners();
  }
}

class ProfileScope extends InheritedNotifier<ProfileState> {
  const ProfileScope({
    super.key,
    required ProfileState notifier,
    required super.child,
  }) : super(notifier: notifier);

  static ProfileState of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<ProfileScope>();
    return scope?.notifier ?? ProfileState();
  }

  static ProfileState read(BuildContext context) {
    final scope = context.getInheritedWidgetOfExactType<ProfileScope>();
    return scope?.notifier ?? ProfileState();
  }
}

/// DOB helpers matching www.bizgarh.com Edit Profile (dd-mm-yyyy display).
abstract final class DobFormat {
  static String toDisplay(String? raw) {
    if (raw == null || raw.trim().isEmpty) return '';
    final v = raw.trim();
    final iso = RegExp(r'^(\d{4})-(\d{2})-(\d{2})$').firstMatch(v);
    if (iso != null) {
      return '${iso.group(3)}-${iso.group(2)}-${iso.group(1)}';
    }
    final dmy = RegExp(r'^(\d{2})-(\d{2})-(\d{4})$').firstMatch(v);
    if (dmy != null) return v;
    return v;
  }

  static String maskDigits(String raw) {
    final digits = raw.replaceAll(RegExp(r'\D'), '');
    final buf = StringBuffer();
    for (var i = 0; i < digits.length && i < 8; i++) {
      if (i == 2 || i == 4) buf.write('-');
      buf.write(digits[i]);
    }
    return buf.toString();
  }

  /// Returns YYYY-MM-DD or null if incomplete/invalid.
  static String? toIso(String display) {
    final m = RegExp(r'^(\d{2})-(\d{2})-(\d{4})$').firstMatch(display.trim());
    if (m == null) return null;
    final dd = int.tryParse(m.group(1)!);
    final mm = int.tryParse(m.group(2)!);
    final yyyy = int.tryParse(m.group(3)!);
    if (dd == null || mm == null || yyyy == null) return null;
    if (mm < 1 || mm > 12 || dd < 1 || dd > 31 || yyyy < 1900 || yyyy > 2100) {
      return null;
    }
    try {
      final dt = DateTime(yyyy, mm, dd);
      if (dt.day != dd || dt.month != mm || dt.year != yyyy) return null;
      return '${yyyy.toString().padLeft(4, '0')}-'
          '${mm.toString().padLeft(2, '0')}-'
          '${dd.toString().padLeft(2, '0')}';
    } catch (_) {
      return null;
    }
  }
}
