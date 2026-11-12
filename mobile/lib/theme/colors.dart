import 'package:flutter/material.dart';

/// Bizgarh brand tokens mirrored from the site CSS (`--teal` / indigo + magenta).
abstract final class BgColors {
  static const indigo = Color(0xFF4F46E5);
  static const indigoDark = Color(0xFF3730A3);
  static const indigoSoft = Color(0xFFEEF2FF);
  static const magenta = Color(0xFFE11D74);
  static const gold = Color(0xFFF59E0B);
  static const ink = Color(0xFF1E293B);
  static const inkDeep = Color(0xFF0F172A);
  static const muted = Color(0xFF64748B);
  static const line = Color(0xFFE2E8F0);
  static const canvas = Color(0xFFF8FAFC);
  static const white = Color(0xFFFFFFFF);

  static const heroGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [
      Color(0xFF0B1220),
      Color(0xFF1E1B4B),
      Color(0xFF4F46E5),
      Color(0xFFE11D74),
    ],
    stops: [0.0, 0.35, 0.72, 1.0],
  );

  static const brandGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [indigo, Color(0xFF7C3AED), magenta],
  );
}
