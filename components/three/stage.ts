import * as THREE from "three";
import { toCreasedNormals } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { motion, motionState } from "@/lib/motion/engine";
import glyph from "./gr-glyph.json";

/**
 * Palco WebGL único da página: um renderer, um canvas fixo em tela cheia e o
 * monograma "GR" desenhado dentro do retângulo de cada marca (scissor). Só
 * renderiza quando alguma marca está na tela; limpa uma vez ao sair.
 *
 * Unidades: 1 unidade = altura da caixa-alta do "GR". As medidas da
 * especificação vêm em relação ao corpo da fonte (S) — `EM` converte.
 */

export interface MarkState {
  /** dispersão das fatias (0 = inteiro) */
  a: number;
  /** vista explodida axonométrica (reorganização) */
  b: number;
  /** rotações em graus, na convenção CSS do protótipo */
  rx: number;
  ry: number;
  /** deslocamento vertical em px (convenção CSS: + para baixo) */
  y: number;
  scale: number;
}

export interface MarkHandle {
  el: HTMLElement;
  /** estado do quadro atual, escrito pela seção na fase `update` */
  getState: () => MarkState;
  /** altura desejada da caixa-alta do "GR", em px */
  glyphPx: () => number;
}

interface MarkEntry extends MarkHandle {
  group: THREE.Group;
  whole: THREE.Mesh;
  slices: THREE.Mesh[];
  camera: THREE.PerspectiveCamera;
  rect: DOMRect | null;
}

const EM = 1 / glyph.capHeightInEm;
const DEPTH = 0.11 * EM;
const BEVEL = 0.006 * EM;
/** perspective: S × 4,5 no protótipo */
const CAMERA_DISTANCE = 4.5 * EM;
/** Vetores de dispersão por fatia [x, y, z, rotY, rotZ] — `FR` do protótipo. */
const FR: [number, number, number, number, number][] = [
  [-0.24, -0.12, 0.38, -24, -5],
  [0.18, -0.04, -0.22, 15, 3],
  [-0.12, 0.05, 0.5, -11, -2],
  [0.28, 0.13, -0.32, 26, 6],
];
const DEG = Math.PI / 180;

/** Abaixo disso as fatias estão encostadas: mostra o "GR" inteiriço, sem os chanfros dos cortes. */
const WHOLE_BELOW = 0.004;

function extrude(polygons: number[][][][]) {
  const shapes = polygons.map((polygon) => {
    const [outer, ...holes] = polygon;
    const shape = new THREE.Shape(outer.map(([x, y]) => new THREE.Vector2(x, y)));
    shape.holes = holes.map((h) => new THREE.Path(h.map(([x, y]) => new THREE.Vector2(x, y))));
    return shape;
  });
  const geo = new THREE.ExtrudeGeometry(shapes, {
    depth: DEPTH,
    curveSegments: 1,
    bevelEnabled: true,
    bevelThickness: BEVEL,
    bevelSize: BEVEL,
    bevelOffset: -BEVEL,
    bevelSegments: 1,
  });
  geo.translate(0, 0, -DEPTH / 2);
  // Laterais lisas nas curvas e retas do contorno vetorizado (normais chapadas por
  // segmento "tracejavam" o reflexo); cantos acima de 35° e o chanfro continuam vivos.
  // A função agrupa vértices numa grade de 0,01 — mais grossa que o chanfro nesta
  // escala, por isso a ampliação temporária.
  geo.scale(1000, 1000, 1000);
  toCreasedNormals(geo, 35 * DEG);
  geo.scale(0.001, 0.001, 0.001);
  return geo;
}

/**
 * Estúdio escuro gerado em código (sem HDR externo): tira de luz fria à
 * esquerda (a faixa que atravessa a face ao girar), softbox alto e recorte
 * azul-gelo por trás à direita — a iluminação da seção "06 Objeto 3D".
 */
