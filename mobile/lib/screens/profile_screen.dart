import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../data/sample_data.dart';
import '../models/course.dart';
import '../state/auth_state.dart';
import '../theme/colors.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = AuthScope.of(context);
    const user = SampleData.user;

    return SafeArea(
      bottom: false,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 28),
        children: [
          Text(
            'Profile',
            style: GoogleFonts.nunito(
              fontWeight: FontWeight.w800,
              fontSize: 28,
              letterSpacing: -0.6,
            ),
          ),
          const SizedBox(height: 18),
          if (auth.isSignedIn)
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(24),
                gradient: BgColors.brandGradient,
              ),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 32,
                    backgroundColor: Colors.white.withOpacity(0.2),
                    child: Text(
                      user.initials,
                      style: GoogleFonts.nunito(
                        fontWeight: FontWeight.w800,
                        fontSize: 22,
                        color: Colors.white,
                      ),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          user.name,
                          style: GoogleFonts.nunito(
                            fontWeight: FontWeight.w800,
                            fontSize: 20,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          user.email,
                          style: GoogleFonts.nunito(
                            fontWeight: FontWeight.w600,
                            fontSize: 13,
                            color: Colors.white.withOpacity(0.85),
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          '${user.city} · ${user.joined}',
                          style: GoogleFonts.nunito(
                            fontWeight: FontWeight.w700,
                            fontSize: 12,
                            color: Colors.white.withOpacity(0.78),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            )
          else
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: BgColors.white,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: BgColors.line),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Welcome to Bizgarh',
                    style: GoogleFonts.nunito(
                      fontWeight: FontWeight.w800,
                      fontSize: 18,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Sign in to see purchases, certificates, and My Learning.',
                    style: GoogleFonts.nunito(
                      fontWeight: FontWeight.w600,
                      fontSize: 13,
                      color: BgColors.muted,
                    ),
                  ),
                  const SizedBox(height: 14),
                  FilledButton(
                    onPressed: () => AuthScope.read(context).signIn(),
                    style: FilledButton.styleFrom(
                      backgroundColor: BgColors.indigo,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                    ),
                    child: Text(
                      'Sign in',
                      style: GoogleFonts.nunito(fontWeight: FontWeight.w800),
                    ),
                  ),
                ],
              ),
            ),
          const SizedBox(height: 22),
          Text(
            'Settings',
            style: GoogleFonts.nunito(
              fontWeight: FontWeight.w800,
              fontSize: 18,
            ),
          ),
          const SizedBox(height: 10),
          _SettingsGroup(
            rows: [
              _SettingsRowData(
                Icons.person_outline_rounded,
                'Account detail',
                onTap: () => _open(context, const _AccountDetailScreen()),
              ),
              _SettingsRowData(
                Icons.receipt_long_outlined,
                'Purchases & Invoices',
                onTap: () => _open(context, const _PurchasesScreen()),
              ),
              _SettingsRowData(
                Icons.help_outline_rounded,
                'Help & FAQs',
                onTap: () => _open(context, const HelpFaqsScreen()),
              ),
              _SettingsRowData(
                Icons.info_outline_rounded,
                'About Us',
                onTap: () => _open(context, const AboutUsScreen()),
              ),
              if (auth.isSignedIn)
                _SettingsRowData(
                  Icons.logout_rounded,
                  'Sign out',
                  danger: true,
                  onTap: () => AuthScope.read(context).signOut(),
                )
              else
                _SettingsRowData(
                  Icons.login_rounded,
                  'Sign in',
                  onTap: () => AuthScope.read(context).signIn(),
                ),
            ],
          ),
          const SizedBox(height: 18),
          Center(
            child: Text(
              'Bizgarh mobile · v1.0.0 sample',
              style: GoogleFonts.nunito(
                fontWeight: FontWeight.w600,
                fontSize: 12,
                color: BgColors.muted,
              ),
            ),
          ),
        ],
      ),
    );
  }

  static void _open(BuildContext context, Widget page) {
    Navigator.of(context).push(
      MaterialPageRoute<void>(builder: (_) => page),
    );
  }
}

class _SettingsRowData {
  const _SettingsRowData(
    this.icon,
    this.label, {
    this.danger = false,
    this.onTap,
  });

  final IconData icon;
  final String label;
  final bool danger;
  final VoidCallback? onTap;
}

class _SettingsGroup extends StatelessWidget {
  const _SettingsGroup({required this.rows});

  final List<_SettingsRowData> rows;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: BgColors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: BgColors.line),
      ),
      child: Column(
        children: [
          for (var i = 0; i < rows.length; i++) ...[
            if (i > 0) const Divider(height: 1, indent: 54),
            ListTile(
              leading: Icon(
                rows[i].icon,
                color: rows[i].danger ? BgColors.magenta : BgColors.ink,
              ),
              title: Text(
                rows[i].label,
                style: GoogleFonts.nunito(
                  fontWeight: FontWeight.w700,
                  fontSize: 15,
                  color: rows[i].danger ? BgColors.magenta : BgColors.ink,
                ),
              ),
              trailing: rows[i].danger
                  ? null
                  : const Icon(Icons.chevron_right_rounded, color: BgColors.muted),
              onTap: rows[i].onTap,
            ),
          ],
        ],
      ),
    );
  }
}

