import '../models/course.dart';

/// Static sample catalog mirrored from `js/app.js` COURSES / mentors.
abstract final class SampleData {
  static const user = SampleUser(
    name: 'Riya Sharma',
    email: 'riya.sharma@example.com',
    city: 'Mumbai',
    joined: 'Joined Mar 2025',
    initials: 'RS',
  );

  static const supportEmail = 'desk@bizgarh.com';

  /// Course menu (site mega / home chips) — Hindi & Finance Certification removed.
  static const courseMenu = <CourseMenuItem>[
    CourseMenuItem(
      id: 'investing',
      title: 'Stock Market Investing',
      desc: 'Patient, long-term courses.',
      accent: 0xFF4F46E5,
    ),
    CourseMenuItem(
      id: 'options',
      title: 'Option Trading',
      desc: 'Defined-risk option courses.',
      accent: 0xFF7C3AED,
    ),
    CourseMenuItem(
      id: 'beginners',
      title: 'Stock Market Basics',
      desc: 'Beginner-friendly classrooms.',
      accent: 0xFF0284C7,
    ),
    CourseMenuItem(
      id: 'ta',
      title: 'Technical Analysis',
      desc: 'Candles, levels, structure.',
      accent: 0xFF16A34A,
    ),
    CourseMenuItem(
      id: 'crypto',
      title: 'Crypto',
      desc: 'Spot, risk, and sizing.',
      accent: 0xFFCA8A04,
    ),
    CourseMenuItem(
      id: 'strategy',
      title: 'Trading Strategies',
      desc: 'Checklists to systems.',
      accent: 0xFFDB2777,
    ),
  ];

  /// Home “Popular Categories” — only the six course-menu names (no Mentorship / NISM / Algo / Hindi).
  static const popularCategories = <PopularCategory>[
    PopularCategory(
      id: 'investing',
      title: 'Stock Market Investing',
      kind: 'investing',
    ),
    PopularCategory(
      id: 'options',
      title: 'Option Trading',
      kind: 'cepe',
    ),
    PopularCategory(
      id: 'beginners',
      title: 'Stock Market Basics',
      kind: 'bars',
    ),
    PopularCategory(
      id: 'ta',
      title: 'Technical Analysis',
      kind: 'candle',
    ),
    PopularCategory(
      id: 'crypto',
      title: 'Crypto',
      kind: 'crypto',
      badge: 'NEW',
    ),
    PopularCategory(
      id: 'strategy',
      title: 'Trading Strategies',
      kind: 'strategy',
    ),
  ];

  static String? photoAssetForInstructor(String name) {
    switch (name) {
      case 'Rehan Khan':
        return 'assets/mentors/rehan-khan.jpg';
      case 'Aarav Mehta':
        return 'assets/mentors/aarav-mehta.jpg';
      case 'Neha Kapoor':
        return 'assets/mentors/neha-kapoor.jpg';
      case 'Vikram Singh':
        return 'assets/mentors/vikram-singh.jpg';
      case 'Ananya Rao':
        return 'assets/mentors/ananya-rao.jpg';
      case 'Kabir Joshi':
        return 'assets/mentors/kabir-joshi.jpg';
      case 'Rohan Desai':
        return 'assets/mentors/rohan-desai.jpg';
      case 'Priya Nair':
        return 'assets/mentors/priya-nair.jpg';
      case 'Meera Iyer':
        return 'assets/mentors/meera-iyer.jpg';
      default:
        return null;
    }
  }

  static const categories = <String>[
    'all',
    'trending',
    'beginners',
    'options',
    'investing',
    'ta',
    'crypto',
    'strategy',
  ];

  static String categoryLabel(String id) {
    switch (id) {
      case 'all':
        return 'All';
      case 'trending':
        return 'Popular';
      case 'beginners':
        return 'Beginners';
      case 'options':
        return 'Options';
      case 'investing':
        return 'Investing';
      case 'ta':
        return 'Charts';
      case 'crypto':
        return 'Crypto';
      case 'strategy':
        return 'Strategies';
      default:
        return id;
    }
  }

  /// Full library title — matches site `/courses?cat=` labels.
  static String libraryLabel(String id) {
    switch (id) {
      case 'all':
        return 'All courses';
      case 'trending':
        return 'Trending';
      case 'investing':
        return 'Stock Market Investing';
      case 'options':
        return 'Option Trading';
      case 'beginners':
        return 'Stock Market Basics';
      case 'ta':
        return 'Technical Analysis';
      case 'crypto':
        return 'Crypto';
      case 'strategy':
        return 'Trading Strategies';
      case 'hindi':
        return 'In Hindi';
      default:
        return categoryLabel(id);
    }
  }

