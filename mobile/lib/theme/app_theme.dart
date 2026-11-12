import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';

import 'colors.dart';

abstract final class AppTheme {
  static ThemeData light() {
    final base = ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: BgColors.canvas,
      colorScheme: ColorScheme.fromSeed(
        seedColor: BgColors.indigo,
        primary: BgColors.indigo,
        secondary: BgColors.magenta,
        surface: BgColors.white,
        onSurface: BgColors.ink,
      ),
    );

    final textTheme = GoogleFonts.nunitoTextTheme(base.textTheme).apply(
      bodyColor: BgColors.ink,
      displayColor: BgColors.inkDeep,
    );

    return base.copyWith(
      textTheme: textTheme,
      appBarTheme: AppBarTheme(
        elevation: 0,
        scrolledUnderElevation: 0,
        backgroundColor: BgColors.canvas,
        foregroundColor: BgColors.inkDeep,
        systemOverlayStyle: SystemUiOverlayStyle.dark,
        titleTextStyle: GoogleFonts.nunito(
          fontWeight: FontWeight.w800,
          fontSize: 20,
          letterSpacing: -0.4,
          color: BgColors.inkDeep,
        ),
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: BgColors.white,
        indicatorColor: BgColors.indigoSoft,
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          final selected = states.contains(WidgetState.selected);
          return GoogleFonts.nunito(
            fontSize: 12,
            fontWeight: selected ? FontWeight.w800 : FontWeight.w600,
            color: selected ? BgColors.indigo : BgColors.muted,
          );
        }),
        iconTheme: WidgetStateProperty.resolveWith((states) {
          final selected = states.contains(WidgetState.selected);
          return IconThemeData(
            color: selected ? BgColors.indigo : BgColors.muted,
            size: 22,
          );
        }),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: BgColors.white,
        hintStyle: GoogleFonts.nunito(color: BgColors.muted, fontWeight: FontWeight.w600),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: BgColors.line),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: BgColors.line),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: BgColors.indigo, width: 1.5),
        ),
      ),
      dividerTheme: const DividerThemeData(color: BgColors.line, space: 1),
    );
  }
}
