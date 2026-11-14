import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';

/// Continuous horizontal marquee that pauses while the user is touching it.
///
/// [reverse] false → content travels right → left.
/// [reverse] true  → content travels left → right.
class AutoMarquee extends StatefulWidget {
  const AutoMarquee({
    super.key,
    required this.height,
    required this.itemCount,
    required this.itemBuilder,
    required this.itemExtent,
    this.gap = 14,
    this.reverse = false,
    this.pixelsPerSecond = 28,
    this.padding = const EdgeInsets.symmetric(horizontal: 20),
    this.resumeAfterIdle = const Duration(milliseconds: 900),
  });

  final double height;
  final int itemCount;
  final IndexedWidgetBuilder itemBuilder;
  final double itemExtent;
  final double gap;
  final bool reverse;
  final double pixelsPerSecond;
  final EdgeInsets padding;
  final Duration resumeAfterIdle;

  @override
  State<AutoMarquee> createState() => _AutoMarqueeState();
}

class _AutoMarqueeState extends State<AutoMarquee>
    with SingleTickerProviderStateMixin {
  late final ScrollController _controller;
  Ticker? _ticker;
  Timer? _resumeTimer;
  bool _paused = false;
  bool _ready = false;
  Duration _lastElapsed = Duration.zero;

  static const int _loops = 6;

  double get _stride => widget.itemExtent + widget.gap;

  double get _loopWidth {
    if (widget.itemCount <= 0) return 1;
    return widget.itemCount * _stride;
  }

  @override
  void initState() {
    super.initState();
    _controller = ScrollController();
    _ticker = createTicker(_onTick);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted || !_controller.hasClients) return;
      _controller.jumpTo(_loopWidth * (_loops ~/ 2).toDouble());
      _ready = true;
      _lastElapsed = Duration.zero;
      _ticker?.start();
    });
  }

  void _onTick(Duration elapsed) {
    if (!_ready || _paused || !_controller.hasClients) {
      _lastElapsed = elapsed;
      return;
    }
    final dt = (elapsed - _lastElapsed).inMicroseconds / 1e6;
    _lastElapsed = elapsed;
    if (dt <= 0 || dt > 0.05) return;

    final delta = widget.pixelsPerSecond * dt;
    var next = _controller.offset + (widget.reverse ? -delta : delta);
    final loop = _loopWidth;
    if (loop <= 1) return;

    final low = loop * 1.5;
    final high = loop * (_loops - 1.5);
    if (next > high) next -= loop;
    if (next < low) next += loop;

    _controller.jumpTo(next.clamp(0.0, _controller.position.maxScrollExtent));
  }

  void _pause() {
    _resumeTimer?.cancel();
    _paused = true;
  }

  void _scheduleResume() {
    _resumeTimer?.cancel();
    _resumeTimer = Timer(widget.resumeAfterIdle, () {
      if (!mounted) return;
      _lastElapsed = Duration.zero;
      // Reset baseline on next tick.
      _paused = false;
    });
  }

  @override
  void dispose() {
    _resumeTimer?.cancel();
    _ticker?.dispose();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: widget.height,
      child: Listener(
        onPointerDown: (_) => _pause(),
        onPointerUp: (_) => _scheduleResume(),
        onPointerCancel: (_) => _scheduleResume(),
        child: ListView.builder(
          controller: _controller,
          scrollDirection: Axis.horizontal,
          physics: const BouncingScrollPhysics(),
          padding: widget.padding,
          itemCount: widget.itemCount <= 0 ? 0 : widget.itemCount * _loops,
          itemBuilder: (context, index) {
            final i = index % widget.itemCount;
            return Padding(
              padding: EdgeInsets.only(
                right: index == widget.itemCount * _loops - 1 ? 0 : widget.gap,
              ),
              child: SizedBox(
                width: widget.itemExtent,
                child: widget.itemBuilder(context, i),
              ),
            );
          },
        ),
      ),
    );
  }
}
