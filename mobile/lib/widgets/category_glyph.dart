import 'package:flutter/material.dart';

import '../theme/colors.dart';

/// Original category glyphs inspired by edtech grids — not 1:1 copies of any
/// third-party icon set.
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

  @override
  void paint(Canvas canvas, Size size) {
    final ink = Paint()
      ..color = BgColors.inkDeep.withOpacity(0.88)
      ..style = PaintingStyle.stroke
      ..strokeWidth = size.width * 0.055
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;
    final fill = Paint()
      ..color = BgColors.indigo.withOpacity(0.14)
      ..style = PaintingStyle.fill;
    final accent = Paint()
      ..color = BgColors.indigo
      ..style = PaintingStyle.fill;

    switch (kind) {
      case 'bars':
        _bars(canvas, size, ink, fill);
      case 'candle':
        _candles(canvas, size, ink, accent);
      case 'cepe':
        _cePe(canvas, size, ink, accent);
      case 'strategy':
        _target(canvas, size, ink, accent);
      case 'mentorship':
        _chess(canvas, size, ink, fill);
      case 'crypto':
        _crypto(canvas, size, ink, accent);
      case 'algo':
        _algo(canvas, size, ink, accent);
      case 'investing':
        _arrowUp(canvas, size, ink, accent);
      case 'nism':
        _nism(canvas, size, ink, fill);
      default:
        _bars(canvas, size, ink, fill);
    }
  }

  void _bars(Canvas canvas, Size size, Paint ink, Paint fill) {
    final r = RRect.fromRectAndRadius(
      Rect.fromLTWH(size.width * 0.18, size.height * 0.22, size.width * 0.64, size.height * 0.56),
      Radius.circular(size.width * 0.08),
    );
    canvas.drawRRect(r, fill);
    final baseY = size.height * 0.72;
    final xs = [0.28, 0.44, 0.60, 0.76];
    final hs = [0.28, 0.42, 0.34, 0.48];
    for (var i = 0; i < xs.length; i++) {
      final x = size.width * xs[i];
      canvas.drawLine(
        Offset(x, baseY),
        Offset(x, baseY - size.height * hs[i]),
        ink..strokeWidth = size.width * 0.07,
      );
    }
  }

  void _candles(Canvas canvas, Size size, Paint ink, Paint accent) {
    void candle(double cx, double top, double bodyTop, double bodyBot, double bot, {bool up = true}) {
      canvas.drawLine(Offset(cx, top), Offset(cx, bot), ink..strokeWidth = size.width * 0.035);
      final rect = RRect.fromRectAndRadius(
        Rect.fromLTRB(cx - size.width * 0.07, bodyTop, cx + size.width * 0.07, bodyBot),
        Radius.circular(size.width * 0.02),
      );
      canvas.drawRRect(rect, up ? accent : (Paint()..color = BgColors.magenta));
    }

    candle(size.width * 0.30, size.height * 0.22, size.height * 0.32, size.height * 0.58, size.height * 0.70, up: false);
    candle(size.width * 0.50, size.height * 0.18, size.height * 0.28, size.height * 0.62, size.height * 0.74);
    candle(size.width * 0.70, size.height * 0.30, size.height * 0.38, size.height * 0.55, size.height * 0.66);
  }

  void _cePe(Canvas canvas, Size size, Paint ink, Paint accent) {
    final tp = TextPainter(
      text: TextSpan(
        children: [
          TextSpan(
            text: 'CE',
            style: TextStyle(
              fontFamily: 'Nunito',
              fontWeight: FontWeight.w800,
              fontSize: size.width * 0.22,
              color: BgColors.indigo,
            ),
          ),
          TextSpan(
            text: '/',
            style: TextStyle(
              fontFamily: 'Nunito',
              fontWeight: FontWeight.w700,
              fontSize: size.width * 0.2,
              color: BgColors.muted,
            ),
          ),
          TextSpan(
            text: 'PE',
            style: TextStyle(
              fontFamily: 'Nunito',
              fontWeight: FontWeight.w800,
              fontSize: size.width * 0.22,
              color: BgColors.magenta,
            ),
          ),
        ],
      ),
      textDirection: TextDirection.ltr,
    )..layout();
    tp.paint(
      canvas,
      Offset((size.width - tp.width) / 2, (size.height - tp.height) / 2),
    );
    canvas.drawCircle(Offset(size.width * 0.18, size.height * 0.22), size.width * 0.035, accent);
    canvas.drawCircle(Offset(size.width * 0.82, size.height * 0.78), size.width * 0.035, Paint()..color = BgColors.magenta);
  }

  void _target(Canvas canvas, Size size, Paint ink, Paint accent) {
    final c = Offset(size.width / 2, size.height / 2);
    canvas.drawCircle(c, size.width * 0.28, ink);
    canvas.drawCircle(c, size.width * 0.17, ink);
    canvas.drawCircle(c, size.width * 0.06, accent);
    canvas.drawLine(Offset(c.dx, c.dy - size.height * 0.38), Offset(c.dx, c.dy - size.height * 0.28), ink);
    canvas.drawLine(Offset(c.dx, c.dy + size.height * 0.28), Offset(c.dx, c.dy + size.height * 0.38), ink);
    canvas.drawLine(Offset(c.dx - size.width * 0.38, c.dy), Offset(c.dx - size.width * 0.28, c.dy), ink);
    canvas.drawLine(Offset(c.dx + size.width * 0.28, c.dy), Offset(c.dx + size.width * 0.38, c.dy), ink);
  }

  void _chess(Canvas canvas, Size size, Paint ink, Paint fill) {
    final path = Path()
      ..moveTo(size.width * 0.50, size.height * 0.18)
      ..quadraticBezierTo(size.width * 0.62, size.height * 0.28, size.width * 0.58, size.height * 0.40)
      ..lineTo(size.width * 0.62, size.height * 0.52)
      ..lineTo(size.width * 0.38, size.height * 0.52)
      ..lineTo(size.width * 0.42, size.height * 0.40)
      ..quadraticBezierTo(size.width * 0.38, size.height * 0.28, size.width * 0.50, size.height * 0.18)
      ..close();
    canvas.drawPath(path, fill);
    canvas.drawPath(path, ink);
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromCenter(center: Offset(size.width * 0.50, size.height * 0.66), width: size.width * 0.36, height: size.height * 0.10),
        Radius.circular(size.width * 0.03),
      ),
      ink,
    );
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromCenter(center: Offset(size.width * 0.50, size.height * 0.78), width: size.width * 0.48, height: size.height * 0.08),
        Radius.circular(size.width * 0.03),
      ),
      ink,
    );
  }

  void _crypto(Canvas canvas, Size size, Paint ink, Paint accent) {
    final c = Offset(size.width / 2, size.height / 2);
    canvas.drawCircle(c, size.width * 0.30, ink);
    final tp = TextPainter(
      text: TextSpan(
        text: '₿',
        style: TextStyle(
          fontFamily: 'Nunito',
          fontWeight: FontWeight.w900,
          fontSize: size.width * 0.36,
          color: BgColors.indigo,
        ),
      ),
      textDirection: TextDirection.ltr,
    )..layout();
    tp.paint(canvas, Offset(c.dx - tp.width / 2, c.dy - tp.height / 2));
  }

  void _algo(Canvas canvas, Size size, Paint ink, Paint accent) {
    final path = Path()
      ..moveTo(size.width * 0.22, size.height * 0.35)
      ..lineTo(size.width * 0.38, size.height * 0.50)
      ..lineTo(size.width * 0.22, size.height * 0.65);
    canvas.drawPath(path, ink..strokeWidth = size.width * 0.06);
    final path2 = Path()
      ..moveTo(size.width * 0.78, size.height * 0.35)
      ..lineTo(size.width * 0.62, size.height * 0.50)
      ..lineTo(size.width * 0.78, size.height * 0.65);
    canvas.drawPath(path2, ink);
    canvas.drawLine(
      Offset(size.width * 0.46, size.height * 0.72),
      Offset(size.width * 0.58, size.height * 0.28),
      ink..strokeWidth = size.width * 0.055,
    );
  }

  void _arrowUp(Canvas canvas, Size size, Paint ink, Paint accent) {
    final path = Path()
      ..moveTo(size.width * 0.22, size.height * 0.68)
      ..lineTo(size.width * 0.38, size.height * 0.48)
      ..lineTo(size.width * 0.50, size.height * 0.56)
      ..lineTo(size.width * 0.78, size.height * 0.28);
    canvas.drawPath(path, ink..strokeWidth = size.width * 0.06);
    final head = Path()
      ..moveTo(size.width * 0.62, size.height * 0.28)
      ..lineTo(size.width * 0.78, size.height * 0.28)
      ..lineTo(size.width * 0.78, size.height * 0.44)
      ..close();
    canvas.drawPath(head, accent);
  }

  void _nism(Canvas canvas, Size size, Paint ink, Paint fill) {
    final r = RRect.fromRectAndRadius(
      Rect.fromLTWH(size.width * 0.22, size.height * 0.22, size.width * 0.56, size.height * 0.56),
      Radius.circular(size.width * 0.08),
    );
    canvas.drawRRect(r, fill);
    canvas.drawRRect(r, ink);
    final tp = TextPainter(
      text: const TextSpan(
        text: 'NISM',
        style: TextStyle(
          fontFamily: 'Nunito',
          fontWeight: FontWeight.w900,
          fontSize: 11,
          color: BgColors.indigoDark,
          letterSpacing: 0.4,
        ),
      ),
      textDirection: TextDirection.ltr,
    )..layout(maxWidth: size.width * 0.5);
    // Scale text to fit.
    final scale = (size.width * 0.42) / tp.width;
    canvas.save();
    canvas.translate(size.width / 2, size.height / 2);
    canvas.scale(scale);
    tp.paint(canvas, Offset(-tp.width / 2, -tp.height / 2));
    canvas.restore();
  }

  @override
  bool shouldRepaint(covariant _GlyphPainter oldDelegate) => oldDelegate.kind != kind;
}
