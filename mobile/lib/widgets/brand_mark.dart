import 'package:flutter/material.dart';

import '../theme/bg_text.dart';

import '../theme/colors.dart';

class BrandMark extends StatelessWidget {
  const BrandMark({
    super.key,
    this.size = 40,
    this.showWordmark = true,
    this.light = false,
  });

  final double size;
  final bool showWordmark;
  final bool light;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(size * 0.28),
          child: Image.asset(
            'assets/bizgarh-icon.png',
            width: size,
            height: size,
            fit: BoxFit.cover,
            errorBuilder: (_, __, ___) => Container(
              width: size,
              height: size,
              decoration: const BoxDecoration(
                gradient: BgColors.brandGradient,
                shape: BoxShape.circle,
              ),
              alignment: Alignment.center,
              child: Text(
                'B',
                style: bgText(
                  color: Colors.white,
                  fontWeight: FontWeight.w800,
                  fontSize: size * 0.45,
                ),
              ),
            ),
          ),
        ),
        if (showWordmark) ...[
          const SizedBox(width: 10),
          Text(
            'Bizgarh',
            style: bgText(
              fontWeight: FontWeight.w800,
              fontSize: size * 0.52,
              letterSpacing: -0.8,
              color: light ? Colors.white : BgColors.inkDeep,
            ),
          ),
        ],
      ],
    );
  }
}
