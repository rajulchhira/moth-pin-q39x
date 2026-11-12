import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../data/sample_data.dart';
import '../state/auth_state.dart';
import '../theme/colors.dart';
import '../widgets/brand_mark.dart';
import '../widgets/course_card.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _motion;

  @override
  void initState() {
    super.initState();
    _motion = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    )..forward();
  }

  @override
  void dispose() {
    _motion.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final auth = AuthScope.of(context);
    final popular = SampleData.popularCourses();
    final live = SampleData.upcomingLive;
    final fade = CurvedAnimation(parent: _motion, curve: Curves.easeOutCubic);
    final slide = Tween<Offset>(
      begin: const Offset(0, 0.06),
      end: Offset.zero,
    ).animate(fade);

    final welcome = auth.isSignedIn
        ? 'Welcome back, ${SampleData.user.name.split(' ').first}'
        : 'Welcome!';

    return SafeArea(
      bottom: false,
      child: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 10, 20, 4),
              child: Text(
                welcome,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: GoogleFonts.nunito(
                  fontWeight: FontWeight.w800,
                  fontSize: 22,
                  letterSpacing: -0.4,
                ),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: FadeTransition(
              opacity: fade,
              child: SlideTransition(
                position: slide,
                child: const _HeroBanner(),
              ),
            ),
          ),
          if (live.isNotEmpty) ...[
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 22, 20, 10),
                child: Text(
                  'Upcoming live',
                  style: GoogleFonts.nunito(
                    fontWeight: FontWeight.w800,
                    fontSize: 20,
                    letterSpacing: -0.3,
                  ),
                ),
              ),
            ),
            SliverToBoxAdapter(
              child: SizedBox(
                height: 108,
                child: ListView.separated(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  scrollDirection: Axis.horizontal,
                  itemCount: live.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 12),
                  itemBuilder: (context, index) {
                    final item = live[index];
                    return Container(
                      width: 240,
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: BgColors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: BgColors.line),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            item.title,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: GoogleFonts.nunito(
                              fontWeight: FontWeight.w800,
                              fontSize: 14,
                            ),
                          ),
                          const Spacer(),
                          Text(
                            '${item.when} · ${item.mentor}',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: GoogleFonts.nunito(
                              fontWeight: FontWeight.w600,
                              fontSize: 12,
                              color: BgColors.muted,
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),
            ),
          ],
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 22, 20, 10),
              child: Text(
                'Courses',
                style: GoogleFonts.nunito(
                  fontWeight: FontWeight.w800,
                  fontSize: 20,
                  letterSpacing: -0.3,
                ),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: SizedBox(
              height: 86,
              child: ListView.separated(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                scrollDirection: Axis.horizontal,
                itemCount: SampleData.courseMenu.length,
                separatorBuilder: (_, __) => const SizedBox(width: 10),
                itemBuilder: (context, index) {
                  final item = SampleData.courseMenu[index];
                  final accent = Color(item.accent);
                  return Container(
                    width: 156,
                    padding: const EdgeInsets.fromLTRB(10, 10, 10, 8),
                    decoration: BoxDecoration(
                      color: BgColors.white,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: BgColors.line),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          width: 26,
                          height: 26,
                          decoration: BoxDecoration(
                            color: accent.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Icon(
                            Icons.menu_book_rounded,
                            size: 15,
                            color: accent,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Expanded(
                          child: Text(
                            item.title,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: GoogleFonts.nunito(
                              fontWeight: FontWeight.w800,
                              fontSize: 12,
                              height: 1.15,
                            ),
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 24, 20, 10),
              child: Text(
                'Most popular courses',
                style: GoogleFonts.nunito(
                  fontWeight: FontWeight.w800,
                  fontSize: 20,
                  letterSpacing: -0.3,
                ),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: SizedBox(
              height: 188,
              child: ListView.separated(
                // reverse:true → popular (index 0) starts at the right edge;
                // scroll moves content right → left.
                reverse: true,
                padding: const EdgeInsets.symmetric(horizontal: 20),
                scrollDirection: Axis.horizontal,
                itemCount: popular.length,
                separatorBuilder: (_, __) => const SizedBox(width: 14),
                itemBuilder: (context, index) {
                  return CourseCard(course: popular[index], compact: true);
                },
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 24, 20, 10),
              child: Text(
                'Learn from Stock Market Experts',
                style: GoogleFonts.nunito(
                  fontWeight: FontWeight.w800,
                  fontSize: 20,
                  letterSpacing: -0.3,
                ),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: SizedBox(
              height: 156,
              child: ListView.separated(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                scrollDirection: Axis.horizontal,
                itemCount: SampleData.mentors.length,
                separatorBuilder: (_, __) => const SizedBox(width: 12),
                itemBuilder: (context, index) {
                  return MentorTile(mentor: SampleData.mentors[index]);
                },
              ),
            ),
          ),
          const SliverToBoxAdapter(child: SizedBox(height: 28)),
        ],
      ),
    );
  }
}

class _HeroBanner extends StatefulWidget {
  const _HeroBanner();

  @override
  State<_HeroBanner> createState() => _HeroBannerState();
}

class _HeroBannerState extends State<_HeroBanner>
    with SingleTickerProviderStateMixin {
  late final AnimationController _drift;

  @override
  void initState() {
    super.initState();
    _drift = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1600),
    )..forward();
  }

  @override
  void dispose() {
    _drift.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final t = CurvedAnimation(parent: _drift, curve: Curves.easeOutCubic);
    return AnimatedBuilder(
      animation: t,
      builder: (context, child) {
        final v = t.value;
        return Container(
          margin: const EdgeInsets.fromLTRB(16, 8, 16, 0),
          // Height −10% vs prior padding-driven hero (~244 → ~220 content).
          constraints: const BoxConstraints(minHeight: 196),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(28),
            gradient: BgColors.heroGradient,
            boxShadow: [
              BoxShadow(
                color: BgColors.indigo.withOpacity(0.18 + v * 0.1),
                blurRadius: 24 + v * 8,
                offset: const Offset(0, 14),
              ),
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(28),
            child: Stack(
              children: [
                Positioned(
                  right: -48 + v * 18,
                  top: -36,
                  child: Container(
                    width: 144,
                    height: 144,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: BgColors.magenta.withOpacity(0.22),
                    ),
                  ),
                ),
                Positioned(
                  left: -20,
                  bottom: -50,
                  child: Container(
                    width: 126,
                    height: 126,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.white.withOpacity(0.06),
                    ),
                  ),
                ),
                child!,
              ],
            ),
          ),
        );
      },
      child: Padding(
        // Prior was 22/22/22/24 — trim ~10%.
        padding: const EdgeInsets.fromLTRB(20, 18, 20, 18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            const BrandMark(size: 32, light: true),
            const SizedBox(height: 14),
            Text(
              'Learn from the journey of Nifty',
              style: GoogleFonts.nunito(
                color: Colors.white,
                fontWeight: FontWeight.w800,
                fontSize: 24,
                height: 1.15,
                letterSpacing: -0.6,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Process and risk — not a tip feed. Courses, live desks, and mentorship for Indian traders.',
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: GoogleFonts.nunito(
                color: Colors.white.withOpacity(0.86),
                fontWeight: FontWeight.w600,
                fontSize: 13,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 14),
            const Wrap(
              spacing: 10,
              runSpacing: 8,
              children: [
                _HeroCta(label: 'Explore courses', filled: true),
                _HeroCta(label: 'Live rooms', filled: false),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _HeroCta extends StatelessWidget {
  const _HeroCta({required this.label, required this.filled});

  final String label;
  final bool filled;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: filled ? Colors.white : Colors.white.withOpacity(0.12),
        borderRadius: BorderRadius.circular(12),
        border: filled ? null : Border.all(color: Colors.white.withOpacity(0.28)),
      ),
      child: Text(
        label,
        style: GoogleFonts.nunito(
          fontWeight: FontWeight.w800,
          fontSize: 12,
          color: filled ? BgColors.indigoDark : Colors.white,
        ),
      ),
    );
  }
}