function buildEnvironment(renderer: THREE.WebGLRenderer) {
  const env = new THREE.Scene();

  // Cúpula em degradê (teto claro → horizonte aço → chão escuro): qualquer
  // direção de reflexo pega um prata médio; os painéis abaixo são só os destaques.
  // Sem ela, ângulos que refletiam o "vazio" deixavam o metal preto.
  const dome = new THREE.SphereGeometry(30, 48, 24);
  const stops: [number, THREE.Color][] = [
    [-1, new THREE.Color("#141b27")],
    [-0.15, new THREE.Color("#394358")],
    [0.1, new THREE.Color("#3e4a63")],
    [1, new THREE.Color("#9aa8c4").multiplyScalar(1.2)],
  ];
  const colors: number[] = [];
  const pos = dome.attributes.position;
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const h = pos.getY(i) / 30;
    const k = stops.findIndex(([at]) => at >= h);
    const [a0, c0] = stops[Math.max(0, k - 1)];
    const [a1, c1] = stops[Math.max(0, k)];
    c.copy(c0).lerp(c1, a1 === a0 ? 0 : (h - a0) / (a1 - a0));
    colors.push(c.r, c.g, c.b);
  }
  dome.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  env.add(new THREE.Mesh(dome, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));

  const panel =(w: number, h: number, color: string, intensity: number, pos: [number, number, number]) => {
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    mesh.position.set(...pos);
    mesh.lookAt(0, 0, 0);
    env.add(mesh);
  };
  // Softbox atrás da câmera: de frente a face espelha a faixa y ≈ -1..1 deste plano.
  // Metade de cima forte, de baixo fraca = degradê prata do design (branco no topo,
  // grafite na base). O painel fraco segura o brilho quando o mouse inclina o objeto
  // para baixo (±9° desloca o reflexo ~18°) — sem ele o "GR" apagava perto dos CTAs.
  panel(7, 2.4, "#DDE5F5", 2.8, [0, 1.6, 7]);
  panel(7, 2.4, "#C4CEE2", 1.1, [0, -0.8, 7]);
  panel(1.2, 9, "#EEF2FF", 12, [-5, 0.5, 2.5]);
  panel(0.5, 7, "#FFFFFF", 9, [-2.4, 0, 5.5]);
  panel(8, 2.5, "#C9D4EA", 2.4, [0, 6, 1]);
  panel(2.4, 6, "#C9D6F2", 2.6, [7, 0.8, 0.3]);
  panel(1.4, 8, "#AFC4FF", 8, [5, 0.5, -3.5]);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const target = pmrem.fromScene(env, 0.035);
  pmrem.dispose();
  env.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      o.geometry.dispose();
      (o.material as THREE.Material).dispose();
    }
  });
  return target;
}

export class GRStage {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private envTarget: THREE.WebGLRenderTarget;
  private geometries: THREE.ExtrudeGeometry[];
  private wholeGeometry: THREE.ExtrudeGeometry;
  private materials: THREE.MeshPhysicalMaterial[];
  private marks = new Set<MarkEntry>();
  private drewLastFrame = false;
  private width = 0;
  private height = 0;
  private offs: (() => void)[] = [];
  onContextLost: (() => void) | null = null;

  constructor(private canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.autoClear = false;

    this.envTarget = buildEnvironment(this.renderer);
    this.scene.environment = this.envTarget.texture;

    // Luz de chave fria à esquerda e recorte azul por trás: dão o brilho especular
    // nas arestas chanfradas que o mapa de ambiente sozinho deixa suave.
    const key = new THREE.DirectionalLight("#DCE4FF", 1.6);
    key.position.set(-4, 2.5, 5);
    const rim = new THREE.DirectionalLight("#AFC4FF", 3.2);
    rim.position.set(4, 1.2, -4);
    this.scene.add(key, rim);

    this.geometries = glyph.bands.map((band) => extrude(band.polygons));
    this.wholeGeometry = extrude(glyph.whole);
    this.materials = [
      // Face: prata escovada (anisotropia horizontal), a faixa de luz corre por ela.
      new THREE.MeshPhysicalMaterial({ color: "#E6EAF0", metalness: 1, roughness: 0.24, anisotropy: 0.6, envMapIntensity: 1.35 }),
      // Laterais e chanfro: aço que escurece, pega o recorte azul.
      new THREE.MeshPhysicalMaterial({ color: "#566074", metalness: 1, roughness: 0.34, envMapIntensity: 0.95 }),
    ];

    this.resize();
    this.canvas.addEventListener("webglcontextlost", this.handleContextLost);
    this.offs.push(
      motion.onResize(() => this.resize()),
      motion.onTick("measure", () => this.measure()),
      motion.onTick("render", () => this.render()),
    );
  }

