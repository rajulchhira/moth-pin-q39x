import 'package:flutter/material.dart';

import '../data/sample_data.dart';
import '../models/course.dart';
import '../theme/bg_text.dart';
import '../theme/colors.dart';
import 'category_glyph.dart';

/// “Most popular courses” marquee card — horizontal ~3:2 cover, equal sizes.
/// Layout: gradient/image cover with uppercase topic label; below: bold title,
/// grey instructor, then star rating + price.
class PopularCourseCard extends StatelessWidget {
  const PopularCourseCard({super.key, required this.course});

  final Course course;

  // Horizontal rectangle: wider than tall (~3:2 cover).
  static const double cardWidth = 200;
  static const double imageHeight = 132; // ≈ 3:2 of 200
  static const double textBlockHeight = 78;
  static const double cardHeight = imageHeight + textBlockHeight; // 210

  @override
  Widget build(BuildContext context) {
    final photo = SampleData.photoAssetForInstructor(course.instructor);
    final colors = course.coverColors.map(Color.new).toList();

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
              borderRadius: BorderRadius.circular(16),
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
                    Opacity(
                      opacity: 0.42,
                      child: Image.asset(
                        photo,
                        fit: BoxFit.cover,
                        alignment: const Alignment(0, -0.35),
                        errorBuilder: (_, __, ___) => const SizedBox.shrink(),
                      ),
                    ),
                  Positioned(
                    left: 14,
                    top: 14,
                    right: 14,
                    child: Text(
                      course.coverLabel.toUpperCase(),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: bgText(
                        color: Colors.white,
                        fontWeight: FontWeight.w800,
                        fontSize: 15,
                        height: 1.1,
                        letterSpacing: -0.2,
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
              padding: const EdgeInsets.only(top: 6),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SizedBox(
                    height: 34, // always reserve 2 title lines
                    child: Text(
                      course.title,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: bgText(
                        fontWeight: FontWeight.w800,
                        fontSize: 13,
                        height: 1.2,
                        color: BgColors.inkDeep,
                      ),
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    course.instructor,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: bgText(
                      color: BgColors.muted,
                      fontWeight: FontWeight.w600,
                      fontSize: 11.5,
                    ),
                  ),
                  const Spacer(),
                  Row(
                    children: [
                      const Icon(
                        Icons.star_rounded,
                        size: 14,
                        color: BgColors.gold,
                      ),
                      const SizedBox(width: 2),
                      Text(
                        course.rating.toStringAsFixed(1),
                        style: bgText(
                          fontWeight: FontWeight.w800,
                          fontSize: 12,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Text(
                        '₹${course.price}',
                        style: bgText(
                          fontWeight: FontWeight.w800,
                          fontSize: 12.5,
                          color: BgColors.indigo,
                        ),
                      ),
                    ],
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

/// Equal-size category tile: horizontal rounded cover (like course cards) + label.
class PopularCategoryTile extends StatelessWidget {
  const PopularCategoryTile({super.key, required this.category});

  final PopularCategory category;

  /// Match Most popular course cover aspect (~3:2).
  static const double coverAspect = 3 / 2;
  static const double labelHeight = 34;

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
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        AspectRatio(
          aspectRatio: coverAspect,
          child: Stack(
            clipBehavior: Clip.none,
            children: [
              Positioned.fill(
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    color: _tileTint,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Center(
                    child: CategoryGlyph(kind: category.kind, size: 48),
                  ),
                ),
              ),
              if (category.badge != null)
                Positioned(
                  top: 8,
                  right: 8,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 7,
                      vertical: 3,
                    ),
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
        SizedBox(
          height: labelHeight,
          child: Text(
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
        ),
      ],
    );
  }
}

/// Website-style upcoming webinar card (banner + when / title / by / FREE).
class LiveWebinarCard extends StatelessWidget {
  const LiveWebinarCard({super.key, required this.item});

  final LiveClass item;

  static const double cardWidth = 260;
  static const double bannerHeight = 148;
  static const double cardHeight = 280;

  @override
  Widget build(BuildContext context) {
    final photo = SampleData.photoAssetForInstructor(item.mentor);
    final colors = item.coverColors.map(Color.new).toList();

    return SizedBox(
      width: cardWidth,
      height: cardHeight,
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: BgColors.white,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: BgColors.line),
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(18),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(
                width: cardWidth,
                height: bannerHeight,
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
                          widthFactor: 0.48,
                          heightFactor: 1,
                          child: Image.asset(
                            photo,
                            fit: BoxFit.cover,
                            alignment: Alignment.topCenter,
                            errorBuilder: (_, __, ___) =>
                                const SizedBox.shrink(),
                          ),
                        ),
                      ),
                    Positioned(
                      left: 14,
                      top: 14,
                      right: cardWidth * 0.42,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            item.tag.toUpperCase(),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: bgText(
                              color: Colors.white.withOpacity(0.82),
                              fontWeight: FontWeight.w800,
                              fontSize: 11,
                              letterSpacing: 0.4,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            item.title,
                            maxLines: 3,
                            overflow: TextOverflow.ellipsis,
                            style: bgText(
                              color: Colors.white,
                              fontWeight: FontWeight.w800,
                              fontSize: 15,
                              height: 1.2,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Positioned(
                      top: 12,
                      right: 12,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.16),
                          borderRadius: BorderRadius.circular(999),
                          border: Border.all(
                            color: Colors.white.withOpacity(0.28),
                          ),
                        ),
                        child: Text(
                          'Bizgarh',
                          style: bgText(
                            color: Colors.white,
                            fontWeight: FontWeight.w800,
                            fontSize: 10,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(14, 10, 14, 10),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        item.when,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: bgText(
                          color: BgColors.muted,
                          fontWeight: FontWeight.w700,
                          fontSize: 12,
                        ),
                      ),
                      const SizedBox(height: 4),
                      SizedBox(
                        height: 36,
                        child: Text(
                          item.title,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: bgText(
                            fontWeight: FontWeight.w800,
                            fontSize: 14,
                            height: 1.2,
                            color: BgColors.inkDeep,
                          ),
                        ),
                      ),
                      Text(
                        'by ${item.mentor}',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: bgText(
                          color: BgColors.muted,
                          fontWeight: FontWeight.w600,
                          fontSize: 12,
                        ),
                      ),
                      const Spacer(),
                      Row(
                        children: [
                          Text(
                            item.free ? 'FREE' : '₹${item.listPrice}',
                            style: bgText(
                              fontWeight: FontWeight.w800,
                              fontSize: 14,
                              color: BgColors.indigo,
                            ),
                          ),
                          if (item.free) ...[
                            const SizedBox(width: 8),
                            Text(
                              '₹${item.listPrice}',
                              style: bgText(
                                fontWeight: FontWeight.w600,
                                fontSize: 12,
                                color: BgColors.muted,
                                decoration: TextDecoration.lineThrough,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
