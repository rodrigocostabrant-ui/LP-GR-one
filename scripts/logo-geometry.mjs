// Lê a logo vetorizada (Lp design/logo/gr-one-logo.svg) e devolve cada path como
// anéis de polígono em pixels da imagem original (y para baixo).
import fs from "node:fs";

const CURVE_STEPS = 6;

export function readLogoPaths(file) {
  const svg = fs.readFileSync(file, "utf8");
  const get = (id) => svg.match(new RegExp(`id="${id}"[^>]*? d="([^"]+)"`))[1];
  return { monograma: get("monograma"), nome: get("nome") };
}

/**
 * Só M, L, C e Z absolutos (a saída do potrace), com repetição implícita de coordenadas.
 * `tolerance`: desvio máximo da simplificação, em pixels da imagem de origem (~141px de altura).
 */
export function pathToRings(d, tolerance, minSegment = tolerance * 6) {
  const tokens = d.match(/[A-Za-z]|-?\d*\.?\d+(?:e-?\d+)?/g);
  const rings = [];
  let ring = null;
  let cmd = "";
  let i = 0;
  const num = () => Number(tokens[i++]);
  const close = () => {
    if (ring && ring.length > 2) rings.push(simplify(ring, tolerance, minSegment));
    ring = null;
  };
  while (i < tokens.length) {
    if (/[A-Za-z]/.test(tokens[i])) {
      cmd = tokens[i++];
      if (cmd === "Z" || cmd === "z") close();
      continue;
    }
    if (cmd === "M") {
      close();
      ring = [[num(), num()]];
      cmd = "L";
    } else if (cmd === "L") {
      ring.push([num(), num()]);
    } else if (cmd === "C") {
      const [x0, y0] = ring[ring.length - 1];
      const c1x = num(), c1y = num(), c2x = num(), c2y = num(), x = num(), y = num();
      for (let s = 1; s <= CURVE_STEPS; s++) {
        const t = s / CURVE_STEPS;
        const u = 1 - t;
        ring.push([
          u * u * u * x0 + 3 * u * u * t * c1x + 3 * u * t * t * c2x + t * t * t * x,
          u * u * u * y0 + 3 * u * u * t * c1y + 3 * u * t * t * c2y + t * t * t * y,
        ]);
      }
    } else {
      throw new Error(`comando de path não suportado: ${cmd}`);
    }
  }
  close();
  return rings;
}

function simplify(points, tolerance, minSegment) {
  const pts = points.filter((p, k) => k === 0 || p[0] !== points[k - 1][0] || p[1] !== points[k - 1][1]);
  if (pts.length > 1 && pts[0][0] === pts.at(-1)[0] && pts[0][1] === pts.at(-1)[1]) pts.pop();
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    const [ax, ay] = pts[a];
    const [bx, by] = pts[b];
    const len = Math.hypot(bx - ax, by - ay) || 1;
    let far = -1;
    let dist = tolerance;
    for (let k = a + 1; k < b; k++) {
      const dd = Math.abs((bx - ax) * (ay - pts[k][1]) - (ax - pts[k][0]) * (by - ay)) / len;
      if (dd > dist) {
        dist = dd;
        far = k;
      }
    }
    if (far > 0) {
      keep[far] = 1;
      stack.push([a, far], [far, b]);
    }
  }
  const kept = pts.filter((_, k) => keep[k]);
  // Segmentos mais curtos que o recuo do chanfro fazem o contorno recuado se cruzar
  // (pontinhos na face). Grupos de pontos próximos viram um só, no centro do grupo.
  const out = [];
  let group = [kept[0]];
  const flush = () => out.push([group.reduce((s, p) => s + p[0], 0) / group.length, group.reduce((s, p) => s + p[1], 0) / group.length]);
  for (let k = 1; k < kept.length; k++) {
    const last = group[group.length - 1];
    if (Math.hypot(kept[k][0] - last[0], kept[k][1] - last[1]) < minSegment) group.push(kept[k]);
    else {
      flush();
      group = [kept[k]];
    }
  }
  flush();
  const [fx, fy] = out[0];
  const [lx, ly] = out[out.length - 1];
  if (out.length > 3 && Math.hypot(fx - lx, fy - ly) < minSegment) {
    out[0] = [(fx + lx) / 2, (fy + ly) / 2];
    out.pop();
  }
  return out;
}

export function bounds(rings) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const r of rings) for (const [x, y] of r) {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }
  return { minX, minY, maxX, maxY };
}
