import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:image_picker/image_picker.dart';

import '../data/sample_data.dart';
import '../models/course.dart';
import '../state/app_nav.dart';
import '../state/auth_state.dart';
import '../state/profile_state.dart';
import '../theme/bg_text.dart';
import '../theme/colors.dart';
import '../widgets/brand_mark.dart';
import 'auth_screen.dart';
import 'course_detail_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = AuthScope.of(context);
    final profile = ProfileScope.of(context);

    return SafeArea(
      bottom: false,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 28),
        children: [
          Text(
            'Profile',
            style: bgText(
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
                  _ProfileAvatar(profile: profile, radius: 32, light: true),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          profile.name,
                          style: bgText(
                            fontWeight: FontWeight.w800,
                            fontSize: 20,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          profile.email,
                          style: bgText(
                            fontWeight: FontWeight.w600,
                            fontSize: 13,
                            color: Colors.white.withOpacity(0.85),
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          '${profile.city} · ${profile.joined}',
                          style: bgText(
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
                    style: bgText(
                      fontWeight: FontWeight.w800,
                      fontSize: 18,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Sign in to see purchases, certificates, and My Learning.',
                    style: bgText(
                      fontWeight: FontWeight.w600,
                      fontSize: 13,
                      color: BgColors.muted,
                    ),
                  ),
                  const SizedBox(height: 14),
                  FilledButton(
                    onPressed: () => openAuthScreen(context),
                    style: FilledButton.styleFrom(
                      backgroundColor: BgColors.indigo,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                    ),
                    child: Text(
                      'Sign in',
                      style: bgText(fontWeight: FontWeight.w800),
                    ),
                  ),
                ],
              ),
            ),
          const SizedBox(height: 22),
          Text(
            'Settings',
            style: bgText(
              fontWeight: FontWeight.w800,
              fontSize: 18,
            ),
          ),
          const SizedBox(height: 10),
          _SettingsGroup(
            rows: [
              _SettingsRowData(
                Icons.person_outline_rounded,
                'Edit Profile',
                onTap: () => _open(context, const _EditProfileScreen()),
              ),
              _SettingsRowData(
                Icons.workspace_premium_outlined,
                'My certificates',
                onTap: () => _open(context, const _CertificatesScreen()),
              ),
              _SettingsRowData(
                Icons.receipt_long_outlined,
                'My Purchases',
                onTap: () => _open(context, const _PurchasesScreen()),
              ),
              _SettingsRowData(
                Icons.menu_book_outlined,
                'My Learning',
                onTap: () => AppNavScope.read(context).goTab(2),
              ),
              _SettingsRowData(
                Icons.search_rounded,
                'Browse courses',
                onTap: () => AppNavScope.read(context).openLibrary(),
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
                  onTap: () async {
                    await AuthScope.read(context).signOut();
                    if (context.mounted) {
                      ProfileScope.read(context).clearAccount();
                    }
                  },
                )
              else
                _SettingsRowData(
                  Icons.login_rounded,
                  'Sign in',
                  onTap: () => openAuthScreen(context),
                ),
            ],
          ),
          const SizedBox(height: 22),
          const Center(child: BrandMark(size: 36, showWordmark: true)),
          const SizedBox(height: 10),
          Center(
            child: Text(
              'Bizgarh mobile · v1.1.14',
              style: bgText(
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

class _ProfileAvatar extends StatelessWidget {
  const _ProfileAvatar({
    required this.profile,
    required this.radius,
    this.light = false,
  });

  final ProfileState profile;
  final double radius;
  final bool light;

  @override
  Widget build(BuildContext context) {
    final bytes = profile.photoBytes;
    if (bytes != null) {
      return CircleAvatar(
        radius: radius,
        backgroundColor: light
            ? Colors.white.withOpacity(0.2)
            : BgColors.indigoSoft,
        backgroundImage: MemoryImage(bytes),
      );
    }
    return CircleAvatar(
      radius: radius,
      backgroundColor:
          light ? Colors.white.withOpacity(0.2) : BgColors.indigoSoft,
      child: Text(
        profile.initials,
        style: bgText(
          fontWeight: FontWeight.w800,
          fontSize: radius * 0.7,
          color: light ? Colors.white : BgColors.indigo,
        ),
      ),
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
                style: bgText(
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
          style: bgText(fontWeight: FontWeight.w800),
        ),
        backgroundColor: BgColors.canvas,
        surfaceTintColor: Colors.transparent,
      ),
      body: child,
    );
  }
}

class _EditProfileScreen extends StatefulWidget {
  const _EditProfileScreen();

  @override
  State<_EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<_EditProfileScreen> {
  late final TextEditingController _name;
  late final TextEditingController _phone;
  late final TextEditingController _email;
  late final TextEditingController _dob;
  late final TextEditingController _country;
  late final TextEditingController _state;
  late final TextEditingController _city;
  late final TextEditingController _pin;
  String _gender = 'Female';
  String? _dobError;
  bool _seeded = false;
  final _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    _name = TextEditingController();
    _phone = TextEditingController();
    _email = TextEditingController();
    _dob = TextEditingController();
    _country = TextEditingController();
    _state = TextEditingController();
    _city = TextEditingController();
    _pin = TextEditingController();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_seeded) return;
    _seeded = true;
    final p = ProfileScope.read(context);
    _name.text = p.name;
    _phone.text = p.phone;
    _email.text = p.email;
    _dob.text = DobFormat.toDisplay(p.dobIso);
    _country.text = p.country;
    _state.text = p.state;
    _city.text = p.city;
    _pin.text = p.pin;
    _gender = (p.gender == 'Male' || p.gender == 'Female') ? p.gender : '';
  }

  @override
  void dispose() {
    _name.dispose();
    _phone.dispose();
    _email.dispose();
    _dob.dispose();
    _country.dispose();
    _state.dispose();
    _city.dispose();
    _pin.dispose();
    super.dispose();
  }

  Future<void> _pickPhoto() async {
    final file = await _picker.pickImage(
      source: ImageSource.gallery,
      maxWidth: 1024,
      maxHeight: 1024,
      imageQuality: 88,
    );
    if (file == null || !mounted) return;
    final bytes = await file.readAsBytes();
    if (!mounted) return;
    ProfileScope.read(context).setPhoto(bytes);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          'Photo updated',
          style: bgText(fontWeight: FontWeight.w600),
        ),
      ),
    );
  }

  Future<void> _pickDobCalendar() async {
    final iso = DobFormat.toIso(_dob.text.trim());
    DateTime initial = DateTime(1998, 7, 15);
    if (iso != null) {
      final parts = iso.split('-');
      initial = DateTime(
        int.parse(parts[0]),
        int.parse(parts[1]),
        int.parse(parts[2]),
      );
    }
    final picked = await showDatePicker(
      context: context,
      initialDate: initial,
      firstDate: DateTime(1920),
      lastDate: DateTime.now(),
      builder: (context, child) {
                return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: BgColors.indigo,
              onPrimary: Colors.white,
              surface: BgColors.white,
              onSurface: BgColors.ink,
            ),
          ),
          child: child!,
        );
      },
    );
    if (picked == null) return;
    setState(() {
      _dob.text = DobFormat.toDisplay(
        '${picked.year.toString().padLeft(4, '0')}-'
        '${picked.month.toString().padLeft(2, '0')}-'
        '${picked.day.toString().padLeft(2, '0')}',
      );
      _dobError = null;
    });
  }

  void _onDobChanged(String value) {
    final masked = DobFormat.maskDigits(value);
    if (masked != value) {
      _dob.value = TextEditingValue(
        text: masked,
        selection: TextSelection.collapsed(offset: masked.length),
      );
    }
    final t = _dob.text.trim();
    setState(() {
      if (t.isEmpty || t.length < 10) {
        _dobError = null;
      } else if (DobFormat.toIso(t) == null) {
        _dobError = 'Use dd-mm-yyyy (e.g. 15-07-1998)';
      } else {
        _dobError = null;
      }
    });
  }

  void _save() {
    final auth = AuthScope.read(context);
    if (!auth.isSignedIn) return;
    final dobRaw = _dob.text.trim();
    final dobIso = dobRaw.isEmpty ? '' : DobFormat.toIso(dobRaw);
    if (dobRaw.isNotEmpty && dobIso == null) {
      setState(() => _dobError = 'Use dd-mm-yyyy (e.g. 15-07-1998)');
      return;
    }
    ProfileScope.read(context).update(
      name: _name.text.trim().isEmpty ? 'Learner' : _name.text.trim(),
      phone: _phone.text.trim(),
      gender: _gender,
      dobIso: dobIso ?? '',
      country: _country.text.trim(),
      state: _state.text.trim(),
      city: _city.text.trim(),
      pin: _pin.text.trim(),
    );
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          'Profile saved',
          style: bgText(fontWeight: FontWeight.w600),
        ),
      ),
    );
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    final auth = AuthScope.of(context);
    final profile = ProfileScope.of(context);

    return _SubpageScaffold(
      title: 'Edit Profile',
      child: !auth.isSignedIn
          ? ListView(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 28),
              children: [
                _SignInPrompt(onSignIn: () => openAuthScreen(context)),
              ],
            )
          : ListView(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 28),
              children: [
                Text(
                  'Account info',
                  style: bgText(fontWeight: FontWeight.w800, fontSize: 20),
                ),
                const SizedBox(height: 14),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        children: [
                          _Field(
                            label: 'Name',
                            controller: _name,
                            textInputAction: TextInputAction.next,
                          ),
                          _Field(
                            label: 'Phone number',
                            controller: _phone,
                            keyboardType: TextInputType.phone,
                            textInputAction: TextInputAction.next,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 14),
                    Column(
                      children: [
                        GestureDetector(
                          onTap: _pickPhoto,
                          child: Stack(
                            alignment: Alignment.bottomRight,
                            children: [
                              _ProfileAvatar(profile: profile, radius: 40),
                              Container(
                                padding: const EdgeInsets.all(6),
                                decoration: const BoxDecoration(
                                  color: BgColors.indigo,
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(
                                  Icons.camera_alt_rounded,
                                  size: 14,
                                  color: Colors.white,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 8),
                        TextButton(
                          onPressed: _pickPhoto,
                          child: Text(
                            profile.photoBytes == null
                                ? 'Add photo'
                                : 'Change photo',
                            style: bgText(
                              fontWeight: FontWeight.w800,
                              fontSize: 12,
                              color: BgColors.indigo,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                _Field(
                  label: 'Email ID',
                  controller: _email,
                  enabled: false,
                ),
                Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    'Gender',
                    style: bgText(
                      fontWeight: FontWeight.w700,
                      fontSize: 13,
                      color: BgColors.muted,
                    ),
                  ),
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    for (final g in const ['Male', 'Female'])
                      Padding(
                        padding: const EdgeInsets.only(right: 16),
                        child: InkWell(
                          onTap: () => setState(() => _gender = g),
                          borderRadius: BorderRadius.circular(10),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Radio<String>(
                                value: g,
                                groupValue: _gender,
                                activeColor: BgColors.indigo,
                                onChanged: (v) =>
                                    setState(() => _gender = v ?? ''),
                              ),
                              Text(
                                g,
                                style: bgText(fontWeight: FontWeight.w700),
                              ),
                            ],
                          ),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 8),
                Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    'Date of birth',
                    style: bgText(
                      fontWeight: FontWeight.w700,
                      fontSize: 13,
                      color: BgColors.muted,
                    ),
                  ),
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _dob,
                        keyboardType: TextInputType.number,
                        onChanged: _onDobChanged,
                        inputFormatters: [
                          FilteringTextInputFormatter.allow(RegExp(r'[\d-]')),
                          LengthLimitingTextInputFormatter(10),
                        ],
                        decoration: InputDecoration(
                          hintText: 'dd-mm-yyyy',
                          errorText: _dobError,
                        ),
                        style: bgText(fontWeight: FontWeight.w700),
                      ),
                    ),
                    const SizedBox(width: 8),
                    IconButton.filledTonal(
                      onPressed: _pickDobCalendar,
                      style: IconButton.styleFrom(
                        backgroundColor: BgColors.indigoSoft,
                        foregroundColor: BgColors.indigo,
                      ),
                      icon: const Icon(Icons.calendar_today_rounded, size: 20),
                      tooltip: 'Open calendar',
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                _Field(label: 'Country', controller: _country),
                _Field(label: 'State', controller: _state),
                _Field(label: 'City', controller: _city),
                _Field(
                  label: 'Pin code',
                  controller: _pin,
                  keyboardType: TextInputType.number,
                ),
                const SizedBox(height: 8),
                FilledButton(
                  onPressed: _save,
                  style: FilledButton.styleFrom(
                    backgroundColor: BgColors.indigo,
                    foregroundColor: Colors.white,
                    minimumSize: const Size.fromHeight(48),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                  child: Text(
                    'Save changes',
                    style: bgText(fontWeight: FontWeight.w800),
                  ),
                ),
              ],
            ),
    );
  }
}

class _Field extends StatelessWidget {
  const _Field({
    required this.label,
    required this.controller,
    this.keyboardType,
    this.textInputAction,
    this.enabled = true,
  });

  final String label;
  final TextEditingController controller;
  final TextInputType? keyboardType;
  final TextInputAction? textInputAction;
  final bool enabled;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: bgText(
              fontWeight: FontWeight.w700,
              fontSize: 13,
              color: BgColors.muted,
            ),
          ),
          const SizedBox(height: 6),
          TextField(
            controller: controller,
            enabled: enabled,
            keyboardType: keyboardType,
            textInputAction: textInputAction,
            style: bgText(fontWeight: FontWeight.w700),
          ),
        ],
      ),
    );
  }
}

