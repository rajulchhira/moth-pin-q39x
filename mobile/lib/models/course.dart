class CommunityRoom {
  const CommunityRoom({
    required this.id,
    required this.label,
    required this.url,
    this.live = true,
  });

  final String id;
  final String label;
  final String url;
  final bool live;
}

class Course {
  const Course({
    required this.id,
    required this.title,
    required this.instructor,
    required this.learners,
    required this.rating,
    required this.price,
    required this.oldPrice,
    required this.category,
    required this.hours,
    required this.lessons,
    required this.coverLabel,
    required this.coverColors,
    this.coverImageAsset,
    this.description = '',
    this.learn = const <String>[],
    this.communityOpen = false,
    this.communityRooms = const <CommunityRoom>[],
  });

  final String id;
  final String title;
  final String instructor;
  final String learners;
  final double rating;
  final int price;
  final int oldPrice;
  final String category;
  final String hours;
  final int lessons;
  final String coverLabel;
  final List<int> coverColors;
  /// Live catalog banner / thumb (preferred over gradient + instructor overlay).
  final String? coverImageAsset;
  /// Public about copy — mirrors live `/api/catalog/courses` edit.
  final String description;
  /// “What you will learn” bullets from live catalog.
  final List<String> learn;
  /// When true, Community links open without purchase (live Slingshot seed).
  final bool communityOpen;
  final List<CommunityRoom> communityRooms;
}

class EnrolledCourse {
  const EnrolledCourse({
    required this.course,
    required this.progress,
    required this.nextLesson,
    required this.status,
    this.txnId,
    this.orderId,
    this.purchasedAt,
    this.amount,
    this.paymentMethod,
  });

  final Course course;
  final double progress;
  final String nextLesson;
  final String status;
  /// Purchase detail — mirrors website My Purchases expand panel.
  final String? txnId;
  final String? orderId;
  /// ISO-8601 purchase timestamp.
  final String? purchasedAt;
  final int? amount;
  final String? paymentMethod;
}

class Mentor {
  const Mentor({
    required this.name,
    required this.title,
    required this.tags,
    required this.learners,
    required this.initials,
    required this.accent,
    this.photoAsset,
  });

  final String name;
  final String title;
  final List<String> tags;
  final String learners;
  final String initials;
  final int accent;
  final String? photoAsset;
}

class PopularCategory {
  const PopularCategory({
    required this.id,
    required this.title,
    required this.kind,
    this.badge,
  });

  final String id;
  final String title;
  /// Icon style key used by [CategoryGlyph].
  final String kind;
  final String? badge;
}

class SampleUser {
  const SampleUser({
    required this.name,
    required this.email,
    required this.city,
    required this.joined,
    required this.initials,
  });

  final String name;
  final String email;
  final String city;
  final String joined;
  final String initials;
}


class CourseMenuItem {
  const CourseMenuItem({
    required this.id,
    required this.title,
    required this.desc,
    required this.accent,
  });

  final String id;
  final String title;
  final String desc;
  final int accent;
}

class LiveClass {
  const LiveClass({
    required this.title,
    required this.when,
    required this.mentor,
    this.free = true,
    this.tag = 'Webinar',
    this.listPrice = 999,
    this.coverColors = const [0xFF0B1220, 0xFF1E1B4B, 0xFF4F46E5],
  });

  final String title;
  final String when;
  final String mentor;
  final bool free;
  final String tag;
  final int listPrice;
  final List<int> coverColors;
}

class FaqItem {
  const FaqItem({required this.question, required this.answer});

  final String question;
  final String answer;
}
