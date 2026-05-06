window.XM = window.XM || {};
window.XM.Math = window.XM.Math || {};

Object.assign(window.XM.Math, {
  distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  },

  distancePointToSegment(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lengthSq = dx * dx + dy * dy;
    if (lengthSq === 0) return Math.hypot(px - x1, py - y1);
    const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lengthSq));
    const cx = x1 + t * dx;
    const cy = y1 + t * dy;
    return Math.hypot(px - cx, py - cy);
  },
});
