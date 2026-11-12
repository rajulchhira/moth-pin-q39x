import 'package:flutter/material.dart';

/// Original category glyphs — vivid / high-contrast, not 1:1 inspo copies.
class CategoryGlyph extends StatelessWidget {
  const CategoryGlyph({super.key, required this.kind, this.size = 56});

  final String kind;
  final double size;

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      size: Size.square(size),
      painter: _GlyphPainter(kind),
    );
  }
}

class _GlyphPainter extends CustomPainter {
  _GlyphPainter(this.kind);

  final String kind;

  static const _green = Color(0xFF16A34A);
  static const _red = Color(0xFFE11D48);
  static const _indigo = Color(0xFF4F46E5);
  static const _violet = Color(0xFF7C3AED);
  static const _pink = Color(0xFFDB2777);
  static const _gold = Color(0xFFF59E0B);
  static const _orange = Color(0xFFEA580C);
  static const _teal = Color(0xFF0D9488);
  static const _sky = Color(0xFF0284C7);

  @override
  void paint(Canvas canvas, Size size) {
    switch (kind) {
      case 'bars':
        _bars(canvas, size);
      case 'candle':
        _candles(canvas, size);
      case 'cepe':
        _cePe(canvas, size);
      case 'strategy':
        _target(canvas, size);
      case 'crypto':
        _crypto(canvas, size);
      case 'investing':
        _arrowUp(canvas, size);
      default:
        _bars(canvas, size);
    }
  }

  Paint _fill(Color c) => Paint()
    ..color = c
    ..style = PaintingStyle.fill;

  Paint _stroke(Color c, double w) => Paint()
    ..color = c
    ..style = PaintingStyle.stroke
    ..strokeWidth = w
    ..strokeCap = StrokeCap.round
    ..strokeJoin = StrokeJoin.round;

