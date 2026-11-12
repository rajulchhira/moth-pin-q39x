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
}

class EnrolledCourse {
  const EnrolledCourse({
    required this.course,
    required this.progress,
    required this.nextLesson,
    required this.status,
  });

  final Course course;
  final double progress;
  final String nextLesson;
  final String status;
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
  });

  final String title;
  final String when;
  final String mentor;
}

class FaqItem {
  const FaqItem({required this.question, required this.answer});

  final String question;
  final String answer;
}
