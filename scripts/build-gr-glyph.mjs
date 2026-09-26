// Gera, a partir da logo vetorizada (Lp design/logo/gr-one-logo.svg):
//  - components/three/gr-glyph.json: o monograma "GR" em polígonos, inteiro e cortado
//    nas 4 fatias da especificação (0–32–50–68–100% da altura), para o objeto 3D;
//  - components/ui/gr-logo-paths.ts: monograma e nome "GR ONE" como paths SVG (cabeçalho,
//    versão estática sem WebGL);
//  - app/icon.svg: ícone da aba.
// Rodar com `npm run build:glyph` ao trocar a logo ou os cortes.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import polygonClipping from "polygon-clipping";
import { bounds, pathToRings, readLogoPaths } from "./logo-geometry.mjs";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const LOGO = path.join(root, "Lp design/logo/gr-one-logo.svg");
const OUT = path.join(root, "components/three/gr-glyph.json");
const OUT_PATHS = path.join(root, "components/ui/gr-logo-paths.ts");
const CUTS = [0, 0.32, 0.5, 0.68, 1];
/**
 * Altura do monograma em "corpos" (em). Mantém a proporção usada pelo palco 3D
 * (extrusão 11% e chanfro 1% do corpo, câmera a 4,5 corpos) igual à da versão em Archivo.
 */
const CAP_HEIGHT_IN_EM = 0.71;

const paths = readLogoPaths(LOGO);
// 3D mais denso que o 2D; as normais das laterais são suavizadas no palco (stage.ts).
// Segmento mínimo 1,6px (> chanfro de ~1,2px da imagem de origem).
const solidRings = pathToRings(paths.monograma, 0.05, 1.6);
const monoRings = pathToRings(paths.monograma, 0.1);
const wordRings = pathToRings(paths.nome, 0.1);

// ── Objeto 3D ─────────────────────────────────────────────────────────────
// Imagem tem y para baixo; o modelo, y para cima.
const contours = solidRings.map((r) => r.map(([x, y]) => [x, -y]));

function signedArea(ring) {
  let a = 0;
  for (let i = 0; i < ring.length; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[(i + 1) % ring.length];
    a += x1 * y2 - x2 * y1;
  }
  return a / 2;
}

// Contornos com a orientação do maior são externos; os opostos, furos.
const outerSign = Math.sign(signedArea(contours.reduce((a, b) => (Math.abs(signedArea(b)) > Math.abs(signedArea(a)) ? b : a))));
const close = (r) => [...r, r[0]];
const outers = contours.filter((c) => Math.sign(signedArea(c)) === outerSign).map((c) => [close(c)]);
const holes = contours.filter((c) => Math.sign(signedArea(c)) !== outerSign).map((c) => [close(c)]);
let shape = polygonClipping.union(...outers);
if (holes.length) shape = polygonClipping.difference(shape, ...holes);

const { minX, minY, maxX, maxY } = bounds(shape.map((poly) => poly[0]));
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

fs.writeFileSync(
  OUT,
  JSON.stringify({ source: "Lp design/logo/gr-one-logo.svg (monograma)", width: +width.toFixed(5), capHeightInEm: CAP_HEIGHT_IN_EM, cuts: CUTS, whole: norm(shape), bands }),
);

// ── Paths 2D ──────────────────────────────────────────────────────────────
const d = (rings, ox, oy) =>
  rings.map((r) => "M" + r.map(([x, y]) => `${+(x - ox).toFixed(1)} ${+(y - oy).toFixed(1)}`).join("L") + "Z").join("");
const mb = bounds(monoRings);
const lb = bounds([...monoRings, ...wordRings]);
const box = (b) => `0 0 ${+(b.maxX - b.minX).toFixed(1)} ${+(b.maxY - b.minY).toFixed(1)}`;

fs.writeFileSync(
  OUT_PATHS,
  `// Gerado por scripts/build-gr-glyph.mjs a partir de Lp design/logo/gr-one-logo.svg — não editar.

/** Só o monograma "GR". */
export const MONOGRAM = { viewBox: "${box(mb)}", d: "${d(monoRings, mb.minX, mb.minY)}" };

/** Monograma + nome "GR ONE", no mesmo alinhamento da logo original. */
export const LOCKUP = {
  viewBox: "${box(lb)}",
  monogram: "${d(monoRings, lb.minX, lb.minY)}",
  name: "${d(wordRings, lb.minX, lb.minY)}",
};
`,
);

// Ícone da aba: monograma nas cores da logo (azul-marinho sobre creme), quadrado arredondado.
{
  const w = mb.maxX - mb.minX;
  const h = mb.maxY - mb.minY;
  const s = Math.max(w, h) + h * 0.32;
  const f = (n) => +n.toFixed(1);
  fs.writeFileSync(
    path.join(root, "app/icon.svg"),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f(s)} ${f(s)}"><rect width="100%" height="100%" rx="${f(s * 0.22)}" fill="#F0EFE7"/>` +
      `<path transform="translate(${f((s - w) / 2)} ${f((s - h) / 2)})" fill="#17375A" fill-rule="evenodd" d="${d(monoRings, mb.minX, mb.minY)}"/></svg>`,
  );
}

const count = (rs) => rs.reduce((n, r) => n + r.length, 0);
console.log(
  `gr-glyph.json: width ${width.toFixed(3)} × height 1, ${bands.map((b) => b.polygons.length).join("/")} polígonos por fatia; ` +
    `pontos: 3D ${count(solidRings)}, monograma ${count(monoRings)}, nome ${count(wordRings)}; gr-logo-paths.ts ${fs.statSync(OUT_PATHS).size} bytes`,
);
