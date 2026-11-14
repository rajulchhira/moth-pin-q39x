import 'package:flutter/material.dart';

import '../data/sample_data.dart';
import '../models/course.dart';
import '../state/app_nav.dart';
import '../state/auth_state.dart';
import '../theme/bg_text.dart';
import '../theme/colors.dart';
import '../widgets/course_card.dart';
import 'course_detail_screen.dart';

class LearningScreen extends StatefulWidget {
  const LearningScreen({super.key});

  @override
  State<LearningScreen> createState() => _LearningScreenState();
}

class _LearningScreenState extends State<LearningScreen> {
  /// `ongoing` | `completed` | `all` — mirrors site learning chips.
  String _filter = 'ongoing';

  @override
  Widget build(BuildContext context) {
    final auth = AuthScope.of(context);

    return SafeArea(
      bottom: false,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 28),
        children: [
          Text(
            'My Learning',
            style: bgText(
              fontWeight: FontWeight.w800,
              fontSize: 28,
              letterSpacing: -0.6,
            ),
          ),
          const SizedBox(height: 6),
          if (!auth.isSignedIn) ...[
            Text(
              'Sign in to see courses you purchased.',
              style: bgText(
                fontWeight: FontWeight.w600,
                fontSize: 14,
                color: BgColors.muted,
              ),
            ),
            const SizedBox(height: 28),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: BgColors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: BgColors.line),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'You are signed out',
                    style: bgText(
                      fontWeight: FontWeight.w800,
                      fontSize: 18,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Purchased classrooms unlock here after you sign in.',
                    style: bgText(
                      fontWeight: FontWeight.w600,
                      fontSize: 14,
                      color: BgColors.muted,
                    ),
                  ),
                  const SizedBox(height: 16),
                  FilledButton(
                    onPressed: () => AuthScope.read(context).signIn(),
                    style: FilledButton.styleFrom(
                      backgroundColor: BgColors.indigo,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                    ),
                    child: Text(
                      'Sign in',
                      style: bgText(fontWeight: FontWeight.w800),
                    ),
                  ),
                  const SizedBox(height: 10),
                  TextButton(
                    onPressed: () =>
                        AppNavScope.read(context).openLibrary(),
                    child: Text(
                      'Browse course library',
                      style: bgText(
                        fontWeight: FontWeight.w800,
                        color: BgColors.indigo,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ] else ...[
            Builder(
              builder: (context) {
                final items = SampleData.enrolled;
                final ongoing =
                    items.where((e) => e.progress < 1).toList(growable: false);
                final completed =
                    items.where((e) => e.progress >= 1).toList(growable: false);
                final visible = switch (_filter) {
                  'completed' => completed,
                  'all' => items,
                  _ => ongoing,
                };

                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '${ongoing.length} in progress · ${completed.length} completed · ${items.length} enrolled',
                      style: bgText(
                        fontWeight: FontWeight.w600,
                        fontSize: 14,
                        color: BgColors.muted,
                      ),
                    ),
                    const SizedBox(height: 14),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        for (final chip in const [
                          ('ongoing', 'Ongoing'),
                          ('completed', 'Completed'),
                          ('all', 'All'),
                        ])
                          _FilterChip(
                            label: chip.$2,
                            selected: _filter == chip.$1,
                            onTap: () => setState(() => _filter = chip.$1),
                          ),
                      ],
                    ),
                    const SizedBox(height: 18),
                    if (visible.isEmpty)
                      Padding(
                        padding: const EdgeInsets.only(top: 24),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _filter == 'completed'
                                  ? 'No completed classrooms yet.'
                                  : 'No ongoing classrooms. Buy a course to start.',
                              style: bgText(
                                fontWeight: FontWeight.w700,
                                color: BgColors.muted,
                              ),
                            ),
                            const SizedBox(height: 12),
                            FilledButton(
                              onPressed: () =>
                                  AppNavScope.read(context).openLibrary(),
                              style: FilledButton.styleFrom(
                                backgroundColor: BgColors.indigo,
                                foregroundColor: Colors.white,
                              ),
                              child: Text(
                                'Browse courses',
                                style: bgText(fontWeight: FontWeight.w800),
                              ),
                            ),
                          ],
                        ),
                      )
                    else
                      ...visible.map(
                        (item) => Padding(
                          padding: const EdgeInsets.only(bottom: 14),
                          child: _LearningCard(
                            item: item,
                            onTap: () {
                              Navigator.of(context).push(
                                MaterialPageRoute<void>(
                                  builder: (_) => CourseDetailScreen(
                                    course: item.course,
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                      ),
                    const SizedBox(height: 8),
                    TextButton(
                      onPressed: () =>
                          AppNavScope.read(context).openLibrary(),
                      child: Text(
                        'Find more courses ›',
                        style: bgText(
                          fontWeight: FontWeight.w800,
                          color: BgColors.indigo,
                        ),
                      ),
                    ),
                  ],
                );
              },
            ),
          ],
        ],
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  const _FilterChip({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 160),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: selected ? BgColors.indigo : BgColors.white,
          borderRadius: BorderRadius.circular(999),
          border: Border.all(
            color: selected ? BgColors.indigo : BgColors.line,
          ),
        ),
        child: Text(
          label,
          style: bgText(
            fontWeight: FontWeight.w800,
            fontSize: 13,
            color: selected ? Colors.white : BgColors.ink,
          ),
        ),
      ),
    );
  }
}

class _LearningCard extends StatelessWidget {
  const _LearningCard({required this.item, required this.onTap});

  final EnrolledCourse item;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final done = item.progress >= 1;
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(22),
        child: Ink(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: BgColors.white,
            borderRadius: BorderRadius.circular(22),
            border: Border.all(color: BgColors.line),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              CourseCover(
                course: item.course,
                height: 108,
                borderRadius: 16,
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: Text(
                      item.course.title,
                      style: bgText(
                        fontWeight: FontWeight.w800,
                        fontSize: 16,
                        height: 1.25,
                      ),
                    ),
                  ),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: done
                          ? const Color(0xFFDCFCE7)
                          : BgColors.indigoSoft,
                      borderRadius: BorderRadius.circular(999),
                    ),
                    child: Text(
                      item.status,
                      style: bgText(
                        fontWeight: FontWeight.w800,
                        fontSize: 11,
                        color:
                            done ? const Color(0xFF166534) : BgColors.indigo,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Text(
                item.course.instructor,
                style: bgText(
                  fontWeight: FontWeight.w600,
                  fontSize: 13,
                  color: BgColors.muted,
                ),
              ),
              const SizedBox(height: 12),
              ClipRRect(
                borderRadius: BorderRadius.circular(999),
                child: LinearProgressIndicator(
                  value: item.progress,
                  minHeight: 8,
                  backgroundColor: BgColors.line,
                  valueColor: AlwaysStoppedAnimation(
                    done ? const Color(0xFF16A34A) : BgColors.indigo,
                  ),
                ),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Text(
                    '${(item.progress * 100).round()}%',
                    style: bgText(
                      fontWeight: FontWeight.w800,
                      fontSize: 13,
                      color: BgColors.ink,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      item.nextLesson,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: bgText(
                        fontWeight: FontWeight.w600,
                        fontSize: 13,
                        color: BgColors.muted,
                      ),
                    ),
                  ),
                  Text(
                    done ? 'Certificate' : 'Continue',
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
        ),
      ),
    );
  }
}