  /// Upcoming live webinars for Home — keep in sync with the site live catalog
  /// (`js/app.js` `listedWebinars()` / homepage `#webinarTrack`).
  /// Empty while nothing is currently scheduled (site track is blank too);
  /// when lives are added on the site, mirror them here so both show cards.
  static const upcomingLive = <LiveClass>[];

  static const faqItems = <FaqItem>[
    FaqItem(
      question: 'Do I need an account?',
      answer:
          'Yes. Sign in to enroll, join a live room, continue a classroom, or see certificates.',
    ),
    FaqItem(
      question: 'How do I start if I am new?',
      answer:
          'Open Courses, pick a beginner classroom, or sit in a live webinar first.',
    ),
    FaqItem(
      question: 'When do I get a certificate?',
      answer:
          'After you finish every lesson in that classroom. View it from My certificate.',
    ),
    FaqItem(
      question: 'How do refunds work?',
      answer:
          'Write desk@bizgarh.com with your login email and course title within the refund window.',
    ),
  ];

  /// Live public instructor strip currently centers on Rehan (others hidden on web).
  static const mentors = <Mentor>[
    Mentor(
      name: 'Rehan Khan',
      title: 'Stock market instructor',
      tags: ['Forex', 'Indian markets', '5-min edge'],
      learners: '1,240',
      initials: 'RK',
      accent: 0xFFC2410C,
      photoAsset: 'assets/mentors/rehan-khan.jpg',
    ),
  ];

  /// Mirrors live KV catalog (`/api/catalog/courses` + COURSE_ROOM_SEEDS).
  static const courses = <Course>[
    Course(
      id: 'slingshot',
      title: 'Slingshot: The 5-Minute Trading Edge',
      instructor: 'Rehan Khan',
      learners: '1,240',
      rating: 4.9,
      price: 449,
      oldPrice: 999,
      category: 'strategy',
      hours: '5.0',
      lessons: 6,
      coverLabel: 'SLINGSHOT',
      coverColors: [0xFF0B1220, 0xFF1E3A5F, 0xFFC2410C],
      coverImageAsset: 'assets/courses/slingshot-banner.jpg',
      description:
          'Jumping in too early on a falling market often leads to avoidable losses. This course shows how the slingshot stretches, when to wait for the real shift above the 9 EMA, and how strict rules help you trade with confidence. Practice on NASDAQ and Bitcoin 5-minute charts and turn patience into your biggest edge.',
      learn: [
        'Master simple 5-minute NASDAQ and BTC chart setups.',
        'Avoid bad trades using a clear no-trade checklist.',
        'Time entries cleanly with four exact slingshot rules.',
        'Size trades smartly so two losses stay manageable.',
        'Backtest past charts and build real trading confidence.',
      ],
      // Hindi is Original; English is the translation (matches web courseLangs).
      languages: ['Hindi', 'English'],
      communityOpen: true,
      communityRooms: [
        CommunityRoom(
          id: 'youtube',
          label: 'YouTube',
          url:
              'https://youtube.com/@trading.house.official?si=j6Dbp6FqD3O5N2FO',
        ),
        CommunityRoom(
          id: 'telegram',
          label: 'Telegram',
          url: 'https://t.me/tradinghouseTH',
        ),
      ],
    ),
  ];

  static List<Course> featuredCourses() => List<Course>.from(courses);

  /// Public catalog currently ships a single classroom.
  static List<Course> popularCourses() => List<Course>.from(courses);

  static List<Course> search({
    required String query,
    required String category,
  }) {
    final q = query.trim().toLowerCase();
    return courses.where((c) {
      final catOk = category == 'all' || c.category == category;
      if (!catOk) return false;
      if (q.isEmpty) return true;
      return c.title.toLowerCase().contains(q) ||
          c.instructor.toLowerCase().contains(q) ||
          c.category.toLowerCase().contains(q) ||
          c.coverLabel.toLowerCase().contains(q);
    }).toList();
  }

  static List<EnrolledCourse> enrolled = [
    EnrolledCourse(
      course: courses.firstWhere((c) => c.id == 'slingshot', orElse: () => courses.first),
      progress: 0.42,
      nextLesson: 'Lesson 5 · The 5-minute edge checklist',
      status: 'In progress',
      txnId: 'TXNDEMOSLING01',
      orderId: 'ord-demo-slingshot',
      purchasedAt: '2026-08-12T11:00:00.000Z',
      amount: 449,
      paymentMethod: 'UPI',
    ),
    EnrolledCourse(
      course: courses.firstWhere((c) => c.id == 'slingshot', orElse: () => courses.first),
      progress: 1.0,
      nextLesson: 'Completed · Review your journal',
      status: 'Completed',
      txnId: 'TXNDEMOSLING02',
      orderId: 'ord-demo-slingshot-2',
      purchasedAt: '2026-09-04T14:00:00.000Z',
      amount: 449,
      paymentMethod: 'UPI',
    ),
  ];
}
