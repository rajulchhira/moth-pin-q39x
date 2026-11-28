import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../data/catalog_api.dart';
import '../data/catalog_merge.dart';
import '../data/sample_data.dart';
import '../models/course.dart';

/// Live course catalog — boots from bundled sample, then hydrates from
/// `https://www.bizgarh.com/api/catalog/courses` so Control publishes appear
/// without shipping a new APK for every classroom change.
class CatalogState extends ChangeNotifier {
  CatalogState({
    CatalogApi? api,
    this.autoRefresh = true,
  }) : _api = api ?? CatalogApi();

  static const _cacheKey = 'bizgarh.catalog.courses.v1';

  final CatalogApi _api;
  final bool autoRefresh;

  List<Course> _courses = List<Course>.from(SampleData.courses);
  List<Mentor> _mentors = List<Mentor>.from(SampleData.mentors);
  List<LiveClass> _upcomingLive = List<LiveClass>.from(SampleData.upcomingLive);
  bool _loading = false;
  bool _hydrated = false;
  String? _error;
  DateTime? _updatedAt;

  List<Course> get courses => _courses;
  List<Mentor> get mentors => _mentors;
  List<LiveClass> get upcomingLive => _upcomingLive;
  bool get loading => _loading;
  bool get hydrated => _hydrated;
  String? get error => _error;
  DateTime? get updatedAt => _updatedAt;
  String get origin => _api.origin;

  List<Course> featuredCourses() => List<Course>.from(_courses);
  List<Course> popularCourses() => List<Course>.from(_courses);

  List<Course> search({required String query, required String category}) {
    final q = query.trim().toLowerCase();
    return _courses.where((c) {
      final catOk = category == 'all' || c.category == category;
      if (!catOk) return false;
      if (q.isEmpty) return true;
      return c.title.toLowerCase().contains(q) ||
          c.instructor.toLowerCase().contains(q) ||
          c.category.toLowerCase().contains(q) ||
          c.coverLabel.toLowerCase().contains(q);
    }).toList(growable: false);
  }

  Course? byId(String id) {
    for (final c in _courses) {
      if (c.id == id) return c;
    }
    return null;
  }

  /// Resolve enrolled demo rows against the live course objects when possible.
  List<EnrolledCourse> enrolledForDemo() {
    return SampleData.enrolled.map((e) {
      final live = byId(e.course.id);
      if (live == null) return e;
      return EnrolledCourse(
        course: live,
        progress: e.progress,
        nextLesson: e.nextLesson,
        status: e.status,
        txnId: e.txnId,
        orderId: e.orderId,
        purchasedAt: e.purchasedAt,
        amount: e.amount,
        paymentMethod: e.paymentMethod,
      );
    }).toList(growable: false);
  }

  Future<void> boot() async {
    await _restoreCache();
    if (autoRefresh) {
      // Fire-and-forget; UI already has sample/cache.
      // ignore: unawaited_futures
      refresh();
    }
  }

  Future<void> refresh() async {
    if (_loading) return;
    _loading = true;
    _error = null;
    notifyListeners();
    try {
      final doc = await _api.fetchCourses();
      if (doc['ok'] == false) {
        throw StateError('${doc['error'] ?? 'catalog unavailable'}');
      }
      _applyDoc(doc);
      _hydrated = true;
      _updatedAt = DateTime.tryParse('${doc['updatedAt'] ?? ''}') ??
          DateTime.now().toUtc();
      await _persistCache(doc);
      await _refreshWebinars();
    } catch (err) {
      _error = err.toString();
      debugPrint('Catalog refresh failed: $err');
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<void> _refreshWebinars() async {
    try {
      final doc = await _api.fetchWebinars();
      if (doc['ok'] == false) return;
      final rows = doc['webinars'] is List ? doc['webinars'] as List : const [];
      final live = <LiveClass>[];
      for (final raw in rows) {
        if (raw is! Map) continue;
        final row = Map<String, dynamic>.from(raw);
        final title = '${row['title'] ?? ''}'.trim();
        if (title.isEmpty) continue;
        final when = '${row['when'] ?? row['at'] ?? row['startsAt'] ?? ''}'.trim();
        final mentor =
            '${row['host'] ?? row['mentor'] ?? row['instructor'] ?? 'Bizgarh'}'
                .trim();
        final free = row['free'] == true ||
            row['price'] == 0 ||
            row['price'] == '0' ||
            row['price'] == null;
        live.add(
          LiveClass(
            title: title,
            when: when.isEmpty ? 'Schedule TBA' : when,
            mentor: mentor,
            free: free,
            tag: '${row['tag'] ?? row['kind'] ?? 'Webinar'}',
            listPrice: free
                ? 0
                : int.tryParse('${row['price'] ?? row['old'] ?? 999}') ?? 999,
          ),
        );
      }
      // Empty live list from KV is authoritative (site pruned demo webinars).
      _upcomingLive = live;
    } catch (err) {
      debugPrint('Webinar refresh failed: $err');
    }
  }

  Future<void> _restoreCache() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final raw = prefs.getString(_cacheKey);
      if (raw == null || raw.isEmpty) return;
      final decoded = jsonDecode(raw);
      if (decoded is! Map) return;
      _applyDoc(Map<String, dynamic>.from(decoded));
      _hydrated = true;
      notifyListeners();
    } catch (err) {
      debugPrint('Catalog cache restore failed: $err');
    }
  }

  Future<void> _persistCache(Map<String, dynamic> doc) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final slim = CatalogMerge.slimDocForCache(doc);
      await prefs.setString(_cacheKey, jsonEncode(slim));
    } catch (err) {
      debugPrint('Catalog cache write failed: $err');
    }
  }

  void _applyDoc(Map<String, dynamic> doc) {
    final merged = CatalogMerge.merge(
      seeds: SampleData.courses,
      doc: doc,
      origin: _api.origin,
    );
    if (merged.isEmpty) {
      // Never blank the UI if Control returns an empty public set.
      _courses = List<Course>.from(SampleData.courses);
    } else {
      _courses = merged;
    }
    _mentors = CatalogMerge.mentorsFromCourses(_courses);
  }
}

class CatalogScope extends InheritedNotifier<CatalogState> {
  const CatalogScope({
    super.key,
    required CatalogState notifier,
    required super.child,
  }) : super(notifier: notifier);

  static CatalogState of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<CatalogScope>();
    assert(scope != null, 'CatalogScope not found');
    return scope!.notifier!;
  }

  static CatalogState read(BuildContext context) {
    final scope = context.getInheritedWidgetOfExactType<CatalogScope>();
    assert(scope != null, 'CatalogScope not found');
    return scope!.notifier!;
  }
}