class _SubpageScaffold extends StatelessWidget {
  const _SubpageScaffold({required this.title, required this.child});

  final String title;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: BgColors.canvas,
      appBar: AppBar(
        title: Text(
          title,
          style: GoogleFonts.nunito(fontWeight: FontWeight.w800),
        ),
        backgroundColor: BgColors.canvas,
        surfaceTintColor: Colors.transparent,
      ),
      body: child,
    );
  }
}

class _AccountDetailScreen extends StatelessWidget {
  const _AccountDetailScreen();

  @override
  Widget build(BuildContext context) {
    final auth = AuthScope.of(context);
    const user = SampleData.user;

    return _SubpageScaffold(
      title: 'Account detail',
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 28),
        children: [
          if (auth.isSignedIn) ...[
            _InfoTile(label: 'Name', value: user.name),
            _InfoTile(label: 'Email', value: user.email),
            _InfoTile(label: 'City', value: user.city),
            _InfoTile(label: 'Member since', value: user.joined),
            const SizedBox(height: 12),
            Container(
              decoration: BoxDecoration(
                color: BgColors.white,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: BgColors.line),
              ),
              child: ListTile(
                leading: const Icon(
                  Icons.workspace_premium_outlined,
                  color: BgColors.indigo,
                ),
                title: Text(
                  'My certificate',
                  style: GoogleFonts.nunito(
                    fontWeight: FontWeight.w700,
                    fontSize: 15,
                  ),
                ),
                trailing: const Icon(
                  Icons.chevron_right_rounded,
                  color: BgColors.muted,
                ),
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                        'Certificates appear when a classroom is complete.',
                        style: GoogleFonts.nunito(fontWeight: FontWeight.w600),
                      ),
                    ),
                  );
                },
              ),
            ),
          ] else
            _SignInPrompt(onSignIn: () => AuthScope.read(context).signIn()),
        ],
      ),
    );
  }
}

class _PurchasesScreen extends StatelessWidget {
  const _PurchasesScreen();

  @override
  Widget build(BuildContext context) {
    final auth = AuthScope.of(context);
    final items = auth.isSignedIn ? SampleData.enrolled : <EnrolledCourse>[];

    return _SubpageScaffold(
      title: 'Purchases & Invoices',
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 28),
        children: [
          if (!auth.isSignedIn)
            _SignInPrompt(onSignIn: () => AuthScope.read(context).signIn())
          else if (items.isEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 40),
              child: Column(
                children: [
                  Icon(
                    Icons.receipt_long_outlined,
                    size: 48,
                    color: BgColors.muted.withOpacity(0.7),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'No purchases yet',
                    style: GoogleFonts.nunito(
                      fontWeight: FontWeight.w800,
                      fontSize: 18,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Courses you buy will show up here.',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.nunito(
                      fontWeight: FontWeight.w600,
                      color: BgColors.muted,
                    ),
                  ),
                ],
              ),
            )
          else
            ...items.map((item) {
              final course = item.course;
              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: BgColors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: BgColors.line),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            course.title,
                            style: GoogleFonts.nunito(
                              fontWeight: FontWeight.w800,
                              fontSize: 15,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '₹${course.price} · ${item.status}',
                            style: GoogleFonts.nunito(
                              fontWeight: FontWeight.w600,
                              fontSize: 13,
                              color: BgColors.muted,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Text(
                      'Invoice',
                      style: GoogleFonts.nunito(
                        fontWeight: FontWeight.w800,
                        fontSize: 12,
                        color: BgColors.indigo,
                      ),
                    ),
                  ],
                ),
              );
            }),
        ],
      ),
    );
  }
}

