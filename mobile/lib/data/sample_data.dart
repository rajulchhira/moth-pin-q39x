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

  /// Upcoming live webinars — mirrored from site `WEBINARS` on the homepage.
  static const upcomingLive = <LiveClass>[
    LiveClass(
      title: 'Gap & Go for Nifty Options',
      when: '18 Sep 2026 • 11:00 am',
      mentor: 'Aarav Mehta',
      tag: 'Intraday',
      coverColors: [0xFF0B1220, 0xFF1E3A5F, 0xFF4F46E5],
    ),
    LiveClass(
      title: 'Defined-Risk Credit Spreads',
      when: '20 Sep 2026 • 08:00 pm',
      mentor: 'Neha Kapoor',
      tag: 'Options',
      coverColors: [0xFF1C1917, 0xFF9A3412, 0xFFE11D74],
    ),
    LiveClass(
      title: 'Reading Weekly Structure',
      when: '22 Sep 2026 • 07:30 pm',
      mentor: 'Vikram Singh',
      tag: 'Swing',
      coverColors: [0xFF042F2E, 0xFF0F766E, 0xFF134E4A],
    ),
  ];

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

  static const mentors = <Mentor>[
    Mentor(
      name: 'Aarav Mehta',
      title: 'Full-time trader, Bizgarh desk',
      tags: ['Intraday', 'Nifty options'],
      learners: '50,483',
      initials: 'AM',
      accent: 0xFF4F46E5,
      photoAsset: 'assets/mentors/aarav-mehta.jpg',
    ),
    Mentor(
      name: 'Neha Kapoor',
      title: 'Options specialist, defined risk',
      tags: ['Credit spreads', 'Weekly income'],
      learners: '36,800',
      initials: 'NK',
      accent: 0xFFE11D74,
      photoAsset: 'assets/mentors/neha-kapoor.jpg',
    ),
    Mentor(
      name: 'Vikram Singh',
      title: 'Price action coach',
      tags: ['Swing', 'Structure'],
      learners: '28,220',
      initials: 'VS',
      accent: 0xFF0F766E,
      photoAsset: 'assets/mentors/vikram-singh.jpg',
    ),
    Mentor(
      name: 'Ananya Rao',
      title: 'Long-term investor',
      tags: ['Portfolio', 'SIP'],
      learners: '33,650',
      initials: 'AR',
      accent: 0xFFF59E0B,
      photoAsset: 'assets/mentors/ananya-rao.jpg',
    ),
    Mentor(
      name: 'Kabir Joshi',
      title: 'Index options, Bank Nifty',
      tags: ['Index options', 'Bank Nifty'],
      learners: '22,410',
      initials: 'KJ',
      accent: 0xFF1D4ED8,
      photoAsset: 'assets/mentors/kabir-joshi.jpg',
    ),
    Mentor(
      name: 'Rohan Desai',
      title: 'Fund researcher',
      tags: ['Mutual funds'],
      learners: '19,880',
      initials: 'RD',
      accent: 0xFF0F766E,
      photoAsset: 'assets/mentors/rohan-desai.jpg',
    ),
    Mentor(
      name: 'Priya Nair',
      title: 'Asset allocation, SIP lab',
      tags: ['SIP', 'Allocation'],
      learners: '17,240',
      initials: 'PN',
      accent: 0xFF7C3AED,
      photoAsset: 'assets/mentors/priya-nair.jpg',
    ),
    Mentor(
      name: 'Meera Iyer',
      title: 'Options coach, defined risk',
      tags: ['Defined risk'],
      learners: '24,100',
      initials: 'MI',
      accent: 0xFFDB2777,
      photoAsset: 'assets/mentors/meera-iyer.jpg',
    ),
  ];

  static const courses = <Course>[
    Course(
      id: 'breakout',
      title: 'Intraday Breakout Blueprint',
      instructor: 'Aarav Mehta',
      learners: '12,480',
      rating: 4.8,
      price: 799,
      oldPrice: 1999,
      category: 'trending',
      hours: '6.5',
      lessons: 18,
      coverLabel: 'BREAKOUT',
      coverColors: [0xFF0B1220, 0xFF1E3A5F, 0xFF0F766E],
    ),
    Course(
      id: 'income',
      title: 'Weekly Options Income Playbook',
      instructor: 'Neha Kapoor',
      learners: '28,910',
      rating: 4.9,
      price: 499,
      oldPrice: 1499,
      category: 'trending',
      hours: '8.0',
      lessons: 22,
      coverLabel: 'WEEKLY OPTIONS',
      coverColors: [0xFF1C1917, 0xFF9A3412],
    ),
    Course(
      id: 'price-action',
      title: 'Price Action Without Indicators',
      instructor: 'Vikram Singh',
      learners: '9,340',
      rating: 4.8,
      price: 899,
      oldPrice: 2199,
      category: 'trending',
      hours: '7.0',
      lessons: 16,
      coverLabel: 'PRICE ACTION',
      coverColors: [0xFF0F172A, 0xFF334155],
    ),
    Course(
      id: 'opening-range',
      title: 'Opening Range for Index Options',
      instructor: 'Kabir Joshi',
      learners: '6,112',
      rating: 4.7,
      price: 999,
      oldPrice: 2499,
      category: 'trending',
      hours: '5.5',
      lessons: 14,
      coverLabel: 'OPENING RANGE',
      coverColors: [0xFF1E1B4B, 0xFF1D4ED8],
    ),
    Course(
      id: 'long-term',
      title: 'How to Build a 10-Year Stock Portfolio',
      instructor: 'Ananya Rao',
      learners: '15,220',
      rating: 4.8,
      price: 399,
      oldPrice: 999,
      category: 'investing',
      hours: '5.0',
      lessons: 12,
      coverLabel: '10-YEAR BOOK',
      coverColors: [0xFF042F2E, 0xFF0F766E],
    ),
    Course(
      id: 'mf-guide',
      title: 'Mutual Funds Made Simple',
      instructor: 'Rohan Desai',
      learners: '11,004',
      rating: 4.7,
      price: 299,
      oldPrice: 799,
      category: 'investing',
      hours: '4.0',
      lessons: 10,
      coverLabel: 'MUTUAL FUNDS',
      coverColors: [0xFF1A2E05, 0xFF4D7C0F],
    ),
    Course(
      id: 'opt-start',
      title: 'Options from Zero',
      instructor: 'Meera Iyer',
      learners: '21,550',
      rating: 4.8,
      price: 449,
      oldPrice: 1199,
      category: 'options',
      hours: '7.5',
      lessons: 20,
      coverLabel: 'OPTIONS ZERO',
      coverColors: [0xFF431407, 0xFFC2410C],
    ),
    Course(
      id: 'spreads',
      title: 'Spreads & Defined-Risk Setups',
      instructor: 'Neha Kapoor',
      learners: '7,890',
      rating: 4.8,
      price: 699,
      oldPrice: 1799,
      category: 'options',
      hours: '6.0',
      lessons: 15,
      coverLabel: 'DEFINED RISK',
      coverColors: [0xFF1E1B4B, 0xFF4338CA],
    ),
    Course(
      id: 'first-month',
      title: 'Your First 30 Days in Markets',
      instructor: 'Aarav Mehta',
      learners: '33,001',
      rating: 4.9,
      price: 199,
      oldPrice: 599,
      category: 'beginners',
      hours: '4.5',
      lessons: 11,
      coverLabel: 'FIRST 30 DAYS',
      coverColors: [0xFF022C22, 0xFF0F766E],
    ),
    Course(
      id: 'charts-101',
      title: 'Reading Charts for Beginners',
      instructor: 'Vikram Singh',
      learners: '14,670',
      rating: 4.7,
      price: 299,
      oldPrice: 799,
      category: 'beginners',
      hours: '5.0',
      lessons: 13,
      coverLabel: 'CHARTS 101',
      coverColors: [0xFF111827, 0xFF374151],
    ),
    Course(
      id: 'candles',
      title: 'Candlestick Context Course',
      instructor: 'Kabir Joshi',
      learners: '10,240',
      rating: 4.8,
      price: 399,
      oldPrice: 999,
      category: 'ta',
      hours: '5.5',
      lessons: 12,
      coverLabel: 'CANDLES',
      coverColors: [0xFF052E16, 0xFF166534],
    ),
    Course(
      id: 'hindi-ta',
      title: 'टेक्निकल एनालिसिस हिंदी में',
      instructor: 'Ananya Rao',
      learners: '18,430',
      rating: 4.8,
      price: 399,
      oldPrice: 999,
      category: 'hindi',
      hours: '6.5',
      lessons: 16,
      coverLabel: 'हिंदी TA',
      coverColors: [0xFF042F2E, 0xFF0F766E],
    ),
    Course(
      id: 'crypto-lab',
      title: 'Crypto Spot & Risk Basics',
      instructor: 'Priya Nair',
      learners: '6,540',
      rating: 4.6,
      price: 499,
      oldPrice: 1299,
      category: 'crypto',
      hours: '5.0',
      lessons: 12,
      coverLabel: 'CRYPTO SPOT',
      coverColors: [0xFF020617, 0xFF111827],
    ),
    Course(
      id: 'ema-swing',
      title: 'EMA Pullback Swing System',
      instructor: 'Vikram Singh',
      learners: '4,210',
      rating: 4.7,
      price: 249,
      oldPrice: 699,
      category: 'strategy',
      hours: '3.5',
      lessons: 8,
      coverLabel: 'EMA SWING',
      coverColors: [0xFF1E1B4B, 0xFF4F46E5],
    ),
  ];

  static List<Course> featuredCourses() =>
      courses.where((c) => c.category == 'trending').take(4).toList();

  /// Trending / most-popular strip (highest learners first for popular feel).
  static List<Course> popularCourses() {
    final popular =
        courses.where((c) => c.category == 'trending').toList(growable: false);
    return List<Course>.from(popular)
      ..sort((a, b) {
        int learnersOf(Course c) =>
            int.tryParse(c.learners.replaceAll(',', '')) ?? 0;
        return learnersOf(b).compareTo(learnersOf(a));
      });
  }

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
      course: courses.firstWhere((c) => c.id == 'opt-start', orElse: () => courses.first),
      progress: 0.62,
      nextLesson: 'Lesson 13 · Put credit spreads',
      status: 'In progress',
    ),
    EnrolledCourse(
      course: courses.firstWhere((c) => c.id == 'breakout', orElse: () => courses.first),
      progress: 0.35,
      nextLesson: 'Lesson 7 · Gap acceptance',
      status: 'In progress',
    ),
    EnrolledCourse(
      course: courses.firstWhere((c) => c.id == 'first-month', orElse: () => courses.first),
      progress: 1.0,
      nextLesson: 'Completed · Review your journal',
      status: 'Completed',
    ),
    EnrolledCourse(
      course: courses.firstWhere((c) => c.id == 'hindi-ta', orElse: () => courses.first),
      progress: 0.18,
      nextLesson: 'पाठ 3 · सपोर्ट और रेसिस्टेंस',
      status: 'In progress',
    ),
  ];
}
