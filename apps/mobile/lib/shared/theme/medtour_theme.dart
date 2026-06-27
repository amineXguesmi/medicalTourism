import 'package:flutter/material.dart';

import 'medtour_colors.dart';

abstract final class MedTourTheme {
  static ThemeData light() {
    const scheme = ColorScheme(
      brightness: Brightness.light,
      primary: MedTourColors.brand600,
      onPrimary: MedTourColors.neutral0,
      secondary: MedTourColors.action500,
      onSecondary: MedTourColors.neutral0,
      tertiary: MedTourColors.warning400,
      onTertiary: MedTourColors.neutral900,
      error: MedTourColors.attention500,
      onError: MedTourColors.neutral0,
      surface: MedTourColors.neutral0,
      onSurface: MedTourColors.neutral900,
    );

    final base = ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      scaffoldBackgroundColor: MedTourColors.neutral50,
      fontFamily: 'Roboto',
    );

    return base.copyWith(
      appBarTheme: const AppBarTheme(
        backgroundColor: MedTourColors.neutral50,
        foregroundColor: MedTourColors.neutral900,
        centerTitle: false,
        elevation: 0,
        scrolledUnderElevation: 0,
      ),
      cardTheme: const CardThemeData(
        color: MedTourColors.neutral0,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(8)),
          side: BorderSide(color: MedTourColors.neutral200),
        ),
      ),
      chipTheme: base.chipTheme.copyWith(
        backgroundColor: MedTourColors.neutral0,
        selectedColor: MedTourColors.brand100,
        disabledColor: MedTourColors.neutral100,
        side: const BorderSide(color: MedTourColors.neutral200),
        labelStyle: const TextStyle(
          color: MedTourColors.neutral800,
          fontWeight: FontWeight.w600,
        ),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: MedTourColors.brand600,
          foregroundColor: MedTourColors.neutral0,
          minimumSize: const Size(44, 48),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          textStyle: const TextStyle(fontWeight: FontWeight.w700),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: MedTourColors.brand700,
          minimumSize: const Size(44, 46),
          side: const BorderSide(color: MedTourColors.brand200),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          textStyle: const TextStyle(fontWeight: FontWeight.w700),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: MedTourColors.neutral0,
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 14,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: MedTourColors.neutral200),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: MedTourColors.neutral200),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(
            color: MedTourColors.action300,
            width: 2,
          ),
        ),
        hintStyle: const TextStyle(color: MedTourColors.neutral500),
      ),
      textTheme: base.textTheme.copyWith(
        headlineSmall: base.textTheme.headlineSmall?.copyWith(
          color: MedTourColors.neutral900,
          fontWeight: FontWeight.w800,
          letterSpacing: 0,
        ),
        titleLarge: base.textTheme.titleLarge?.copyWith(
          color: MedTourColors.neutral900,
          fontWeight: FontWeight.w800,
          letterSpacing: 0,
        ),
        titleMedium: base.textTheme.titleMedium?.copyWith(
          color: MedTourColors.neutral900,
          fontWeight: FontWeight.w700,
          letterSpacing: 0,
        ),
        bodyMedium: base.textTheme.bodyMedium?.copyWith(
          color: MedTourColors.neutral700,
          height: 1.45,
          letterSpacing: 0,
        ),
        labelLarge: base.textTheme.labelLarge?.copyWith(
          fontWeight: FontWeight.w700,
          letterSpacing: 0,
        ),
      ),
    );
  }
}
