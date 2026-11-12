# Bizgarh Mobile (Flutter v1)

Native iOS / Android shell for [Bizgarh](https://bizgarh.com) — trading education, not a WebView of the site.

## Tabs

| Tab | What you get (v1 sample data) |
| --- | --- |
| **Home** | Brand hero + featured courses + mentor teasers |
| **Search** | Search field + category chips + filterable course list |
| **My Learning** | Enrolled / in-progress course cards with progress |
| **Profile** | Sample user avatar, name, settings rows |

Sample catalog mirrors titles and mentors from the site’s `js/app.js` course list.

## Prerequisites

- [Flutter](https://docs.flutter.dev/get-started/install) **3.24+** (stable)
- Xcode (iOS) and/or Android Studio / SDK (Android)
- `flutter doctor` should report a usable device or simulator

## Run

```bash
cd mobile
flutter pub get
flutter run
```

Pick a device when prompted, or target one explicitly:

```bash
flutter devices
flutter run -d <device_id>
```

### Web / desktop preview (optional)

Useful when you only need a quick UI check:

```bash
flutter run -d chrome
```

### Analyze & tests

```bash
flutter analyze
flutter test
```

## Layout

```
mobile/
  lib/
    main.dart
    theme/          # Bizgarh colors + Nunito theme
    models/         # Course, mentor, user
    data/           # Static sample catalog
    screens/        # Home · Search · My Learning · Profile + shell
    widgets/        # Brand mark, course cards, mentor tiles
  assets/           # Bizgarh icon / lockup
  android/ ios/     # Platform projects
```

## Notes

- v1 is offline sample data only — no auth, payments, or App Store / Play submit.
- Brand tokens follow the site (`#4F46E5` indigo, `#E11D74` magenta, Nunito).