class HelpFaqsScreen extends StatelessWidget {
  const HelpFaqsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return _SubpageScaffold(
      title: 'Help & FAQs',
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 28),
        children: [
          Text(
            'FAQs',
            style: GoogleFonts.nunito(
              fontWeight: FontWeight.w800,
              fontSize: 22,
            ),
          ),
          const SizedBox(height: 12),
          ...SampleData.faqItems.map(
            (faq) => Container(
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
              decoration: BoxDecoration(
                color: BgColors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: BgColors.line),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    faq.question,
                    style: GoogleFonts.nunito(
                      fontWeight: FontWeight.w800,
                      fontSize: 15,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    faq.answer,
                    style: GoogleFonts.nunito(
                      fontWeight: FontWeight.w600,
                      fontSize: 13,
                      height: 1.4,
                      color: BgColors.muted,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 18),
          Text(
            'Need more help?',
            style: GoogleFonts.nunito(
              fontWeight: FontWeight.w800,
              fontSize: 20,
            ),
          ),
          const SizedBox(height: 10),
          InkWell(
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(
                    'Ticket form coming soon — email ${SampleData.supportEmail} for now.',
                    style: GoogleFonts.nunito(fontWeight: FontWeight.w600),
                  ),
                ),
              );
            },
            borderRadius: BorderRadius.circular(12),
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 6),
              child: Text(
                'Raise a ticket?',
                style: GoogleFonts.nunito(
                  fontWeight: FontWeight.w800,
                  fontSize: 15,
                  color: BgColors.indigo,
                  decoration: TextDecoration.underline,
                  decorationColor: BgColors.indigo,
                ),
              ),
            ),
          ),
          const SizedBox(height: 8),
          Text.rich(
            TextSpan(
              style: GoogleFonts.nunito(
                fontWeight: FontWeight.w600,
                fontSize: 14,
                color: BgColors.ink,
              ),
              children: [
                const TextSpan(text: 'Email us at '),
                TextSpan(
                  text: SampleData.supportEmail,
                  style: GoogleFonts.nunito(
                    fontWeight: FontWeight.w800,
                    fontSize: 14,
                    color: BgColors.indigo,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class AboutUsScreen extends StatelessWidget {
  const AboutUsScreen({super.key});

  static const _cards = <({String title, String body})>[
    (
      title: 'What we teach',
      body:
          'Markets 101, options, swing systems, long-term investing, and Hindi classrooms.',
    ),
    (
      title: 'How you learn',
      body:
          'Replayable lessons, live rooms, and a 1:1 review if you want a second pair of eyes.',
    ),
    (
      title: "Who it's for",
      body:
          'Beginners who want a first plan, and working traders who want a written process.',
    ),
    (
      title: 'The desk',
      body:
          'Classroom questions go to desk@bizgarh.com. We reply on a working day.',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return _SubpageScaffold(
      title: 'About Us',
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 28),
        children: [
          Text(
            'Bizgarh is a classroom for Indian traders: process, risk, and journals — not a tip feed.',
            maxLines: 3,
            overflow: TextOverflow.ellipsis,
            style: GoogleFonts.nunito(
              fontWeight: FontWeight.w600,
              fontSize: 15,
              height: 1.45,
              color: BgColors.ink,
            ),
          ),
          const SizedBox(height: 18),
          ..._cards.map(
            (card) => Container(
              width: double.infinity,
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 16),
              decoration: BoxDecoration(
                color: BgColors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: BgColors.line),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    card.title,
                    style: GoogleFonts.nunito(
                      fontWeight: FontWeight.w800,
                      fontSize: 16,
                      color: BgColors.inkDeep,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    card.body,
                    style: GoogleFonts.nunito(
                      fontWeight: FontWeight.w600,
                      fontSize: 14,
                      height: 1.45,
                      color: BgColors.muted,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Policies',
            style: GoogleFonts.nunito(
              fontWeight: FontWeight.w800,
              fontSize: 16,
            ),
          ),
          const SizedBox(height: 4),
          const _PolicyLink(label: 'Terms of Usage', path: '/terms'),
          const _PolicyLink(label: 'Privacy Policy', path: '/privacy'),
          const _PolicyLink(label: 'Refund Policy', path: '/refund'),
        ],
      ),
    );
  }
}

class _PolicyLink extends StatelessWidget {
  const _PolicyLink({required this.label, required this.path});

  final String label;
  final String path;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      title: Text(
        label,
        style: GoogleFonts.nunito(
          fontWeight: FontWeight.w700,
          fontSize: 15,
          color: BgColors.indigo,
        ),
      ),
      trailing: const Icon(
        Icons.open_in_new_rounded,
        size: 18,
        color: BgColors.muted,
      ),
      onTap: () {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Opens bizgarh.com$path',
              style: GoogleFonts.nunito(fontWeight: FontWeight.w600),
            ),
          ),
        );
      },
    );
  }
}

class _InfoTile extends StatelessWidget {
  const _InfoTile({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: BgColors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: BgColors.line),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: GoogleFonts.nunito(
              fontWeight: FontWeight.w600,
              fontSize: 12,
              color: BgColors.muted,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: GoogleFonts.nunito(
              fontWeight: FontWeight.w800,
              fontSize: 15,
            ),
          ),
        ],
      ),
    );
  }
}

class _SignInPrompt extends StatelessWidget {
  const _SignInPrompt({required this.onSignIn});

  final VoidCallback onSignIn;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 24),
      child: Column(
        children: [
          Text(
            'Sign in to continue',
            style: GoogleFonts.nunito(
              fontWeight: FontWeight.w800,
              fontSize: 18,
            ),
          ),
          const SizedBox(height: 12),
          FilledButton(
            onPressed: onSignIn,
            style: FilledButton.styleFrom(
              backgroundColor: BgColors.indigo,
              foregroundColor: Colors.white,
            ),
            child: Text(
              'Sign in',
              style: GoogleFonts.nunito(fontWeight: FontWeight.w800),
            ),
          ),
        ],
      ),
    );
  }
}
