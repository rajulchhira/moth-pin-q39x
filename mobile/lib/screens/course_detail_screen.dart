import 'package:flutter/material.dart';

import '../data/sample_data.dart';
import '../models/course.dart';
import '../state/auth_state.dart';
import '../theme/bg_text.dart';
import '../theme/colors.dart';
import '../widgets/course_card.dart';

/// Lightweight classroom page — mirrors site course detail essentials.
class CourseDetailScreen extends StatelessWidget {
  const CourseDetailScreen({super.key, required this.course});

  final Course course;

  @override
  Widget build(BuildContext context) {
    final auth = AuthScope.of(context);
    final enrolled = SampleData.enrolled
        .where((e) => e.course.id == course.id)
        .toList(growable: false);
    final owned = auth.isSignedIn && enrolled.isNotEmpty;
    final progress = owned ? enrolled.first.progress : 0.0;

    return Scaffold(
      backgroundColor: BgColors.canvas,
      appBar: AppBar(
        title: Text(
          'Classroom',
          style: bgText(fontWeight: FontWeight.w800),
        ),
        backgroundColor: BgColors.canvas,
        surfaceTintColor: Colors.transparent,
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
        children: [
          CourseCover(course: course, height: 168, borderRadius: 20),
          const SizedBox(height: 16),
          Text(
            course.title,
            style: bgText(
              fontWeight: FontWeight.w800,
              fontSize: 24,
              letterSpacing: -0.4,
              height: 1.2,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'by ${course.instructor}',
            style: bgText(
              fontWeight: FontWeight.w600,
              fontSize: 14,
              color: BgColors.muted,
            ),
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 10,
            runSpacing: 8,
            children: [
              _MetaChip(
                icon: Icons.star_rounded,
                label: course.rating.toStringAsFixed(1),
                color: BgColors.gold,
              ),
              _MetaChip(
                icon: Icons.people_outline_rounded,
                label: course.learners,
              ),
              _MetaChip(
                icon: Icons.schedule_rounded,
                label: '${course.hours} hrs · ${course.lessons} lessons',
              ),
              _MetaChip(
                icon: Icons.sell_outlined,
                label: SampleData.libraryLabel(course.category),
              ),
            ],
          ),
          const SizedBox(height: 18),
          Text(
            'Process and risk for this classroom — replayable lessons, journals, and a clear invalidation rule. Not a tip feed.',
            style: bgText(
              fontWeight: FontWeight.w600,
              fontSize: 14,
              height: 1.45,
              color: BgColors.ink,
            ),
          ),
          if (owned) ...[
            const SizedBox(height: 18),
            Text(
              progress >= 1 ? 'Completed' : 'Continue learning',
              style: bgText(fontWeight: FontWeight.w800, fontSize: 16),
            ),
            const SizedBox(height: 8),
            ClipRRect(
              borderRadius: BorderRadius.circular(999),
              child: LinearProgressIndicator(
                value: progress,
                minHeight: 8,
                backgroundColor: BgColors.line,
                valueColor: AlwaysStoppedAnimation(
                  progress >= 1 ? const Color(0xFF16A34A) : BgColors.indigo,
                ),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              enrolled.first.nextLesson,
              style: bgText(
                fontWeight: FontWeight.w600,
                fontSize: 13,
                color: BgColors.muted,
              ),
            ),
          ],
          const SizedBox(height: 24),
          Row(
            children: [
              Text(
                '₹${course.price}',
                style: bgText(
                  fontWeight: FontWeight.w800,
                  fontSize: 22,
                  color: BgColors.indigo,
                ),
              ),
              const SizedBox(width: 10),
              Text(
                '₹${course.oldPrice}',
                style: bgText(
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                  color: BgColors.muted,
                  decoration: TextDecoration.lineThrough,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          FilledButton(
            onPressed: () {
              if (!auth.isSignedIn) {
                AuthScope.read(context).signIn();
                return;
              }
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(
                    owned
                        ? 'Opening next lesson…'
                        : 'Enrollment queued for ${course.title}',
                    style: bgText(fontWeight: FontWeight.w600),
                  ),
                ),
              );
            },
            style: FilledButton.styleFrom(
              backgroundColor: BgColors.indigo,
              foregroundColor: Colors.white,
              minimumSize: const Size.fromHeight(48),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
              ),
            ),
            child: Text(
              !auth.isSignedIn
                  ? 'Sign in to enroll'
                  : owned
                      ? (progress >= 1 ? 'Review classroom' : 'Continue')
                      : 'Enroll · ₹${course.price}',
              style: bgText(fontWeight: FontWeight.w800, color: Colors.white),
            ),
          ),
        ],
      ),
    );
  }
}

class MentorDetailScreen extends StatelessWidget {
  const MentorDetailScreen({super.key, required this.mentor});

  final Mentor mentor;

  @override
  Widget build(BuildContext context) {
    final accent = Color(mentor.accent);
    final taught = SampleData.courses
        .where((c) => c.instructor == mentor.name)
        .toList(growable: false);

    return Scaffold(
      backgroundColor: BgColors.canvas,
      appBar: AppBar(
        title: Text('Mentor', style: bgText(fontWeight: FontWeight.w800)),
        backgroundColor: BgColors.canvas,
        surfaceTintColor: Colors.transparent,
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 36,
                backgroundColor: accent.withOpacity(0.18),
                backgroundImage: mentor.photoAsset != null
                    ? AssetImage(mentor.photoAsset!)
                    : null,
                child: mentor.photoAsset == null
                    ? Text(
                        mentor.initials,
                        style: bgText(
                          fontWeight: FontWeight.w800,
                          fontSize: 22,
                          color: accent,
                        ),
                      )
                    : null,
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      mentor.name,
                      style: bgText(
                        fontWeight: FontWeight.w800,
                        fontSize: 22,
                        letterSpacing: -0.3,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      mentor.title,
                      style: bgText(
                        fontWeight: FontWeight.w600,
                        fontSize: 14,
                        color: BgColors.muted,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      '${mentor.learners} learners',
                      style: bgText(
                        fontWeight: FontWeight.w700,
                        fontSize: 13,
                        color: BgColors.indigo,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              for (final tag in mentor.tags)
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: BgColors.white,
                    borderRadius: BorderRadius.circular(999),
                    border: Border.all(color: BgColors.line),
                  ),
                  child: Text(
                    tag,
                    style: bgText(fontWeight: FontWeight.w700, fontSize: 12),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 22),
          Text(
            'Classrooms',
            style: bgText(fontWeight: FontWeight.w800, fontSize: 18),
          ),
          const SizedBox(height: 10),
          if (taught.isEmpty)
            Text(
              'No classrooms listed yet.',
              style: bgText(
                fontWeight: FontWeight.w600,
                color: BgColors.muted,
              ),
            )
          else
            ...taught.map(
              (c) => Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: CourseCard(
                  course: c,
                  onTap: () {
                    Navigator.of(context).push(
                      MaterialPageRoute<void>(
                        builder: (_) => CourseDetailScreen(course: c),
                      ),
                    );
                  },
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _MetaChip extends StatelessWidget {
  const _MetaChip({
    required this.icon,
    required this.label,
    this.color,
  });

  final IconData icon;
  final String label;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: BgColors.white,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: BgColors.line),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 15, color: color ?? BgColors.muted),
          const SizedBox(width: 4),
          Text(
            label,
            style: bgText(fontWeight: FontWeight.w700, fontSize: 12),
          ),
        ],
      ),
    );
  }
}
