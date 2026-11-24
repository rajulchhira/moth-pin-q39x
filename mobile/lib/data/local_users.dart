import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

/// Local learner accounts — mirrors website `tradeshalaUsers` + `ensurePublicDemoUsers`.
class LocalUser {
  const LocalUser({
    required this.name,
    required this.email,
    required this.password,
    this.status = 'active',
    this.created,
  });

  final String name;
  final String email;
  final String password;
  final String status;
  final String? created;

  Map<String, dynamic> toJson() => {
        'name': name,
        'email': email,
        'password': password,
        'status': status,
        if (created != null) 'created': created,
      };

  factory LocalUser.fromJson(Map<String, dynamic> j) => LocalUser(
        name: '${j['name'] ?? ''}',
        email: '${j['email'] ?? ''}'.toLowerCase(),
        password: '${j['password'] ?? ''}',
        status: '${j['status'] ?? 'active'}',
        created: j['created']?.toString(),
      );
}

abstract final class LocalUsers {
  static const _key = 'bizgarh_local_users_v1';

  /// Same seed as www `ensurePublicDemoUsers` — public Login works after install.
  static const demoSeed = <LocalUser>[
    LocalUser(
      name: 'Ritesh Kulkarni',
      email: 'ritesh@gmail.com',
      password: 'student123',
      created: '2026-08-12T10:00:00.000Z',
    ),
    LocalUser(
      name: 'Sneha Bansal',
      email: 'sneha@gmail.com',
      password: 'student123',
      created: '2026-08-18T10:00:00.000Z',
    ),
    LocalUser(
      name: 'Aditya Menon',
      email: 'aditya@gmail.com',
      password: 'student123',
      created: '2026-09-01T10:00:00.000Z',
    ),
    LocalUser(
      name: 'Kavya Iyer',
      email: 'kavya@gmail.com',
      password: 'student123',
      created: '2026-09-04T10:00:00.000Z',
    ),
    LocalUser(
      name: 'Harsh Patel',
      email: 'harsh@gmail.com',
      password: 'student123',
      created: '2026-09-08T10:00:00.000Z',
    ),
  ];

  /// Primary demo ID for sideload / Play internal testing.
  static const demoEmail = 'ritesh@gmail.com';
  static const demoPassword = 'student123';

  static Future<List<LocalUser>> load() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_key);
    final list = <LocalUser>[];
    if (raw != null && raw.isNotEmpty) {
      try {
        final decoded = jsonDecode(raw);
        if (decoded is List) {
          for (final row in decoded) {
            if (row is Map<String, dynamic>) {
              list.add(LocalUser.fromJson(row));
            } else if (row is Map) {
              list.add(LocalUser.fromJson(Map<String, dynamic>.from(row)));
            }
          }
        }
      } catch (_) {
        /* corrupt — reseed */
      }
    }
    var changed = false;
    for (final demo in demoSeed) {
      final i = list.indexWhere((u) => u.email == demo.email);
      if (i < 0) {
        list.add(demo);
        changed = true;
      } else if (list[i].password.isEmpty) {
        list[i] = LocalUser(
          name: list[i].name.isNotEmpty ? list[i].name : demo.name,
          email: demo.email,
          password: demo.password,
          status: list[i].status,
          created: list[i].created ?? demo.created,
        );
        changed = true;
      }
    }
    if (changed || raw == null) await _save(prefs, list);
    return list;
  }

  static Future<void> _save(
    SharedPreferences prefs,
    List<LocalUser> list,
  ) async {
    await prefs.setString(
      _key,
      jsonEncode(list.map((u) => u.toJson()).toList()),
    );
  }

  static Future<LocalUser?> find(String email) async {
    final list = await load();
    final key = email.trim().toLowerCase();
    try {
      return list.firstWhere((u) => u.email == key);
    } catch (_) {
      return null;
    }
  }

  static Future<void> upsert(LocalUser user) async {
    final prefs = await SharedPreferences.getInstance();
    final list = await load();
    final key = user.email.toLowerCase();
    final i = list.indexWhere((u) => u.email == key);
    final next = LocalUser(
      name: user.name,
      email: key,
      password: user.password,
      status: user.status,
      created: user.created ?? DateTime.now().toUtc().toIso8601String(),
    );
    if (i < 0) {
      list.add(next);
    } else {
      list[i] = next;
    }
    await _save(prefs, list);
  }
}