  void _bars(Canvas canvas, Size size) {
    // Soft blue plate
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(size.width * 0.14, size.height * 0.16, size.width * 0.72, size.height * 0.68),
        Radius.circular(size.width * 0.12),
      ),
      _fill(const Color(0xFFDBEAFE)),
    );
    final baseY = size.height * 0.74;
    final colors = [_sky, _indigo, _violet, _pink];
    final xs = [0.28, 0.42, 0.56, 0.70];
    final hs = [0.22, 0.34, 0.28, 0.42];
    for (var i = 0; i < xs.length; i++) {
      final x = size.width * xs[i];
      final top = baseY - size.height * hs[i];
      canvas.drawRRect(
        RRect.fromRectAndRadius(
          Rect.fromLTRB(x - size.width * 0.045, top, x + size.width * 0.045, baseY),
          Radius.circular(size.width * 0.03),
        ),
        _fill(colors[i]),
      );
    }
  }

  void _candles(Canvas canvas, Size size) {
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(size.width * 0.14, size.height * 0.16, size.width * 0.72, size.height * 0.68),
        Radius.circular(size.width * 0.12),
      ),
      _fill(const Color(0xFFDCFCE7)),
    );

    void candle(double cx, double top, double bodyTop, double bodyBot, double bot, Color body) {
      canvas.drawLine(
        Offset(cx, top),
        Offset(cx, bot),
        _stroke(const Color(0xFF14532D), size.width * 0.04),
      );
      canvas.drawRRect(
        RRect.fromRectAndRadius(
          Rect.fromLTRB(cx - size.width * 0.075, bodyTop, cx + size.width * 0.075, bodyBot),
          Radius.circular(size.width * 0.025),
        ),
        _fill(body),
      );
    }

    candle(size.width * 0.30, size.height * 0.24, size.height * 0.34, size.height * 0.58, size.height * 0.70, _red);
    candle(size.width * 0.50, size.height * 0.20, size.height * 0.28, size.height * 0.62, size.height * 0.74, _green);
    candle(size.width * 0.70, size.height * 0.30, size.height * 0.38, size.height * 0.54, size.height * 0.66, _gold);
  }

  void _cePe(Canvas canvas, Size size) {
    // Twin chips
    final ce = RRect.fromRectAndRadius(
      Rect.fromLTWH(size.width * 0.12, size.height * 0.28, size.width * 0.36, size.height * 0.40),
      Radius.circular(size.width * 0.1),
    );
    final pe = RRect.fromRectAndRadius(
      Rect.fromLTWH(size.width * 0.52, size.height * 0.28, size.width * 0.36, size.height * 0.40),
      Radius.circular(size.width * 0.1),
    );
    canvas.drawRRect(ce, _fill(_green));
    canvas.drawRRect(pe, _fill(_red));

    void label(String text, RRect box) {
      final tp = TextPainter(
        text: TextSpan(
          text: text,
          style: TextStyle(
            fontFamily: 'Nunito',
            fontWeight: FontWeight.w900,
            fontSize: size.width * 0.18,
            color: Colors.white,
          ),
        ),
        textDirection: TextDirection.ltr,
      )..layout();
      tp.paint(
        canvas,
        Offset(
          box.center.dx - tp.width / 2,
          box.center.dy - tp.height / 2,
        ),
      );
    }

    label('CE', ce);
    label('PE', pe);
  }

  void _target(Canvas canvas, Size size) {
    final c = Offset(size.width / 2, size.height / 2);
    canvas.drawCircle(c, size.width * 0.34, _fill(const Color(0xFFFCE7F3)));
    canvas.drawCircle(c, size.width * 0.34, _stroke(_pink, size.width * 0.05));
    canvas.drawCircle(c, size.width * 0.22, _stroke(_violet, size.width * 0.05));
    canvas.drawCircle(c, size.width * 0.10, _fill(_indigo));
    canvas.drawCircle(c, size.width * 0.04, _fill(Colors.white));
    // Crosshair ticks
    final tick = _stroke(_violet, size.width * 0.045);
    canvas.drawLine(Offset(c.dx, c.dy - size.height * 0.40), Offset(c.dx, c.dy - size.height * 0.30), tick);
    canvas.drawLine(Offset(c.dx, c.dy + size.height * 0.30), Offset(c.dx, c.dy + size.height * 0.40), tick);
    canvas.drawLine(Offset(c.dx - size.width * 0.40, c.dy), Offset(c.dx - size.width * 0.30, c.dy), tick);
    canvas.drawLine(Offset(c.dx + size.width * 0.30, c.dy), Offset(c.dx + size.width * 0.40, c.dy), tick);
  }

  void _crypto(Canvas canvas, Size size) {
    final c = Offset(size.width / 2, size.height / 2);
    canvas.drawCircle(c, size.width * 0.34, _fill(const Color(0xFFFEF3C7)));
    canvas.drawCircle(c, size.width * 0.34, _stroke(_orange, size.width * 0.05));
    canvas.drawCircle(c, size.width * 0.26, _fill(_gold));
    final tp = TextPainter(
      text: TextSpan(
        text: '₿',
        style: TextStyle(
          fontFamily: 'Nunito',
          fontWeight: FontWeight.w900,
          fontSize: size.width * 0.34,
          color: Colors.white,
        ),
      ),
      textDirection: TextDirection.ltr,
    )..layout();
    tp.paint(canvas, Offset(c.dx - tp.width / 2, c.dy - tp.height / 2));
  }

  void _arrowUp(Canvas canvas, Size size) {
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(size.width * 0.14, size.height * 0.16, size.width * 0.72, size.height * 0.68),
        Radius.circular(size.width * 0.12),
      ),
      _fill(const Color(0xFFCCFBF1)),
    );
    final path = Path()
      ..moveTo(size.width * 0.22, size.height * 0.68)
      ..lineTo(size.width * 0.38, size.height * 0.48)
      ..lineTo(size.width * 0.50, size.height * 0.56)
      ..lineTo(size.width * 0.74, size.height * 0.30);
    canvas.drawPath(path, _stroke(_teal, size.width * 0.07));
    final head = Path()
      ..moveTo(size.width * 0.58, size.height * 0.28)
      ..lineTo(size.width * 0.78, size.height * 0.28)
      ..lineTo(size.width * 0.78, size.height * 0.48)
      ..close();
    canvas.drawPath(head, _fill(_teal));
    // Accent spark
    canvas.drawCircle(Offset(size.width * 0.74, size.height * 0.30), size.width * 0.045, _fill(_gold));
  }

  @override
  bool shouldRepaint(covariant _GlyphPainter oldDelegate) => oldDelegate.kind != kind;
}
