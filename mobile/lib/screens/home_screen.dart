import 'package:flutter/material.dart';

import '../data/sample_data.dart';
import '../state/auth_state.dart';
import '../theme/bg_text.dart';
import '../theme/colors.dart';
import '../widgets/auto_marquee.dart';
import '../widgets/brand_mark.dart';
import '../widgets/popular_course_card.dart';

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
    const live = SampleData.upcomingLive;
    final fade = CurvedAnimation(parent: _motion, curve: Curves.easeOutCubic);
    final slide = Tween<Offset>(
      begin: const Offset(0, 0.06),
      end: Offset.zero,
    ).animate(fade);

    final firstName =
        SampleData.user.name.trim().split(RegExp(r'\s+')).where((p) => p.isNotEmpty);
    final welcome = auth.isSignedIn
        ? 'Welcome back, ${firstName.isEmpty ? 'trader' : firstName.first}'
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
                style: bgText(
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
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 24, 20, 12),
              child: Text(
                'Popular Categories',
                style: bgText(
                  fontWeight: FontWeight.w800,
                  fontSize: 20,
                  letterSpacing: -0.3,
                ),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: LayoutBuilder(
                builder: (context, constraints) {
                  // Six course-menu categories → 3×2 equal rounded-rect tiles.
                  const cols = 3;
                  const gap = 12.0;
                  final tileW =
                      (constraints.maxWidth - gap * (cols - 1)) / cols;
                  final coverH = tileW / PopularCategoryTile.coverAspect;
                  final tileH =
                      coverH + 8 + PopularCategoryTile.labelHeight;
                  const cats = SampleData.popularCategories;
                  return Wrap(
                    spacing: gap,
                    runSpacing: 14,
                    children: [
                      for (final cat in cats)
                        SizedBox(
                          width: tileW,
                          height: tileH,
                          child: PopularCategoryTile(category: cat),
                        ),
                    ],
                  );
                },
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 28, 20, 10),
              child: Text(
                'Most popular courses',
                style: bgText(
                  fontWeight: FontWeight.w800,
                  fontSize: 20,
                  letterSpacing: -0.3,
                ),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: AutoMarquee(
              height: PopularCourseCard.cardHeight,
              itemCount: popular.length,
              itemExtent: PopularCourseCard.cardWidth,
              gap: 14,
              // Right → left travel.
              reverse: false,
              pixelsPerSecond: 32,
              itemBuilder: (context, index) {
                return PopularCourseCard(course: popular[index]);
              },
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 28, 20, 6),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Flexible(
                        child: Text(
                          'Upcoming live classes',
                          style: bgText(
                            fontWeight: FontWeight.w800,
                            fontSize: 20,
                            letterSpacing: -0.3,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 3,
                        ),
                        decoration: BoxDecoration(
                          color: BgColors.magenta,
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: Text(
                          'LIVE',
                          style: bgText(
                            color: Colors.white,
                            fontWeight: FontWeight.w800,
                            fontSize: 11,
                            letterSpacing: 0.6,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Learn stock market the right way through webinars and mentorship.',
                    style: bgText(
                      fontWeight: FontWeight.w600,
                      fontSize: 13,
                      color: BgColors.muted,
                      height: 1.35,
                    ),
                  ),
                ],
              ),
            ),
          ),
          if (live.isNotEmpty)
            SliverToBoxAdapter(
              child: SizedBox(
                height: LiveWebinarCard.cardHeight,
                child: ListView.separated(
                  padding: const EdgeInsets.fromLTRB(20, 10, 20, 0),
                  scrollDirection: Axis.horizontal,
                  itemCount: live.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 14),
                  itemBuilder: (context, index) {
                    return LiveWebinarCard(item: live[index]);
                  },
                ),
              ),
            ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 28, 20, 10),
              child: Text(
                'Learn from Stock Market Experts',
                style: bgText(
                  fontWeight: FontWeight.w800,
                  fontSize: 20,
                  letterSpacing: -0.3,
                ),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: AutoMarquee(
              height: 252,
              itemCount: SampleData.mentors.length,
              itemExtent: 168,
              gap: 14,
              // Left → right travel (opposite of courses).
              reverse: true,
              pixelsPerSecond: 26,
              itemBuilder: (context, index) {
                return ExpertPortraitCard(mentor: SampleData.mentors[index]);
              },
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
        padding: const EdgeInsets.fromLTRB(20, 18, 20, 18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            const BrandMark(size: 32, light: true),
            const SizedBox(height: 14),
            Text(
              'Learn from the journey of Nifty',
              style: bgText(
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
              style: bgText(
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
        style: bgText(
          fontWeight: FontWeight.w800,
          fontSize: 12,
          color: filled ? BgColors.indigoDark : Colors.white,
        ),
      ),
    );
  }
}
