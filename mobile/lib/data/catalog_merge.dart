import '../models/course.dart';
import 'sample_data.dart';

/// Pure merge of live KV catalog (`/api/catalog/courses`) onto bundled seeds.
/// Mirrors public `allCourses()` on the website (keep-course + live extras).
abstract final class CatalogMerge {
  static const retiredPublicIds = <String>{
    'breakout',
    'income',
    'price-action',
    'opening-range',
    'long-term',
    'mf-guide',
    'sip',
    'opt-start',
    'spreads',
    'first-month',
    'charts-101',
    'candles',
    'levels',
    'hindi-ta',
    'hindi-swing',
    'crypto-lab',
    'ema-swing',
    'vwap',
  };

  static const _roomLabels = <String, String>{
    'whatsapp': 'WhatsApp',
    'discord': 'Discord',
    'youtube': 'YouTube',
    'telegram': 'Telegram',
  };

  static const _coverPalette = <List<int>>[
    [0xFF0B1220, 0xFF1E3A5F, 0xFFC2410C],
    [0xFF0B1220, 0xFF1E1B4B, 0xFF4F46E5],
    [0xFF0F172A, 0xFF164E63, 0xFF0891B2],
    [0xFF111827, 0xFF3F1D4D, 0xFFDB2777],
    [0xFF0B1220, 0xFF14532D, 0xFF16A34A],
  ];

  static String titleKey(String? title) =>
      (title ?? '').toLowerCase().replaceAll(RegExp(r'\s+'), ' ').trim();

  static bool isPublicKeepCourse({String? id, String? title}) {
    if (id == 'slingshot') return true;
    return RegExp(
      r'^slingshot:\s*the\s*5[- ]?minute\s+trading\s+edge$',
      caseSensitive: false,
    ).hasMatch((title ?? '').replaceAll(RegExp(r'\s+'), ' ').trim());
  }

  static bool isPubliclyListed(Map<String, dynamic> row) {
    if (row['deleted'] == true) return false;
    if (row['unpublished'] == true) return false;
    if (row['status'] == 'unlisted') return false;
    return true;
  }

  /// Absolute URL for a banner/media path against [origin].
  static String? resolveMediaUrl(String? raw, String origin) {
    final v = (raw ?? '').trim();
    if (v.isEmpty) return null;
    if (v.startsWith('data:') ||
        v.startsWith('http://') ||
        v.startsWith('https://')) {
      return v;
    }
    if (v.startsWith('/')) {
      return '$origin$v';
    }
    return v;
  }

  static List<Course> merge({
    required List<Course> seeds,
    required Map<String, dynamic> doc,
    String origin = 'https://www.bizgarh.com',
  }) {
    final edits = _asMapMap(doc['edits']);
    final hidden = (doc['hidden'] is List)
        ? (doc['hidden'] as List).map((e) => e.toString()).toSet()
        : <String>{};
    final rooms = _asMapMap(doc['rooms']);
    final videos = doc['videos'] is Map
        ? Map<String, dynamic>.from(doc['videos'] as Map)
        : <String, dynamic>{};
    final extrasRaw = doc['extras'] is List ? doc['extras'] as List : const [];

    final seedIds = seeds.map((c) => c.id).toSet();

    final mergedSeeds = <Course>[];
    for (final seed in seeds) {
      final patch = edits[seed.id];
      final row = <String, dynamic>{
        'id': seed.id,
        'title': seed.title,
        'instructor': seed.instructor,
        'learners': seed.learners,
        'rating': seed.rating,
        'price': seed.price,
        'old': seed.oldPrice,
        'cat': seed.category,
        'hours': seed.hours,
        'lessons': seed.lessons,
        'description': seed.description,
        'learn': seed.learn,
        'languages': seed.languages,
        if (patch != null) ...patch,
      };
      if (hidden.contains(seed.id)) continue;
      if (!isPubliclyListed(row)) continue;
      if (!isPublicKeepCourse(id: seed.id, title: '${row['title']}')) {
        // Public catalog only keeps Slingshot from the seed list.
        continue;
      }
      mergedSeeds.add(
        _courseFromRow(
          row,
          base: seed,
          roomsDoc: rooms[seed.id],
          videosDoc: videos[seed.id],
          origin: origin,
        ),
      );
    }

    final extras = <Course>[];
    for (final raw in extrasRaw) {
      if (raw is! Map) continue;
      final row = Map<String, dynamic>.from(raw);
      final id = '${row['id'] ?? ''}'.trim();
      if (id.isEmpty) continue;
      if (seedIds.contains(id)) continue;
      if (retiredPublicIds.contains(id)) continue;
      if (hidden.contains(id)) continue;
      if (!isPubliclyListed(row)) continue;
      // Keep-title extras must not shadow the live keep seed.
      if (isPublicKeepCourse(id: id, title: '${row['title']}')) continue;
      extras.add(
        _courseFromRow(
          row,
          base: null,
          roomsDoc: rooms[id],
          videosDoc: videos[id],
          origin: origin,
        ),
      );
    }

    final list = <Course>[...mergedSeeds, ...extras];
    final seen = <String>{};
    return list.where((c) {
      final key = isPublicKeepCourse(id: c.id, title: c.title)
          ? 'keep:${seedIds.contains(c.id) ? c.id : titleKey(c.title)}'
          : (titleKey(c.title).isNotEmpty ? titleKey(c.title) : c.id);
      if (seen.contains(key)) return false;
      seen.add(key);
      return true;
    }).toList(growable: false);
  }

