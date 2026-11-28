import 'package:bizgarh_mobile/data/catalog_merge.dart';
import 'package:bizgarh_mobile/data/sample_data.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('applies live edit fields onto slingshot seed', () {
    final merged = CatalogMerge.merge(
      seeds: SampleData.courses,
      doc: {
        'edits': {
          'slingshot': {
            'title': 'Slingshot: The 5-Minute Trading Edge',
            'instructor': 'Rehan Khan',
            'price': 449,
            'old': 999,
            'cat': 'strategy',
            'lessons': 5,
            'description': 'Live description from Control.',
            'learn': ['Rule one', 'Rule two'],
            'languages': ['Hindi', 'English'],
            'unpublished': false,
            'status': 'published',
            'deleted': false,
            'banner': 'https://www.bizgarh.com/img/courses/slingshot.jpg',
          },
        },
        'extras': [],
        'hidden': [],
        'rooms': {
          'slingshot': {
            'open': true,
            'youtube': {
              'live': true,
              'url': 'https://youtube.com/@trading.house.official',
            },
            'telegram': {'live': true, 'url': 'https://t.me/tradinghouseTH'},
          },
        },
        'videos': {
          'slingshot': [
            {'t': 'L1'},
            {'t': 'L2'},
            {'t': 'L3'},
          ],
        },
      },
    );

    expect(merged, hasLength(1));
    final c = merged.single;
    expect(c.id, 'slingshot');
    expect(c.instructor, 'Rehan Khan');
    expect(c.price, 449);
    expect(c.oldPrice, 999);
    expect(c.lessons, 3); // videos list wins
    expect(c.description, 'Live description from Control.');
    expect(c.learn, ['Rule one', 'Rule two']);
    expect(c.coverImageUrl, 'https://www.bizgarh.com/img/courses/slingshot.jpg');
    expect(c.communityOpen, isTrue);
    expect(c.communityRooms.map((r) => r.id), ['youtube', 'telegram']);
  });

  test('adds published extras and skips unlisted drafts', () {
    final merged = CatalogMerge.merge(
      seeds: SampleData.courses,
      doc: {
        'edits': {
          'slingshot': {
            'title': 'Slingshot: The 5-Minute Trading Edge',
            'unpublished': false,
            'status': 'published',
            'deleted': false,
          },
        },
        'extras': [
          {
            'id': 'new-options',
            'title': 'Options Desk Starter',
            'instructor': 'Neha Kapoor',
            'price': 799,
            'old': 1499,
            'cat': 'options',
            'hours': '4.0',
            'lessons': 8,
            'status': 'published',
            'unpublished': false,
            'deleted': false,
          },
          {
            'id': 'draft-only',
            'title': 'Hidden Draft',
            'instructor': 'Staff',
            'price': 1,
            'cat': 'strategy',
            'unpublished': true,
            'status': 'unlisted',
          },
        ],
        'hidden': [],
        'rooms': {},
        'videos': {},
      },
    );

    expect(merged.map((c) => c.id), ['slingshot', 'new-options']);
  });

  test('resolveMediaUrl absolutizes /api/media paths', () {
    expect(
      CatalogMerge.resolveMediaUrl(
        '/api/media/course/banner.jpg',
        'https://www.bizgarh.com',
      ),
      'https://www.bizgarh.com/api/media/course/banner.jpg',
    );
  });
}
