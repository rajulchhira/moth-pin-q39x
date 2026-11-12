import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../data/sample_data.dart';
import '../theme/colors.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
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
          const _SettingsGroup(
            rows: [
              _SettingsRowData(Icons.person_outline_rounded, 'Account details'),
              _SettingsRowData(Icons.notifications_none_rounded, 'Notifications'),
              _SettingsRowData(Icons.download_outlined, 'Downloads & offline'),
              _SettingsRowData(Icons.language_rounded, 'Language · English / Hindi'),
            ],
          ),
          const SizedBox(height: 14),
          const _SettingsGroup(
            rows: [
              _SettingsRowData(Icons.receipt_long_outlined, 'Purchases & invoices'),
              _SettingsRowData(Icons.help_outline_rounded, 'Help & FAQs'),
              _SettingsRowData(Icons.privacy_tip_outlined, 'Privacy'),
              _SettingsRowData(Icons.logout_rounded, 'Sign out', danger: true),
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
}

class _SettingsRowData {
  const _SettingsRowData(this.icon, this.label, {this.danger = false});

  final IconData icon;
  final String label;
  final bool danger;
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
              onTap: () {},
            ),
          ],
        ],
      ),
    );
  }
}