class _CertificatesScreen extends StatelessWidget {
  const _CertificatesScreen();

  @override
  Widget build(BuildContext context) {
    final auth = AuthScope.of(context);
    final certs = auth.isSignedIn
        ? SampleData.enrolled.where((e) => e.progress >= 1).toList()
        : <EnrolledCourse>[];

    return _SubpageScaffold(
      title: 'My certificates',
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 28),
        children: [
          if (!auth.isSignedIn)
            _SignInPrompt(onSignIn: () => openAuthScreen(context))
          else if (certs.isEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 32),
              child: Column(
                children: [
                  Text(
                    'Finish a classroom to earn a certificate.',
                    textAlign: TextAlign.center,
                    style: bgText(
                      fontWeight: FontWeight.w700,
                      color: BgColors.muted,
                    ),
                  ),
                  const SizedBox(height: 14),
                  FilledButton(
                    onPressed: () {
                      Navigator.of(context).pop();
                      AppNavScope.read(context).goTab(2);
                    },
                    style: FilledButton.styleFrom(
                      backgroundColor: BgColors.indigo,
                      foregroundColor: Colors.white,
                    ),
                    child: Text(
                      'My Learning',
                      style: bgText(fontWeight: FontWeight.w800),
                    ),
                  ),
                ],
              ),
            )
          else
            ...certs.map((item) {
              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: BgColors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: BgColors.line),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.course.title,
                      style: bgText(
                        fontWeight: FontWeight.w800,
                        fontSize: 16,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Issued to ${ProfileScope.of(context).name}',
                      style: bgText(
                        fontWeight: FontWeight.w600,
                        fontSize: 13,
                        color: BgColors.muted,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      crossAxisAlignment: WrapCrossAlignment.center,
                      children: [
                        TextButton(
                          onPressed: () {
                            Navigator.of(context).push(
                              MaterialPageRoute<void>(
                                builder: (_) => CourseDetailScreen(
                                  course: item.course,
                                ),
                              ),
                            );
                          },
                          child: Text(
                            'View classroom',
                            style: bgText(
                              fontWeight: FontWeight.w800,
                              color: BgColors.indigo,
                            ),
                          ),
                        ),
                        FilledButton(
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text(
                                  'Certificate download queued for ${item.course.title}',
                                  style: bgText(fontWeight: FontWeight.w600),
                                ),
                              ),
                            );
                          },
                          style: FilledButton.styleFrom(
                            backgroundColor: BgColors.indigo,
                            foregroundColor: Colors.white,
                          ),
                          child: Text(
                            'Download',
                            style: bgText(fontWeight: FontWeight.w800),
                          ),
                        ),
                      ],
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

class _PurchasesScreen extends StatelessWidget {
  const _PurchasesScreen();

  @override
  Widget build(BuildContext context) {
    final auth = AuthScope.of(context);
    final items = auth.isSignedIn ? SampleData.enrolled : <EnrolledCourse>[];

    return _SubpageScaffold(
      title: 'My Purchases',
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 28),
        children: [
          if (!auth.isSignedIn)
            _SignInPrompt(onSignIn: () => openAuthScreen(context))
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
                    style: bgText(
                      fontWeight: FontWeight.w800,
                      fontSize: 18,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Courses you buy will show up here.',
                    textAlign: TextAlign.center,
                    style: bgText(
                      fontWeight: FontWeight.w600,
                      color: BgColors.muted,
                    ),
                  ),
                  const SizedBox(height: 14),
                  FilledButton(
                    onPressed: () {
                      Navigator.of(context).pop();
                      AppNavScope.read(context).openLibrary();
                    },
                    style: FilledButton.styleFrom(
                      backgroundColor: BgColors.indigo,
                      foregroundColor: Colors.white,
                    ),
                    child: Text(
                      'Browse courses',
                      style: bgText(fontWeight: FontWeight.w800),
                    ),
                  ),
                ],
              ),
            )
          else
            ...items.map((item) {
              final course = item.course;
              final amt = item.amount ?? course.price;
              final when = _formatPurchaseDate(item.purchasedAt);
              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Material(
                  color: Colors.transparent,
                  child: InkWell(
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute<void>(
                          builder: (_) => _PurchaseDetailScreen(item: item),
                        ),
                      );
                    },
                    borderRadius: BorderRadius.circular(16),
                    child: Ink(
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
                                  style: bgText(
                                    fontWeight: FontWeight.w800,
                                    fontSize: 15,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  [
                                    '₹${amt.toString()}',
                                    if (when.isNotEmpty) when,
                                  ].join(' · '),
                                  style: bgText(
                                    fontWeight: FontWeight.w600,
                                    fontSize: 13,
                                    color: BgColors.muted,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const Icon(
                            Icons.chevron_right_rounded,
                            color: BgColors.muted,
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              );
            }),
        ],
      ),
    );
  }
}

