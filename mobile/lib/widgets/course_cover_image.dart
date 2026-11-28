import 'dart:convert';
import 'dart:typed_data';

import 'package:flutter/material.dart';

import '../models/course.dart';

/// Picks live network/`data:` banner first, then bundled asset.
class CourseCoverImage extends StatelessWidget {
  const CourseCoverImage({
    super.key,
    required this.course,
    this.fit = BoxFit.cover,
    this.alignment = Alignment.center,
  });

  final Course course;
  final BoxFit fit;
  final Alignment alignment;

  @override
  Widget build(BuildContext context) {
    final url = course.coverImageUrl?.trim();
    if (url != null && url.isNotEmpty) {
      if (url.startsWith('data:')) {
        final bytes = decodeDataUri(url);
        if (bytes != null) {
          return Image.memory(
            bytes,
            fit: fit,
            alignment: alignment,
            gaplessPlayback: true,
            errorBuilder: (_, __, ___) => const SizedBox.shrink(),
          );
        }
      } else {
        return Image.network(
          url,
          fit: fit,
          alignment: alignment,
          gaplessPlayback: true,
          errorBuilder: (_, __, ___) => const SizedBox.shrink(),
        );
      }
    }
    final asset = course.coverImageAsset;
    if (asset != null && asset.isNotEmpty) {
      return Image.asset(
        asset,
        fit: fit,
        alignment: alignment,
        errorBuilder: (_, __, ___) => const SizedBox.shrink(),
      );
    }
    return const SizedBox.shrink();
  }

  static bool hasCover(Course course) {
    final url = course.coverImageUrl?.trim();
    if (url != null && url.isNotEmpty) return true;
    final asset = course.coverImageAsset;
    return asset != null && asset.isNotEmpty;
  }

  static Uint8List? decodeDataUri(String uri) {
    final comma = uri.indexOf(',');
    if (comma < 0) return null;
    final meta = uri.substring(0, comma);
    final data = uri.substring(comma + 1);
    try {
      if (meta.contains(';base64')) {
        return base64Decode(data);
      }
      return Uint8List.fromList(utf8.encode(Uri.decodeComponent(data)));
    } catch (_) {
      return null;
    }
  }
}