  private handleContextLost = (e: Event) => {
    e.preventDefault();
    this.onContextLost?.();
  };

  add(handle: MarkHandle): MarkEntry {
    const group = new THREE.Group();
    const slices = this.geometries.map((geo) => {
      const mesh = new THREE.Mesh(geo, this.materials);
      group.add(mesh);
      return mesh;
    });
    const whole = new THREE.Mesh(this.wholeGeometry, this.materials);
    group.add(whole);
    group.visible = false;
    this.scene.add(group);
    const entry: MarkEntry = { ...handle, group, whole, slices, camera: new THREE.PerspectiveCamera(30, 1, 0.1, 100), rect: null };
    entry.camera.position.set(0, 0, CAMERA_DISTANCE);
    this.marks.add(entry);
    return entry;
  }

  remove(entry: MarkEntry) {
    this.scene.remove(entry.group);
    this.marks.delete(entry);
  }

  private resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, motionState.vw < 760 ? 1.5 : 1.75);
    this.width = this.canvas.clientWidth;
    this.height = this.canvas.clientHeight;
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(this.width, this.height, false);
  }

  private measure() {
    this.marks.forEach((m) => {
      const r = m.el.getBoundingClientRect();
      const off = r.bottom < 0 || r.top > this.height || r.right < 0 || r.left > this.width || r.width === 0;
      m.rect = off ? null : r;
    });
  }

  private applyState(m: MarkEntry) {
    const { a, b, rx, ry, y, scale } = m.getState();
    const g = m.glyphPx();
    // CSS `rotateX(rx) rotateY(ry)` = Rx·Ry = ordem de Euler "XYZ" (eixo Y do CSS aponta para baixo).
    m.group.rotation.set(-rx * DEG, ry * DEG, 0, "XYZ");
    m.group.position.set(0, -y / g, 0);
    m.group.scale.setScalar(scale);
    const closed = a + b < WHOLE_BELOW;
    m.whole.visible = closed;
    m.slices.forEach((mesh, s) => {
      mesh.visible = !closed;
      const [dx, dy, dz, rotY, rotZ] = FR[s];
      const e = s - 1.5;
      mesh.position.set(a * dx * EM, -(a * dy + b * e * 0.1) * EM, (a * dz - b * e * 0.22) * EM);
      mesh.rotation.set(0, a * rotY * DEG, -a * rotZ * DEG);
    });
  }

  private render() {
    const visible = [...this.marks].filter((m) => m.rect);
    if (!visible.length && !this.drewLastFrame) return;
    const r = this.renderer;
    r.setScissorTest(false);
    r.clear();
    this.drewLastFrame = visible.length > 0;
    if (!visible.length) return;

    r.setScissorTest(true);
    this.marks.forEach((m) => (m.group.visible = false));
    for (const m of visible) {
      const rect = m.rect!;
      const g = m.glyphPx();
      this.applyState(m);
      // fov que faz 1 unidade = `g` px no plano do objeto, à distância de S × 4,5.
      m.camera.fov = 2 * Math.atan(rect.height / g / 2 / CAMERA_DISTANCE) / DEG;
      m.camera.aspect = rect.width / rect.height;
      m.camera.updateProjectionMatrix();
      const bottom = this.height - rect.bottom;
      r.setViewport(rect.left, bottom, rect.width, rect.height);
      r.setScissor(rect.left, bottom, rect.width, rect.height);
      m.group.visible = true;
      r.render(this.scene, m.camera);
      m.group.visible = false;
    }
    r.setScissorTest(false);
  }

  dispose() {
    this.offs.forEach((off) => off());
    this.canvas.removeEventListener("webglcontextlost", this.handleContextLost);
    this.geometries.forEach((g) => g.dispose());
    this.wholeGeometry.dispose();
    this.materials.forEach((m) => m.dispose());
    this.envTarget.dispose();
    this.renderer.dispose();
    this.marks.clear();
  }
}