String _formatPurchaseDate(String? iso) {
  if (iso == null || iso.isEmpty) return '';
  try {
    final dt = DateTime.parse(iso).toLocal();
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return '${dt.day.toString().padLeft(2, '0')} ${months[dt.month - 1]} ${dt.year}';
  } catch (_) {
    return iso;
  }
}

class _PurchaseDetailScreen extends StatelessWidget {
  const _PurchaseDetailScreen({required this.item});

  final EnrolledCourse item;

  @override
  Widget build(BuildContext context) {
    final course = item.course;
    final profile = ProfileScope.of(context);
    final amt = item.amount ?? course.price;
    final when = _formatPurchaseDate(item.purchasedAt);
    final rows = <(String, String)>[
      ('Item', course.title),
      ('Transaction ID', item.txnId?.isNotEmpty == true ? item.txnId! : '—'),
      if (item.orderId != null && item.orderId!.isNotEmpty)
        ('Order ID', item.orderId!),
      ('Date of purchase', when.isEmpty ? '—' : when),
      ('Amount', '₹$amt'),
      ('Status', 'Paid'),
      if (item.paymentMethod != null && item.paymentMethod!.isNotEmpty)
        ('Payment method', item.paymentMethod!),
    ];

    return _SubpageScaffold(
      title: 'Purchase detail',
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 28),
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: BgColors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: BgColors.line),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const BrandMark(size: 32),
                const SizedBox(height: 14),
                Text(
                  'Billed to ${profile.name}',
                  style: bgText(
                    fontWeight: FontWeight.w600,
                    color: BgColors.muted,
                  ),
                ),
                Text(
                  profile.email,
                  style: bgText(
                    fontWeight: FontWeight.w600,
                    color: BgColors.muted,
                  ),
                ),
                const SizedBox(height: 16),
                for (final row in rows) ...[
                  Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        SizedBox(
                          width: 128,
                          child: Text(
                            row.$1,
                            style: bgText(
                              fontWeight: FontWeight.w600,
                              fontSize: 13,
                              color: BgColors.muted,
                            ),
                          ),
                        ),
                        Expanded(
                          child: Text(
                            row.$2,
                            style: bgText(
                              fontWeight: FontWeight.w800,
                              fontSize: 14,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: 16),
          FilledButton(
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute<void>(
                  builder: (_) => CourseDetailScreen(course: course),
                ),
              );
            },
            style: FilledButton.styleFrom(
              backgroundColor: BgColors.indigo,
              foregroundColor: Colors.white,
              minimumSize: const Size.fromHeight(48),
            ),
            child: Text(
              'Open classroom',
              style: bgText(fontWeight: FontWeight.w800),
            ),
          ),
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
            style: bgText(
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
                    style: bgText(
                      fontWeight: FontWeight.w800,
                      fontSize: 15,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    faq.answer,
                    style: bgText(
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
            style: bgText(
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
                    style: bgText(fontWeight: FontWeight.w600),
                  ),
                ),
              );
            },
            borderRadius: BorderRadius.circular(12),
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 6),
              child: Text(
                'Raise a ticket?',
                style: bgText(
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
              style: bgText(
                fontWeight: FontWeight.w600,
                fontSize: 14,
                color: BgColors.ink,
              ),
              children: [
                const TextSpan(text: 'Email us at '),
                TextSpan(
                  text: SampleData.supportEmail,
                  style: bgText(
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
            style: bgText(
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
                    style: bgText(
                      fontWeight: FontWeight.w800,
                      fontSize: 16,
                      color: BgColors.inkDeep,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    card.body,
                    style: bgText(
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
            style: bgText(
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
        style: bgText(
          fontWeight: FontWeight.w700,
          fontSize: 15,
          color: BgColors.indigo,
        ),
      ),
      trailing: const Icon(
        Icons.chevron_right_rounded,
        size: 18,
        color: BgColors.muted,
      ),
      onTap: () {
        Navigator.of(context).push(
          MaterialPageRoute<void>(
            builder: (_) => _PolicyDocScreen(title: label, path: path),
          ),
        );
      },
    );
  }
}

class _PolicyDocScreen extends StatelessWidget {
  const _PolicyDocScreen({required this.title, required this.path});

  final String title;
  final String path;

  @override
  Widget build(BuildContext context) {
    return _SubpageScaffold(
      title: title,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 28),
        children: [
          Text(
            'bizgarh.com$path',
            style: bgText(
              fontWeight: FontWeight.w700,
              fontSize: 13,
              color: BgColors.muted,
            ),
          ),
          const SizedBox(height: 14),
          Text(
            'This mobile sample mirrors the website policy page. Full legal text lives on the site; contact ${SampleData.supportEmail} for questions about $title.',
            style: bgText(
              fontWeight: FontWeight.w600,
              fontSize: 15,
              height: 1.45,
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
            style: bgText(
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
              style: bgText(fontWeight: FontWeight.w800),
            ),
          ),
        ],
      ),
    );
  }
}
