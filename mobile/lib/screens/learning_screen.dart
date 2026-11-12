import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../data/sample_data.dart';
import '../models/course.dart';
import '../state/auth_state.dart';
import '../theme/colors.dart';
import '../widgets/course_card.dart';

class LearningScreen extends StatelessWidget {
  const LearningScreen({super.key});

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
            style: GoogleFonts.nunito(
              fontWeight: FontWeight.w800,
              fontSize: 28,
              letterSpacing: -0.6,
            ),
          ),
          const SizedBox(height: 6),
          if (!auth.isSignedIn) ...[
            Text(
              'Sign in to see courses you purchased.',
              style: GoogleFonts.nunito(
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
                    style: GoogleFonts.nunito(
                      fontWeight: FontWeight.w800,
                      fontSize: 18,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Purchased classrooms unlock here after you sign in.',
                    style: GoogleFonts.nunito(
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
                      style: GoogleFonts.nunito(fontWeight: FontWeight.w800),
                    ),
                  ),
                ],
              ),
            ),
          ] else ...[
            Builder(
              builder: (context) {
                final items = SampleData.enrolled;
                final inProgress = items.where((e) => e.progress < 1).length;
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '$inProgress in progress · ${items.length} enrolled',
                      style: GoogleFonts.nunito(
                        fontWeight: FontWeight.w600,
                        fontSize: 14,
                        color: BgColors.muted,
                      ),
                    ),
                    const SizedBox(height: 18),
                    if (items.isEmpty)
                      Padding(
                        padding: const EdgeInsets.only(top: 32),
                        child: Text(
                          'No purchased courses yet.',
                          style: GoogleFonts.nunito(
                            fontWeight: FontWeight.w700,
                            color: BgColors.muted,
                          ),
                        ),
                      )
                    else
                      ...items.map(
                        (item) => Padding(
                          padding: const EdgeInsets.only(bottom: 14),
                          child: _LearningCard(item: item),
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

class _LearningCard extends StatelessWidget {
  const _LearningCard({required this.item});

  final EnrolledCourse item;

  @override
  Widget build(BuildContext context) {
    final done = item.progress >= 1;
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: BgColors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: BgColors.line),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: CourseCover(
                  course: item.course,
                  height: 108,
                  borderRadius: 16,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: Text(
                  item.course.title,
                  style: GoogleFonts.nunito(
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
                  style: GoogleFonts.nunito(
                    fontWeight: FontWeight.w800,
                    fontSize: 11,
                    color: done ? const Color(0xFF166534) : BgColors.indigo,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            item.course.instructor,
            style: GoogleFonts.nunito(
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
                style: GoogleFonts.nunito(
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
                  style: GoogleFonts.nunito(
                    fontWeight: FontWeight.w600,
                    fontSize: 13,
                    color: BgColors.muted,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
