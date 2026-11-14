import 'package:flutter/widgets.dart';

/// In-app destinations that mirror the website course library / live sections.
enum HomeAnchor { popularCourses, liveClasses }

/// Shell navigation + Search library filters (site `/courses?cat=#library`).
class AppNav extends ChangeNotifier {
  int tabIndex = 0;
  String searchCategory = 'all';
  String searchQuery = '';
  HomeAnchor? pendingHomeScroll;

  void goTab(int index) {
    if (tabIndex == index) return;
    tabIndex = index;
    notifyListeners();
  }

  /// Hero “Explore courses” / “Live rooms” — stay on Home and scroll.
  void scrollHomeTo(HomeAnchor anchor) {
    tabIndex = 0;
    pendingHomeScroll = anchor;
    notifyListeners();
  }

  void clearPendingHomeScroll() {
    if (pendingHomeScroll == null) return;
    pendingHomeScroll = null;
  }

  /// Popular Categories → Search library filtered like `/courses?cat=…#library`.
  void openLibrary({String category = 'all', String query = ''}) {
    searchCategory = category;
    searchQuery = query;
    tabIndex = 1;
    notifyListeners();
  }

  void setSearchFilters({String? category, String? query}) {
    var changed = false;
    if (category != null && category != searchCategory) {
      searchCategory = category;
      changed = true;
    }
    if (query != null && query != searchQuery) {
      searchQuery = query;
      changed = true;
    }
    if (changed) notifyListeners();
  }
}

class AppNavScope extends InheritedNotifier<AppNav> {
  const AppNavScope({
    super.key,
    required AppNav notifier,
    required super.child,
  }) : super(notifier: notifier);

  static AppNav of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<AppNavScope>();
    assert(scope != null, 'AppNavScope not found');
    return scope!.notifier!;
  }

  static AppNav read(BuildContext context) {
    final scope = context.getInheritedWidgetOfExactType<AppNavScope>();
    assert(scope != null, 'AppNavScope not found');
    return scope!.notifier!;
  }
}
