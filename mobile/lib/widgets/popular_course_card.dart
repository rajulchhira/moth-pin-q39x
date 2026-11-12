import 'package:flutter/material.dart';

import '../data/sample_data.dart';
import '../models/course.dart';
import '../theme/bg_text.dart';
import '../theme/colors.dart';
import 'category_glyph.dart';

/// Course card styled like the website “Stock market courses for everyone”
/// strip: instructor portrait thumb, overlay title, rating, learners, price.
///
/// Every card uses the same fixed [cardWidth] × [cardHeight] so the marquee
/// row stays uniform regardless of title length.
class PopularCourseCard extends StatelessWidget {
  const PopularCourseCard({super.key, required this.course});

  final Course course;

  // Portrait rectangle (taller than wide) — not square.
  static const double cardWidth = 168;
  static const double cardHeight = 320;
  static const double imageHeight = 210;
  static const double textBlockHeight = cardHeight - imageHeight; // 110

  int get _savePct {
    if (course.oldPrice <= 0 || course.oldPrice <= course.price) return 0;
    return (((course.oldPrice - course.price) / course.oldPrice) * 100).round();
  }

  @override
  Widget build(BuildContext context) {
    final photo = SampleData.photoAssetForInstructor(course.instructor);
    final colors = course.coverColors.map(Color.new).toList();
    final save = _savePct;

    return SizedBox(
      width: cardWidth,
      height: cardHeight,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: cardWidth,
            height: imageHeight,
            child: ClipRRect(
              borderRadius: BorderRadius.circular(14),
              child: Stack(
                fit: StackFit.expand,
                children: [
                  DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: colors.length == 1
                            ? [colors.first, colors.first]
                            : colors,
                      ),
                    ),
                  ),
                  if (photo != null)
                    Align(
                      alignment: Alignment.bottomRight,
                      child: FractionallySizedBox(
                        widthFactor: 0.72,
                        heightFactor: 1.08,
                        child: ShaderMask(
                          blendMode: BlendMode.dstIn,
                          shaderCallback: (bounds) => const LinearGradient(
                            begin: Alignment.centerLeft,
                            end: Alignment.centerRight,
                            colors: [Colors.transparent, Colors.black],
                            stops: [0.0, 0.22],
                          ).createShader(bounds),
                          child: Image.asset(
                            photo,
                            fit: BoxFit.cover,
                            alignment: const Alignment(0, -0.55),
                            errorBuilder: (_, __, ___) =>
                                const SizedBox.shrink(),
                          ),
                        ),
                      ),
                    ),
                  Positioned(
                    left: 12,
                    top: 14,
                    right: 88,
                    child: Text(
                      course.coverLabel,
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis,
                      style: bgText(
                        color: Colors.white,
                        fontWeight: FontWeight.w800,
                        fontSize: 16,
                        height: 1.05,
                        letterSpacing: 0.2,
                      ),
                    ),
                  ),
                  Positioned(
                    left: 10,
                    bottom: 10,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 3,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.16),
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: Text(
                        'Bizgarh',
                        style: bgText(
                          color: Colors.white,
                          fontWeight: FontWeight.w700,
                          fontSize: 11,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          SizedBox(
            width: cardWidth,
            height: textBlockHeight,
            child: Padding(
              padding: const EdgeInsets.only(top: 8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SizedBox(
                    height: 36, // always reserve 2 title lines
                    child: Text(
                      course.title,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: bgText(
                        fontWeight: FontWeight.w800,
                        fontSize: 14,
                        height: 1.25,
                        color: BgColors.inkDeep,
                      ),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(
                        Icons.star_rounded,
                        size: 15,
                        color: BgColors.gold,
                      ),
                      const SizedBox(width: 2),
                      Text(
                        course.rating.toStringAsFixed(1),
                        style: bgText(
                          fontWeight: FontWeight.w800,
                          fontSize: 12.5,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '${course.learners} learners · by ${course.instructor}',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: bgText(
                      color: BgColors.muted,
                      fontWeight: FontWeight.w600,
                      fontSize: 11.5,
                    ),
                  ),
                  const Spacer(),
                  Text.rich(
                    TextSpan(
                      children: [
                        TextSpan(
                          text: '₹${course.price}',
                          style: bgText(
                            fontWeight: FontWeight.w800,
                            fontSize: 14.5,
                            color: BgColors.inkDeep,
                          ),
                        ),
                        if (course.oldPrice > course.price)
                          TextSpan(
                            text: '  ₹${course.oldPrice}',
                            style: bgText(
                              fontWeight: FontWeight.w600,
                              fontSize: 12,
                              color: BgColors.muted,
                              decoration: TextDecoration.lineThrough,
                            ),
                          ),
                        if (save > 0)
                          TextSpan(
                            text: '  SAVE $save%',
                            style: bgText(
                              fontWeight: FontWeight.w800,
                              fontSize: 11.5,
                              color: const Color(0xFFEA580C),
                            ),
                          ),
                      ],
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class ExpertPortraitCard extends StatelessWidget {
  const ExpertPortraitCard({super.key, required this.mentor});

  final Mentor mentor;

  @override
  Widget build(BuildContext context) {
    final accent = Color(mentor.accent);
    return ClipRRect(
      borderRadius: BorderRadius.circular(18),
      child: Stack(
        fit: StackFit.expand,
        children: [
          ColoredBox(color: accent.withOpacity(0.85)),
          if (mentor.photoAsset != null)
            Image.asset(
              mentor.photoAsset!,
              fit: BoxFit.cover,
              alignment: Alignment.topCenter,
              errorBuilder: (_, __, ___) => _InitialsFallback(mentor: mentor),
            )
          else
            _InitialsFallback(mentor: mentor),
          const DecoratedBox(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Colors.transparent,
                  Colors.transparent,
                  Color(0x8C000000),
                  Color(0xCC000000),
                ],
                stops: [0.0, 0.42, 0.72, 1.0],
              ),
            ),
          ),
          Positioned(
            left: 12,
            right: 12,
            bottom: 14,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  mentor.name,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: bgText(
                    color: Colors.white,
                    fontWeight: FontWeight.w800,
                    fontSize: 15,
                    letterSpacing: -0.3,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  mentor.title,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: bgText(
                    color: Colors.white.withOpacity(0.88),
                    fontWeight: FontWeight.w600,
                    fontSize: 12,
                    height: 1.25,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _InitialsFallback extends StatelessWidget {
  const _InitialsFallback({required this.mentor});

  final Mentor mentor;

  @override
  Widget build(BuildContext context) {
    final accent = Color(mentor.accent);
    return ColoredBox(
      color: accent,
      child: Center(
        child: Text(
          mentor.initials,
          style: bgText(
            color: Colors.white,
            fontWeight: FontWeight.w800,
            fontSize: 36,
          ),
        ),
      ),
    );
  }
}

class PopularCategoryTile extends StatelessWidget {
  const PopularCategoryTile({super.key, required this.category});

  final PopularCategory category;

  Color get _tileTint {
    switch (category.kind) {
      case 'investing':
        return const Color(0xFFECFDF5);
      case 'cepe':
        return const Color(0xFFF5F3FF);
      case 'bars':
        return const Color(0xFFEFF6FF);
      case 'candle':
        return const Color(0xFFF0FDF4);
      case 'crypto':
        return const Color(0xFFFFFBEB);
      case 'strategy':
        return const Color(0xFFFDF2F8);
      default:
        return const Color(0xFFF1F5F9);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Expanded(
          child: Stack(
            clipBehavior: Clip.none,
            children: [
              Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  color: _tileTint,
                  borderRadius: BorderRadius.circular(18),
                ),
                alignment: Alignment.center,
                child: CategoryGlyph(kind: category.kind, size: 58),
              ),
              if (category.badge != null)
                Positioned(
                  top: 8,
                  right: 8,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                    decoration: BoxDecoration(
                      color: BgColors.magenta,
                      borderRadius: BorderRadius.circular(999),
                    ),
                    child: Text(
                      category.badge!,
                      style: bgText(
                        color: Colors.white,
                        fontWeight: FontWeight.w800,
                        fontSize: 9,
                        letterSpacing: 0.3,
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
        const SizedBox(height: 8),
        Text(
          category.title,
          textAlign: TextAlign.center,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
          style: bgText(
            fontWeight: FontWeight.w800,
            fontSize: 12,
            height: 1.2,
            color: BgColors.inkDeep,
          ),
        ),
      ],
    );
  }
}
