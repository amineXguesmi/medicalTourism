import 'package:flutter/material.dart';

import '../theme/medtour_colors.dart';

class StatusChip extends StatelessWidget {
  const StatusChip({
    super.key,
    required this.label,
    required this.icon,
    required this.foreground,
    required this.background,
  });

  final String label;
  final IconData icon;
  final Color foreground;
  final Color background;

  factory StatusChip.verified(String label) {
    return StatusChip(
      label: label,
      icon: Icons.verified_outlined,
      foreground: MedTourColors.success500,
      background: MedTourColors.success50,
    );
  }

  factory StatusChip.warning(String label) {
    return StatusChip(
      label: label,
      icon: Icons.info_outline,
      foreground: MedTourColors.warning400,
      background: MedTourColors.warning50,
    );
  }

  factory StatusChip.attention(String label) {
    return StatusChip(
      label: label,
      icon: Icons.shield_outlined,
      foreground: MedTourColors.attention500,
      background: MedTourColors.attention50,
    );
  }

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: foreground.withAlpha(70)),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: foreground, size: 15),
            const SizedBox(width: 6),
            Text(
              label,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                color: foreground,
                fontSize: 12,
                fontWeight: FontWeight.w800,
                letterSpacing: 0,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
