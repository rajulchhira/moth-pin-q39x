import 'package:flutter/material.dart';

import '../data/sample_data.dart';
import '../state/app_nav.dart';
import '../theme/bg_text.dart';
import '../theme/colors.dart';
import '../widgets/course_card.dart';
import 'course_detail_screen.dart';

/// Course library — mirrors site `/courses` (+ `?cat=` filters).
class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final _controller = TextEditingController();
  String _query = '';
  String _category = 'all';
  AppNav? _nav;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final nav = AppNavScope.of(context);
    if (!identical(_nav, nav)) {
      _nav?.removeListener(_syncFromNav);
      _nav = nav;
      _nav!.addListener(_syncFromNav);
    }
    _syncFromNav();
  }

  void _syncFromNav() {
    final nav = _nav;
    if (nav == null) return;
    final nextQ = nav.searchQuery;
    final nextCat = nav.searchCategory;
    if (nextQ == _query && nextCat == _category) return;
    setState(() {
      _query = nextQ;
      _category = nextCat;
      if (_controller.text != nextQ) {
        _controller.value = TextEditingValue(
          text: nextQ,
          selection: TextSelection.collapsed(offset: nextQ.length),
        );
      }
    });
  }

  @override
  void dispose() {
    _nav?.removeListener(_syncFromNav);
    _controller.dispose();
    super.dispose();
  }

  void _setCategory(String id) {
    setState(() => _category = id);
    AppNavScope.read(context).setSearchFilters(category: id);
  }

  void _setQuery(String q) {
    setState(() => _query = q);
    AppNavScope.read(context).setSearchFilters(query: q);
  }

  @override
  Widget build(BuildContext context) {
    final results = SampleData.search(query: _query, category: _category);
    final libraryTitle = SampleData.libraryLabel(_category);

    return SafeArea(
      bottom: false,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
            child: Text(
              'Search',
              style: bgText(
                fontWeight: FontWeight.w800,
                fontSize: 28,
                letterSpacing: -0.6,
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 6, 20, 0),
            child: Text(
              _category == 'all'
                  ? 'Course library'
                  : '$libraryTitle library',
              style: bgText(
                fontWeight: FontWeight.w700,
                fontSize: 14,
                color: BgColors.muted,
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 14, 20, 10),
            child: TextField(
              controller: _controller,
              onChanged: _setQuery,
              textInputAction: TextInputAction.search,
              decoration: InputDecoration(
                hintText: 'Courses, mentors, options…',
                prefixIcon:
                    const Icon(Icons.search_rounded, color: BgColors.muted),
                suffixIcon: _query.isEmpty
                    ? null
                    : IconButton(
                        onPressed: () {
                          _controller.clear();
                          _setQuery('');
                        },
                        icon: const Icon(
                          Icons.close_rounded,
                          color: BgColors.muted,
                        ),
                      ),
              ),
            ),
          ),
          SizedBox(
            height: 42,
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              scrollDirection: Axis.horizontal,
              itemCount: SampleData.categories.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (context, index) {
                final id = SampleData.categories[index];
                final selected = id == _category;
                return GestureDetector(
                  onTap: () => _setCategory(id),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 180),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 10,
                    ),
                    decoration: BoxDecoration(
                      color: selected ? BgColors.indigo : BgColors.white,
                      borderRadius: BorderRadius.circular(999),
                      border: Border.all(
                        color: selected ? BgColors.indigo : BgColors.line,
                      ),
                    ),
                    child: Text(
                      SampleData.categoryLabel(id),
                      style: bgText(
                        fontWeight: FontWeight.w800,
                        fontSize: 13,
                        color: selected ? Colors.white : BgColors.ink,
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
            child: Text(
              '${results.length} result${results.length == 1 ? '' : 's'}',
              style: bgText(
                fontWeight: FontWeight.w700,
                fontSize: 13,
                color: BgColors.muted,
              ),
            ),
          ),
          Expanded(
            child: results.isEmpty
                ? Center(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 32),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            'No courses match that filter.',
                            textAlign: TextAlign.center,
                            style: bgText(
                              fontWeight: FontWeight.w700,
                              color: BgColors.muted,
                            ),
                          ),
                          const SizedBox(height: 12),
                          TextButton(
                            onPressed: () => _setCategory('all'),
                            child: Text(
                              'Show all courses',
                              style: bgText(
                                fontWeight: FontWeight.w800,
                                color: BgColors.indigo,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  )
                : ListView.separated(
                    padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
                    itemCount: results.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 12),
                    itemBuilder: (context, index) {
                      final course = results[index];
                      return CourseCard(
                        course: course,
                        onTap: () {
                          Navigator.of(context).push(
                            MaterialPageRoute<void>(
                              builder: (_) =>
                                  CourseDetailScreen(course: course),
                            ),
                          );
                        },
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
