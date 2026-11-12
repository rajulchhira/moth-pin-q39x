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
  });

  final String name;
  final String title;
  final List<String> tags;
  final String learners;
  final String initials;
  final int accent;
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
