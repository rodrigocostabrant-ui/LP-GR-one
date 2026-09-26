// Gera components/three/gr-glyph.json: o monograma "GR" (Archivo 800, largura 112,
// tracking -0,05em) convertido em polígonos e cortado nas 4 fatias da especificação
// (0–32–50–68–100% da altura). Rodar com `npm run build:glyph` ao trocar fonte ou cortes.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as fontkit from "fontkit";
import polygonClipping from "polygon-clipping";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const FONT = path.join(root, "scripts/assets/archivo-latin-variable.woff2");
const OUT = path.join(root, "components/three/gr-glyph.json");
const CUTS = [0, 0.32, 0.5, 0.68, 1];
const TRACKING = -0.05;
const CURVE_STEPS = 12;

// `getVariation` do fontkit reabre o stream do woff2 ainda comprimido e falha.
// Mesmo efeito: aplicar as coordenadas na própria fonte antes do primeiro glifo.
const font = fontkit.openSync(FONT);
const AXES = { wght: 800, wdth: 112 };
font._variationCoords = font.fvar.axis.map((a) => AXES[a.axisTag.trim()] ?? a.defaultValue);
const glyphs = [..."GR"].map((ch) => font.glyphForCodePoint(ch.codePointAt(0)));
const run = { glyphs, positions: glyphs.map((g) => ({ xAdvance: g.advanceWidth })) };

function flatten(commands, dx) {
  const contours = [];
  let cur = null;
  let px = 0;
  let py = 0;
  const push = (x, y) => {
    cur.push([x + dx, y]);
    px = x;
    py = y;
  };
  for (const { command, args } of commands) {
    if (command === "moveTo") {
      if (cur && cur.length > 2) contours.push(cur);
      cur = [];
      push(args[0], args[1]);
    } else if (command === "lineTo") {
      push(args[0], args[1]);
    } else if (command === "quadraticCurveTo") {
      const [cx, cy, x, y] = args;
      const x0 = px;
      const y0 = py;
      for (let i = 1; i <= CURVE_STEPS; i++) {
        const t = i / CURVE_STEPS;
        const u = 1 - t;
        push(u * u * x0 + 2 * u * t * cx + t * t * x, u * u * y0 + 2 * u * t * cy + t * t * y);
      }
    } else if (command === "bezierCurveTo") {
      const [c1x, c1y, c2x, c2y, x, y] = args;
      const x0 = px;
      const y0 = py;
      for (let i = 1; i <= CURVE_STEPS; i++) {
        const t = i / CURVE_STEPS;
        const u = 1 - t;
        push(
          u * u * u * x0 + 3 * u * u * t * c1x + 3 * u * t * t * c2x + t * t * t * x,
          u * u * u * y0 + 3 * u * u * t * c1y + 3 * u * t * t * c2y + t * t * t * y,
        );
      }
    } else if (command === "closePath") {
      if (cur && cur.length > 2) contours.push(cur);
      cur = null;
    }
  }
  if (cur && cur.length > 2) contours.push(cur);
  return contours;
}

function signedArea(ring) {
  let a = 0;
  for (let i = 0; i < ring.length; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[(i + 1) % ring.length];
    a += x1 * y2 - x2 * y1;
  }
  return a / 2;
}

// Regra nonzero: fontes variáveis mantêm contornos sobrepostos, então une os
// externos e subtrai os furos (orientação oposta à do maior contorno).
let penX = 0;
const contours = [];
run.glyphs.forEach((glyph, i) => {
  contours.push(...flatten(glyph.path.commands, penX));
  penX += run.positions[i].xAdvance + TRACKING * font.unitsPerEm;
});
const outerSign = Math.sign(signedArea(contours.reduce((a, b) => (Math.abs(signedArea(b)) > Math.abs(signedArea(a)) ? b : a))));
const close = (r) => [...r, r[0]];
const outers = contours.filter((c) => Math.sign(signedArea(c)) === outerSign).map((c) => [close(c)]);
const holes = contours.filter((c) => Math.sign(signedArea(c)) !== outerSign).map((c) => [close(c)]);
let shape = polygonClipping.union(...outers);
if (holes.length) shape = polygonClipping.difference(shape, ...holes);

let minX = Infinity;
let minY = Infinity;
let maxX = -Infinity;
let maxY = -Infinity;
for (const poly of shape) for (const [x, y] of poly[0]) {
  minX = Math.min(minX, x);
  maxX = Math.max(maxX, x);
  minY = Math.min(minY, y);
  maxY = Math.max(maxY, y);
}
const H = maxY - minY;
const cx = (minX + maxX) / 2;
const cy = (minY + maxY) / 2;
const norm = (mp) =>
  mp.map((poly) => poly.map((ring) => ring.slice(0, -1).map(([x, y]) => [+((x - cx) / H).toFixed(5), +((y - cy) / H).toFixed(5)])));

const width = (maxX - minX) / H;
const bands = [];
for (let i = 0; i < CUTS.length - 1; i++) {
  const top = maxY - CUTS[i] * H;
  const bottom = maxY - CUTS[i + 1] * H;
  const rect = [[[minX - 10, bottom], [maxX + 10, bottom], [maxX + 10, top], [minX - 10, top], [minX - 10, bottom]]];
  bands.push({
    top: +((top - cy) / H).toFixed(5),
    bottom: +((bottom - cy) / H).toFixed(5),
    polygons: norm(polygonClipping.intersection(shape, rect)),
  });
}

// Altura do glifo em "corpos" (em): converte medidas da especificação dadas em
// relação ao tamanho da fonte (extrusão 11%, chanfro 1%) para a unidade do modelo.
const capHeightInEm = H / font.unitsPerEm;
fs.writeFileSync(
  OUT,
  JSON.stringify({ source: "Archivo wght 800 wdth 112, tracking -0.05em", width: +width.toFixed(5), capHeightInEm: +capHeightInEm.toFixed(5), cuts: CUTS, whole: norm(shape), bands }),
);
console.log(`gr-glyph.json: width ${width.toFixed(3)} × height 1, capHeight ${capHeightInEm.toFixed(3)}em, ${bands.map((b) => b.polygons.length).join("/")} polígonos por fatia`);
