import 'package:flutter/material.dart';

import '../theme/bg_text.dart';

import '../models/course.dart';
import '../theme/colors.dart';

class CourseCover extends StatelessWidget {
  const CourseCover({
    super.key,
    required this.course,
    this.height = 120,
    this.borderRadius = 18,
    this.compactMeta = false,
  });

  final Course course;
  final double height;
  final double borderRadius;
  final bool compactMeta;

  @override
  Widget build(BuildContext context) {
    final colors = course.coverColors.map(Color.new).toList();
    final pad = height <= 110 ? 10.0 : 16.0;
    final titleSize = height <= 110 ? 13.0 : 18.0;
    final showMeta = !compactMeta && height >= 120;

    return Container(
      height: height,
      width: double.infinity,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(borderRadius),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: colors.length == 1 ? [colors.first, colors.first] : colors,
        ),
      ),
      padding: EdgeInsets.all(pad),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            course.coverLabel,
            maxLines: height <= 110 ? 2 : 3,
            overflow: TextOverflow.ellipsis,
            style: bgText(
              color: Colors.white,
              fontWeight: FontWeight.w800,
              fontSize: titleSize,
              height: 1.1,
              letterSpacing: -0.3,
            ),
          ),
          if (showMeta) ...[
            const Spacer(),
            Text(
              '${course.hours} hrs · ${course.lessons} lessons',
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: bgText(
                color: Colors.white.withOpacity(0.82),
                fontWeight: FontWeight.w600,
                fontSize: 12,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class CourseCard extends StatelessWidget {
  const CourseCard({
    super.key,
    required this.course,
    this.compact = false,
  });

  final Course course;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    if (compact) {
      return SizedBox(
        width: 200,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            CourseCover(course: course, height: 100),
            const SizedBox(height: 6),
            Text(
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
            const SizedBox(height: 2),
            Text(
              course.instructor,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: bgText(
                color: BgColors.muted,
                fontWeight: FontWeight.w600,
                fontSize: 11,
              ),
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                const Icon(Icons.star_rounded, size: 14, color: BgColors.gold),
                const SizedBox(width: 2),
                Text(
                  course.rating.toStringAsFixed(1),
                  style: bgText(
                    fontWeight: FontWeight.w800,
                    fontSize: 12,
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  '₹${course.price}',
                  style: bgText(
                    fontWeight: FontWeight.w800,
                    fontSize: 12,
                    color: BgColors.indigo,
                  ),
                ),
              ],
            ),
          ],
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: BgColors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: BgColors.line),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 96,
            child: CourseCover(
              course: course,
              height: 96,
              borderRadius: 14,
              compactMeta: true,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  course.title,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: bgText(
                    fontWeight: FontWeight.w800,
                    fontSize: 15,
                    height: 1.25,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  course.instructor,
                  style: bgText(
                    color: BgColors.muted,
                    fontWeight: FontWeight.w600,
                    fontSize: 13,
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    const Icon(Icons.star_rounded, size: 16, color: BgColors.gold),
                    const SizedBox(width: 2),
                    Expanded(
                      child: Text(
                        '${course.rating.toStringAsFixed(1)} · ${course.learners}',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: bgText(
                          fontWeight: FontWeight.w700,
                          fontSize: 12,
                          color: BgColors.muted,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      '₹${course.price}',
                      style: bgText(
                        fontWeight: FontWeight.w800,
                        fontSize: 15,
                        color: BgColors.indigo,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class MentorTile extends StatelessWidget {
  const MentorTile({super.key, required this.mentor});

  final Mentor mentor;

  @override
  Widget build(BuildContext context) {
    final accent = Color(mentor.accent);
    return Container(
      width: 180,
      padding: const EdgeInsets.fromLTRB(12, 12, 12, 10),
      decoration: BoxDecoration(
        color: BgColors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: BgColors.line),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CircleAvatar(
            radius: 20,
            backgroundColor: accent.withOpacity(0.15),
            child: Text(
              mentor.initials,
              style: bgText(
                fontWeight: FontWeight.w800,
                fontSize: 13,
                color: accent,
              ),
            ),
          ),
          const SizedBox(height: 10),
          Text(
            mentor.name,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: bgText(
              fontWeight: FontWeight.w800,
              fontSize: 14,
            ),
          ),
          const SizedBox(height: 4),
          Expanded(
            child: Text(
              mentor.title,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: bgText(
                color: BgColors.muted,
                fontWeight: FontWeight.w600,
                fontSize: 12,
                height: 1.25,
              ),
            ),
          ),
          Text(
            '${mentor.learners} learners',
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: bgText(
              fontWeight: FontWeight.w700,
              fontSize: 12,
              color: BgColors.indigo,
            ),
          ),
        ],
      ),
    );
  }
}
