import 'dart:convert';
import 'dart:io';

/// Fetches the public Bizgarh catalog document from the live site.
class CatalogApi {
  CatalogApi({
    this.origin = 'https://www.bizgarh.com',
    HttpClient? client,
    this.getJson,
  }) : _client = client;

  final String origin;
  final HttpClient? _client;

  /// Optional injectable getter for tests: `(path) => decoded JSON map`.
  final Future<Map<String, dynamic>> Function(String path)? getJson;

  Uri get coursesUri => Uri.parse('$origin/api/catalog/courses');
  Uri get webinarsUri => Uri.parse('$origin/api/catalog/webinars');

  Future<Map<String, dynamic>> fetchCourses() =>
      getJson?.call('/api/catalog/courses') ?? _get(coursesUri);

  Future<Map<String, dynamic>> fetchWebinars() =>
      getJson?.call('/api/catalog/webinars') ?? _get(webinarsUri);

  Future<Map<String, dynamic>> _get(Uri uri) async {
    final client = _client ?? HttpClient();
    final owned = _client == null;
    try {
      final req = await client.getUrl(uri);
      req.headers.set(HttpHeaders.acceptHeader, 'application/json');
      req.followRedirects = true;
      final res = await req.close().timeout(const Duration(seconds: 12));
      final body = await res.transform(utf8.decoder).join();
      if (res.statusCode < 200 || res.statusCode >= 300) {
        throw HttpException(
          'Catalog HTTP ${res.statusCode}',
          uri: uri,
        );
      }
      final decoded = jsonDecode(body);
      if (decoded is! Map) {
        throw const FormatException('Catalog response is not an object');
      }
      return Map<String, dynamic>.from(decoded);
    } finally {
      if (owned) client.close(force: true);
    }
  }
}
