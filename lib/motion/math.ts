export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Smoothstep entre `a` e `b` — o mesmo `ss()` do protótipo da v2. */
export function smoothstep(a: number, b: number, x: number) {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
}

/** Desaceleração cúbica — o `ez()` do protótipo. */
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);

/**
 * Fator de interpolação independente da taxa de quadros: `perFrame` é o valor
 * especificado para 60fps (ex.: 0.06 no objeto, 0.2 no anel do cursor).
 */
export const frameLerp = (perFrame: number, dtMs: number) => 1 - Math.pow(1 - perFrame, dtMs / (1000 / 60));

/** Curva cúbica de Bézier como função JS, para usar os tokens CSS também no JS. */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const slopeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 6; i++) {
      const err = sampleX(t) - x;
      const d = slopeX(t);
      if (Math.abs(err) < 1e-5 || Math.abs(d) < 1e-6) break;
      t -= err / d;
    }
    return sampleY(clamp01(t));
  };
}