  /// Strip oversized `data:` banners before SharedPreferences cache.
  static Map<String, dynamic> slimDocForCache(Map<String, dynamic> doc) {
    final out = Map<String, dynamic>.from(doc);
    out['edits'] = _slimPatchMap(_asMapMap(doc['edits']));
    final extras = <dynamic>[];
    for (final raw in (doc['extras'] is List ? doc['extras'] as List : const [])) {
      if (raw is! Map) continue;
      final row = Map<String, dynamic>.from(raw);
      final banner = '${row['banner'] ?? ''}';
      if (banner.startsWith('data:') && banner.length > 8000) {
        row.remove('banner');
      }
      extras.add(row);
    }
    out['extras'] = extras;
    // Curriculum blobs are large and unused for the course list UI.
    out.remove('videos');
    out.remove('syllabus');
    return out;
  }

  static Map<String, Map<String, dynamic>> _slimPatchMap(
    Map<String, Map<String, dynamic>> src,
  ) {
    final out = <String, Map<String, dynamic>>{};
    for (final e in src.entries) {
      final row = Map<String, dynamic>.from(e.value);
      final banner = '${row['banner'] ?? ''}';
      if (banner.startsWith('data:') && banner.length > 8000) {
        row.remove('banner');
      }
      out[e.key] = row;
    }
    return out;
  }

  static Map<String, Map<String, dynamic>> _asMapMap(dynamic raw) {
    if (raw is! Map) return {};
    final out = <String, Map<String, dynamic>>{};
    raw.forEach((key, value) {
      if (value is Map) {
        out['$key'] = Map<String, dynamic>.from(value);
      }
    });
    return out;
  }

  static Course _courseFromRow(
    Map<String, dynamic> row, {
    required Course? base,
    required Map<String, dynamic>? roomsDoc,
    required dynamic videosDoc,
    required String origin,
  }) {
    final id = '${row['id'] ?? base?.id ?? ''}'.trim();
    final title = '${row['title'] ?? base?.title ?? 'Course'}'.trim();
    final instructor =
        '${row['instructor'] ?? base?.instructor ?? 'Bizgarh'}'.trim();
    final cat = '${row['cat'] ?? row['category'] ?? base?.category ?? 'strategy'}'
        .trim();
    final price = _asInt(row['price'], base?.price ?? 0);
    final oldPrice = _asInt(row['old'] ?? row['oldPrice'], base?.oldPrice ?? price);
    final lessonsFromVideos =
        videosDoc is List ? videosDoc.length : null;
    final lessons = lessonsFromVideos ??
        _asInt(row['lessons'], base?.lessons ?? 0);
    final hours = '${row['hours'] ?? base?.hours ?? '—'}';
    final description =
        '${row['description'] ?? base?.description ?? ''}'.trim();
    final learn = _asStringList(row['learn'], base?.learn ?? const []);
    final languages =
        _asStringList(row['languages'], base?.languages ?? const ['English', 'Hindi']);
    final learners = '${row['learners'] ?? base?.learners ?? '—'}';
    final rating = _asDouble(row['rating'], base?.rating ?? 4.8);
    final banner = resolveMediaUrl(
      row['banner']?.toString() ?? row['cover']?.toString(),
      origin,
    );
    final rooms = _roomsFromDoc(roomsDoc, base);
    final communityOpen = rooms.$1;
    final communityRooms = rooms.$2;
    final coverLabel = title
        .split(RegExp(r'[:\-–—]'))
        .first
        .trim()
        .toUpperCase();
    final palette = _coverPalette[id.hashCode.abs() % _coverPalette.length];

    return Course(
      id: id,
      title: title,
      instructor: instructor,
      learners: learners,
      rating: rating,
      price: price,
      oldPrice: oldPrice,
      category: cat == 'trending' ? 'strategy' : cat,
      hours: hours,
      lessons: lessons,
      coverLabel: coverLabel.isEmpty
          ? (base?.coverLabel ?? 'COURSE')
          : coverLabel,
      coverColors: base?.coverColors ?? palette,
      coverImageAsset: banner == null ? base?.coverImageAsset : null,
      coverImageUrl: banner ?? base?.coverImageUrl,
      description: description.isEmpty ? (base?.description ?? '') : description,
      learn: learn.isEmpty ? (base?.learn ?? const []) : learn,
      languages: languages.isEmpty
          ? (base?.languages ?? const ['English', 'Hindi'])
          : languages,
      communityOpen: communityOpen,
      communityRooms: communityRooms,
    );
  }

  static (bool, List<CommunityRoom>) _roomsFromDoc(
    Map<String, dynamic>? roomsDoc,
    Course? base,
  ) {
    if (roomsDoc == null) {
      return (
        base?.communityOpen ?? false,
        base?.communityRooms ?? const <CommunityRoom>[],
      );
    }
    final open = roomsDoc['open'] == true || roomsDoc['open'] == '1';
    final rooms = <CommunityRoom>[];
    for (final id in _roomLabels.keys) {
      final row = roomsDoc[id];
      if (row is! Map) continue;
      final live = row['live'] == true || row['live'] == '1';
      final url = '${row['url'] ?? ''}'.trim();
      if (!live || url.isEmpty) continue;
      rooms.add(
        CommunityRoom(
          id: id,
          label: _roomLabels[id]!,
          url: url,
          live: true,
        ),
      );
    }
    if (rooms.isEmpty && base != null) {
      return (open || base.communityOpen, base.communityRooms);
    }
    return (open, rooms);
  }

  static int _asInt(dynamic v, int fallback) {
    if (v is int) return v;
    if (v is num) return v.round();
    if (v is String) return int.tryParse(v.trim()) ?? fallback;
    return fallback;
  }

  static double _asDouble(dynamic v, double fallback) {
    if (v is double) return v;
    if (v is num) return v.toDouble();
    if (v is String) return double.tryParse(v.trim()) ?? fallback;
    return fallback;
  }

  static List<String> _asStringList(dynamic v, List<String> fallback) {
    if (v is! List) return fallback;
    final out = v.map((e) => '$e'.trim()).where((e) => e.isNotEmpty).toList();
    return out.isEmpty ? fallback : out;
  }

  /// Mentors derived from the live course list (unique instructors).
  static List<Mentor> mentorsFromCourses(List<Course> courses) {
    final seen = <String>{};
    final out = <Mentor>[];
    for (final c in courses) {
      final name = c.instructor.trim();
      if (name.isEmpty || !seen.add(name.toLowerCase())) continue;
      final bundled = SampleData.photoAssetForInstructor(name);
      final parts = name.split(RegExp(r'\s+')).where((p) => p.isNotEmpty);
      final initials = parts.isEmpty
          ? 'BG'
          : parts.take(2).map((p) => p[0].toUpperCase()).join();
      out.add(
        Mentor(
          name: name,
          title: 'Stock market instructor',
          tags: const ['Bizgarh classroom'],
          learners: c.learners,
          initials: initials,
          accent: c.coverColors.isNotEmpty ? c.coverColors.last : 0xFF4F46E5,
          photoAsset: bundled,
        ),
      );
    }
    return out.isEmpty ? SampleData.mentors : out;
  }
}
